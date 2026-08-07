"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { AppWindow, Cpu } from "lucide-react";
import { listDevices } from "@/lib/api/devices";
import { cancelTask } from "@/lib/api/tasks";
import { getChatHistory } from "@/lib/api/chat";
import { synthesizeSpeech } from "@/lib/api/voice";
import { playAudioBlob } from "@/lib/voice/recorder";
import { agentSocket } from "@/lib/ws/client";
import { createRequestId } from "@/lib/utils/format";
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

  const [confirmBusy, setConfirmBusy] = useState(false);
  const [screenshotBusy, setScreenshotBusy] = useState(false);
  const [ttsEnabled, setTtsEnabled] = useState(false);

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

  return (
    <div className="grid h-[calc(100dvh-7.5rem)] gap-4 lg:grid-cols-[minmax(0,1.45fr)_minmax(280px,0.75fr)] lg:h-[calc(100dvh-5.5rem)]">
      <section className="flex min-h-0 flex-col overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--panel)]/85 shadow-sm backdrop-blur">
        <header className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-b border-[var(--border)] px-4 py-3">
          <div>
            <h1 className="font-[family-name:var(--font-display)] text-2xl tracking-tight">
              Chat
            </h1>
            <p className="text-sm text-[var(--muted)]">
              Notify or run AI actions — manage apps on the Apps page
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <PhaseBadge phase={phase} />
            <Link
              href="/apps"
              className="inline-flex items-center gap-1.5 rounded-xl border border-[var(--border)] bg-white/70 px-3 py-1.5 text-xs font-medium text-[var(--muted)] hover:text-[var(--fg)]"
            >
              <AppWindow className="h-3.5 w-3.5" />
              Apps
            </Link>
            <Link
              href="/processes"
              className="inline-flex items-center gap-1.5 rounded-xl border border-[var(--border)] bg-white/70 px-3 py-1.5 text-xs font-medium text-[var(--muted)] hover:text-[var(--fg)]"
            >
              <Cpu className="h-3.5 w-3.5" />
              Processes
            </Link>
            <label className="inline-flex items-center gap-2 rounded-xl border border-[var(--border)] bg-white/70 px-3 py-1.5 text-xs">
              <input
                type="checkbox"
                checked={ttsEnabled}
                onChange={(e) => setTtsEnabled(e.target.checked)}
              />
              Speak replies
            </label>
          </div>
        </header>

        <div className="shrink-0 border-b border-[var(--border)] px-4 py-3">
          <label className="block text-xs font-medium uppercase tracking-wide text-[var(--muted)]">
            Device
          </label>
          <div className="mt-1 flex flex-wrap items-center gap-3">
            <select
              value={selectedDeviceId ?? ""}
              onChange={(e) => setSelectedDeviceId(e.target.value || null)}
              className="min-w-[200px] flex-1 rounded-xl border border-[var(--border)] bg-white px-3 py-2 text-sm"
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

        {lastError ? (
          <div className="shrink-0 px-4 pt-3">
            <ErrorBanner message={lastError} onDismiss={() => setLastError(null)} />
          </div>
        ) : null}

        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-3">
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
        />
      </section>

      <aside className="flex min-h-0 flex-col gap-4 overflow-y-auto">
        {aiEnabled ? <TaskProgress steps={progressSteps} phase={phase} /> : null}
        {aiEnabled ? <ActionList actions={plannedActions} /> : null}
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
      </aside>

      <ConfirmDialog
        open={!!pendingConfirmation}
        title="Approval required"
        message={
          pendingConfirmation
            ? `AI wants to continue with:\n\n"${pendingConfirmation.message}"`
            : ""
        }
        confirmLabel="Approve"
        cancelLabel="Cancel"
        busy={confirmBusy}
        onConfirm={() => void approveDangerous()}
        onCancel={() => void rejectDangerous()}
      />
    </div>
  );
}
