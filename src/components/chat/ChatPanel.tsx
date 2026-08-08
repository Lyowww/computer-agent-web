"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { AppWindow, Cpu, PanelRightOpen } from "lucide-react";
import { listDevices } from "@/lib/api/devices";
import { cancelTask } from "@/lib/api/tasks";
import { getChatHistory } from "@/lib/api/chat";
import { synthesizeSpeech } from "@/lib/api/voice";
import { playAudioBlob } from "@/lib/voice/recorder";
import { agentSocket } from "@/lib/ws/client";
import { createRequestId, formatRelativeTime } from "@/lib/utils/format";
import { useChatStore } from "@/stores/chatStore";
import { MessageList } from "@/components/chat/MessageList";
import { ChatComposer } from "@/components/chat/ChatComposer";
import { TaskProgress } from "@/components/chat/TaskProgress";
import { ActionList } from "@/components/chat/ActionList";
import { ScreenshotViewer } from "@/components/screenshot/ScreenshotViewer";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { ErrorBanner } from "@/components/ui/ErrorBanner";
import { PhaseBadge } from "@/components/ui/PhaseBadge";
import { StatusDot } from "@/components/ui/StatusDot";
import { Sheet } from "@/components/ui/Sheet";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { useToast } from "@/components/ui/Toast";

export function ChatPanel({ initialDeviceId }: { initialDeviceId?: string }) {
  const devicesQuery = useQuery({ queryKey: ["devices"], queryFn: listDevices });
  const {
    selectedDeviceId,
    setSelectedDeviceId,
    messages,
    progressSteps,
    plannedActions,
    phase,
    activeTaskId,
    activeTaskStatus,
    latestScreenshot,
    latestCamera,
    pendingConfirmation,
    lastError,
    wsConnected,
    aiEnabled,
    setAiEnabled,
    setLastError,
    appendLocalUserMessage,
    appendLocalSystemMessage,
    setActiveTask,
    resetProgress,
    pushProgress,
    setPhase,
    setPendingConfirmation,
    prependHistory,
  } = useChatStore();

  const { toast } = useToast();
  const [confirmBusy, setConfirmBusy] = useState(false);
  const [screenshotBusy, setScreenshotBusy] = useState(false);
  const [cameraBusy, setCameraBusy] = useState(false);
  const [lockBusy, setLockBusy] = useState<"lock" | "unlock" | null>(null);
  const [ttsEnabled, setTtsEnabled] = useState(false);
  const [dismissedShotId, setDismissedShotId] = useState<string | null>(null);
  const [dismissedCameraId, setDismissedCameraId] = useState<string | null>(null);
  const [hudOpen, setHudOpen] = useState(false);

  useEffect(() => {
    if (initialDeviceId) setSelectedDeviceId(initialDeviceId);
  }, [initialDeviceId, setSelectedDeviceId]);

  useEffect(() => {
    if (!selectedDeviceId && devicesQuery.data?.length) {
      const online = devicesQuery.data.find((d) => d.connectionStatus === "ONLINE");
      setSelectedDeviceId((online || devicesQuery.data[0]).id);
    }
  }, [devicesQuery.data, selectedDeviceId, setSelectedDeviceId]);

  const selectedDevice = useMemo(
    () => devicesQuery.data?.find((d) => d.id === selectedDeviceId) ?? null,
    [devicesQuery.data, selectedDeviceId],
  );

  useEffect(() => {
    if (!activeTaskId) return;
    void getChatHistory({ taskId: activeTaskId, limit: 100 })
      .then((history) => {
        prependHistory([...history].reverse());
      })
      .catch(() => undefined);
  }, [activeTaskId, prependHistory]);

  const speak = useCallback(
    async (text: string) => {
      if (!ttsEnabled || !text.trim()) return;
      try {
        const blob = await synthesizeSpeech(text);
        await playAudioBlob(blob);
      } catch {
        // optional
      }
    },
    [ttsEnabled],
  );

  async function handleSend(content: string) {
    if (!selectedDeviceId) {
      setLastError("Select a device first.");
      return;
    }
    if (!wsConnected) {
      setLastError("Live connection is down. Reconnecting…");
      return;
    }

    appendLocalUserMessage(content, activeTaskId);
    setLastError(null);

    if (!aiEnabled) {
      appendLocalSystemMessage("Sending notification to desktop…");
      try {
        await agentSocket.emitNotify({
          requestId: createRequestId("notify"),
          body: content,
          title: "Message from dashboard",
          deviceId: selectedDeviceId,
        });
        appendLocalSystemMessage("Notification delivered to desktop.");
        toast("Notification sent", "success");
      } catch (err) {
        setLastError(err instanceof Error ? err.message : "Failed to notify device");
      }
      return;
    }

    resetProgress();
    pushProgress("Planning...");
    setPhase("thinking");

    try {
      const response = (await agentSocket.emitUserMessage({
        requestId: createRequestId(),
        content,
        deviceId: selectedDeviceId,
        useAi: true,
        taskId: activeTaskId && activeTaskStatus === "WAITING_FOR_USER" ? activeTaskId : undefined,
      })) as { taskId?: string; resumedTaskId?: string; mode?: string } | undefined;

      const taskId = response?.resumedTaskId || response?.taskId;
      if (taskId) setActiveTask(taskId, "RUNNING");
    } catch (err) {
      setPhase("failed");
      setLastError(err instanceof Error ? err.message : "Failed to send message");
    }
  }

  async function handleScreenshot() {
    if (!wsConnected || !selectedDeviceId) {
      setLastError("Select an online device first.");
      return;
    }
    setScreenshotBusy(true);
    setLastError(null);
    try {
      await agentSocket.emitCaptureScreen({
        requestId: createRequestId("screen"),
        quality: 80,
        deviceId: selectedDeviceId,
        taskId: aiEnabled && activeTaskId ? activeTaskId : undefined,
      });
      toast("Screen capture requested", "info");
      if (aiEnabled && activeTaskId) {
        pushProgress("Taking screenshot...");
        setPhase("waiting_for_screenshot");
      }
    } catch (err) {
      setLastError(err instanceof Error ? err.message : "Screenshot request failed");
    } finally {
      setScreenshotBusy(false);
    }
  }

  async function handleCamera() {
    if (!wsConnected || !selectedDeviceId) {
      setLastError("Select an online device first.");
      return;
    }
    setCameraBusy(true);
    setLastError(null);
    try {
      await agentSocket.emitCaptureCamera({
        requestId: createRequestId("camera"),
        quality: 85,
        deviceId: selectedDeviceId,
      });
      toast("Camera capture requested", "info");
    } catch (err) {
      setLastError(err instanceof Error ? err.message : "Front camera capture failed");
    } finally {
      setCameraBusy(false);
    }
  }

  async function handleLock() {
    if (!wsConnected || !selectedDeviceId) {
      setLastError("Select an online device first.");
      return;
    }
    setLockBusy("lock");
    setLastError(null);
    try {
      await agentSocket.emitLockScreen({
        requestId: createRequestId("lock"),
        deviceId: selectedDeviceId,
      });
      appendLocalSystemMessage("Lock screen requested.");
      toast("Device locked", "success");
    } catch (err) {
      setLastError(err instanceof Error ? err.message : "Failed to lock screen");
    } finally {
      setLockBusy(null);
    }
  }

  async function handleUnlock() {
    if (!wsConnected || !selectedDeviceId) {
      setLastError("Select an online device first.");
      return;
    }
    setLockBusy("unlock");
    setLastError(null);
    try {
      await agentSocket.emitUnlockScreen({
        requestId: createRequestId("unlock"),
        deviceId: selectedDeviceId,
      });
      appendLocalSystemMessage("Unlock requested.");
      toast("Unlock requested", "info");
    } catch (err) {
      setLastError(err instanceof Error ? err.message : "Failed to unlock screen");
    } finally {
      setLockBusy(null);
    }
  }

  async function handleCancel() {
    if (!activeTaskId) return;
    try {
      await cancelTask(activeTaskId);
      setPhase("failed");
      pushProgress("Cancelled.", "error");
    } catch (err) {
      setLastError(err instanceof Error ? err.message : "Cancel failed");
    }
  }

  async function approveDangerous() {
    if (!pendingConfirmation) return;
    setConfirmBusy(true);
    try {
      const approval = `Approved: ${pendingConfirmation.message}`;
      await handleSend(approval);
      setPendingConfirmation(null);
      toast("Action approved", "success");
    } finally {
      setConfirmBusy(false);
    }
  }

  async function rejectDangerous() {
    if (!pendingConfirmation?.taskId) {
      setPendingConfirmation(null);
      return;
    }
    setConfirmBusy(true);
    try {
      await cancelTask(pendingConfirmation.taskId);
      setPendingConfirmation(null);
      setPhase("failed");
      pushProgress("Cancelled by user.", "error");
      toast("Action rejected", "info");
    } catch (err) {
      setLastError(err instanceof Error ? err.message : "Could not cancel");
    } finally {
      setConfirmBusy(false);
    }
  }

  useEffect(() => {
    const last = messages[messages.length - 1];
    if (last?.role === "ASSISTANT") {
      void speak(last.content);
    }
  }, [messages, speak]);

  const canCancel =
    !!activeTaskId &&
    activeTaskStatus !== "COMPLETED" &&
    activeTaskStatus !== "FAILED" &&
    activeTaskStatus !== "CANCELLED";

  const mobileShotOpen =
    !!latestScreenshot && latestScreenshot.requestId !== dismissedShotId;
  const mobileCameraOpen =
    !!latestCamera && latestCamera.requestId !== dismissedCameraId;

  const hudContent = (
    <div className="space-y-4">
      {aiEnabled ? <TaskProgress steps={progressSteps} phase={phase} /> : null}
      {aiEnabled ? <ActionList actions={plannedActions} /> : null}
      <div className="space-y-2">
        <div className="flex items-center justify-between gap-2">
          <p className="text-xs font-medium uppercase tracking-wide text-[var(--muted)]">
            Screen
          </p>
          {latestScreenshot ? (
            <span className="text-[11px] text-[var(--muted)]">
              {formatRelativeTime(latestScreenshot.receivedAt)}
            </span>
          ) : null}
        </div>
        <ScreenshotViewer
          frame={
            latestScreenshot
              ? {
                  ...latestScreenshot,
                  deviceName: selectedDevice?.name,
                }
              : null
          }
          deviceName={selectedDevice?.name}
        />
      </div>
      <div className="space-y-2">
        <div className="flex items-center justify-between gap-2">
          <p className="text-xs font-medium uppercase tracking-wide text-[var(--muted)]">
            Front camera
          </p>
          {latestCamera ? (
            <span className="text-[11px] text-[var(--muted)]">
              {formatRelativeTime(latestCamera.receivedAt)}
            </span>
          ) : null}
        </div>
        <ScreenshotViewer frame={latestCamera} deviceName="Front camera" />
      </div>
    </div>
  );

  return (
    <div className="flex h-[calc(100dvh-7.75rem)] flex-col gap-3 sm:h-[calc(100dvh-8rem)] md:h-[calc(100dvh-3rem)] lg:grid lg:h-[calc(100dvh-3rem)] lg:grid-cols-[minmax(0,1.65fr)_minmax(280px,0.9fr)] lg:gap-4">
      <section className="flex min-h-0 flex-1 flex-col overflow-hidden border-y border-[var(--border)] bg-[var(--panel)]/90 shadow-sm backdrop-blur md:rounded-2xl md:border">
        <header className="flex shrink-0 flex-wrap items-center justify-between gap-2 border-b border-[var(--border)] px-3 py-2.5 sm:px-4 sm:py-3">
          <div className="min-w-0">
            <h1 className="font-[family-name:var(--font-display)] text-xl tracking-tight sm:text-2xl">
              AI Control
            </h1>
            <p className="hidden text-sm text-[var(--muted)] sm:block">
              Notify or run AI actions — manage apps on App Center
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            <PhaseBadge phase={phase} />
            <Button
              size="sm"
              variant="outline"
              className="lg:hidden"
              onClick={() => setHudOpen(true)}
            >
              <PanelRightOpen className="h-3.5 w-3.5" />
              HUD
            </Button>
            <Link
              href="/apps/"
              className="hidden items-center gap-1.5 rounded-xl border border-[var(--border)] bg-[var(--panel-elevated)] px-3 py-1.5 text-xs font-medium text-[var(--muted)] hover:text-[var(--fg)] sm:inline-flex"
            >
              <AppWindow className="h-3.5 w-3.5" />
              Apps
            </Link>
            <Link
              href="/processes/"
              className="hidden items-center gap-1.5 rounded-xl border border-[var(--border)] bg-[var(--panel-elevated)] px-3 py-1.5 text-xs font-medium text-[var(--muted)] hover:text-[var(--fg)] sm:inline-flex"
            >
              <Cpu className="h-3.5 w-3.5" />
              Processes
            </Link>
            <label className="inline-flex items-center gap-1.5 rounded-xl border border-[var(--border)] bg-[var(--panel-elevated)] px-2.5 py-1.5 text-[11px] sm:gap-2 sm:px-3 sm:text-xs">
              <input
                type="checkbox"
                checked={ttsEnabled}
                onChange={(e) => setTtsEnabled(e.target.checked)}
                className="accent-[var(--accent)]"
              />
              Speak
            </label>
          </div>
        </header>

        <div className="shrink-0 border-b border-[var(--border)] px-3 py-2.5 sm:px-4 sm:py-3">
          <label className="block text-[11px] font-medium uppercase tracking-wide text-[var(--muted)]">
            Device
          </label>
          <div className="mt-1 flex items-center gap-2 sm:gap-3">
            <select
              value={selectedDeviceId ?? ""}
              onChange={(e) => setSelectedDeviceId(e.target.value || null)}
              className="select-field flex-1"
            >
              <option value="" disabled>
                Select device
              </option>
              {devicesQuery.data?.map((device) => (
                <option key={device.id} value={device.id}>
                  {device.name} ({device.connectionStatus})
                </option>
              ))}
            </select>
            {selectedDevice ? <StatusDot status={selectedDevice.connectionStatus} /> : null}
          </div>
        </div>

        {phase === "waiting_for_user" && pendingConfirmation ? (
          <div className="shrink-0 border-b border-amber-500/30 bg-[var(--warning-soft)] px-3 py-3 sm:px-4">
            <Badge tone="warning" pulse>
              Waiting for your approval
            </Badge>
            <p className="mt-2 text-sm text-[var(--fg)]">
              {pendingConfirmation.message}
            </p>
          </div>
        ) : null}

        {lastError ? (
          <div className="shrink-0 px-3 pt-2 sm:px-4 sm:pt-3">
            <ErrorBanner message={lastError} onDismiss={() => setLastError(null)} />
          </div>
        ) : null}

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 py-3 sm:px-4">
          <MessageList messages={messages} />
        </div>

        <ChatComposer
          disabled={!selectedDeviceId || selectedDevice?.connectionStatus === "REVOKED"}
          canCancel={canCancel}
          aiEnabled={aiEnabled}
          onAiEnabledChange={setAiEnabled}
          onSend={handleSend}
          onCancel={() => void handleCancel()}
          onScreenshot={() => void handleScreenshot()}
          screenshotBusy={screenshotBusy}
          onCamera={() => void handleCamera()}
          cameraBusy={cameraBusy}
          onLock={() => void handleLock()}
          onUnlock={() => void handleUnlock()}
          lockBusy={lockBusy}
        />
      </section>

      <aside className="hidden min-h-0 flex-col gap-4 overflow-y-auto lg:flex">
        {hudContent}
      </aside>

      {(latestScreenshot || latestCamera) ? (
        <div className="fixed inset-x-0 bottom-[calc(4.5rem+env(safe-area-inset-bottom))] z-30 space-y-2 px-3 lg:hidden">
          {latestCamera ? (
            mobileCameraOpen ? (
              <div className="max-h-[36vh] overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--panel)] shadow-xl">
                <ScreenshotViewer
                  compact
                  frame={latestCamera}
                  deviceName="Front camera"
                  onClose={() => setDismissedCameraId(latestCamera.requestId)}
                />
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setDismissedCameraId(null)}
                className="w-full rounded-xl border border-[var(--border)] bg-[var(--panel)]/95 px-3 py-2 text-left text-sm font-medium shadow-md backdrop-blur"
              >
                Show front camera shot
              </button>
            )
          ) : null}
          {latestScreenshot ? (
            mobileShotOpen ? (
              <div className="max-h-[36vh] overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--panel)] shadow-xl">
                <ScreenshotViewer
                  compact
                  frame={{
                    ...latestScreenshot,
                    deviceName: selectedDevice?.name,
                  }}
                  deviceName={selectedDevice?.name}
                  onClose={() => setDismissedShotId(latestScreenshot.requestId)}
                />
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setDismissedShotId(null)}
                className="mb-2 w-full rounded-xl border border-[var(--border)] bg-[var(--panel)]/95 px-3 py-2 text-left text-sm font-medium shadow-md backdrop-blur"
              >
                Show latest screenshot
              </button>
            )
          ) : null}
        </div>
      ) : null}

      <Sheet open={hudOpen} onClose={() => setHudOpen(false)} title="Device HUD">
        {hudContent}
      </Sheet>

      <ConfirmDialog
        open={!!pendingConfirmation}
        title="Approval required"
        message={
          pendingConfirmation
            ? `AI wants to continue with:\n\n"${pendingConfirmation.message}"`
            : ""
        }
        confirmLabel="Approve"
        cancelLabel="Reject"
        busy={confirmBusy}
        onConfirm={() => void approveDangerous()}
        onCancel={() => void rejectDangerous()}
      />
    </div>
  );
}
