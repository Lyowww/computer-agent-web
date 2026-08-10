"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Radio, MonitorSmartphone, Activity } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { DeviceCard } from "@/components/devices/DeviceCard";
import { ScreenshotViewer } from "@/components/screenshot/ScreenshotViewer";
import { ErrorBanner } from "@/components/ui/ErrorBanner";
import { DeviceCardSkeleton } from "@/components/ui/Skeleton";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { listDevices } from "@/lib/api/devices";
import { listTasks } from "@/lib/api/tasks";
import { agentSocket } from "@/lib/ws/client";
import { createRequestId, formatRelativeTime } from "@/lib/utils/format";
import { useChatStore } from "@/stores/chatStore";
import { useToast } from "@/components/ui/Toast";
import type { Device } from "@/lib/types";
import { cn } from "@/lib/utils/cn";

export default function DashboardPage() {
  const devicesQuery = useQuery({ queryKey: ["devices"], queryFn: listDevices });
  const tasksQuery = useQuery({ queryKey: ["tasks"], queryFn: listTasks });
  const latestScreenshot = useChatStore((s) => s.latestScreenshot);
  const latestCamera = useChatStore((s) => s.latestCamera);
  const setLastError = useChatStore((s) => s.setLastError);
  const lastError = useChatStore((s) => s.lastError);
  const wsConnected = useChatStore((s) => s.wsConnected);
  const { toast } = useToast();
  const [screenshotBusy, setScreenshotBusy] = useState(false);
  const [cameraBusy, setCameraBusy] = useState(false);
  const [lockBusy, setLockBusy] = useState<"lock" | "unlock" | null>(null);
  const [lockTarget, setLockTarget] = useState<string | null>(null);
  const [mediaTab, setMediaTab] = useState<"screen" | "camera">("screen");

  const devicesWithTasks: Device[] = useMemo(() => {
    const tasks = tasksQuery.data ?? [];
    return (devicesQuery.data ?? []).map((device) => {
      const activeTask =
        tasks.find(
          (task) =>
            task.deviceId === device.id &&
            !["COMPLETED", "FAILED", "CANCELLED"].includes(task.status),
        ) ?? null;
      return { ...device, activeTask };
    });
  }, [devicesQuery.data, tasksQuery.data]);

  const onlineCount = devicesWithTasks.filter((d) => d.connectionStatus === "ONLINE").length;
  const runningTasks = (tasksQuery.data ?? []).filter(
    (t) => !["COMPLETED", "FAILED", "CANCELLED"].includes(t.status),
  ).length;

  async function takeScreenshot(deviceId?: string) {
    if (!wsConnected) {
      setLastError("Live connection is down.");
      return;
    }
    setScreenshotBusy(true);
    try {
      await agentSocket.emitCaptureScreen({
        requestId: createRequestId("screen"),
        quality: 80,
        deviceId,
      });
      toast("Screen capture requested", "info");
      setMediaTab("screen");
    } catch (err) {
      setLastError(err instanceof Error ? err.message : "Screenshot failed");
    } finally {
      setScreenshotBusy(false);
    }
  }

  async function takeCamera(deviceId?: string) {
    if (!wsConnected) {
      setLastError("Live connection is down.");
      return;
    }
    setCameraBusy(true);
    try {
      await agentSocket.emitCaptureCamera({
        requestId: createRequestId("camera"),
        quality: 85,
        deviceId,
      });
      toast("Camera capture requested", "info");
      setMediaTab("camera");
    } catch (err) {
      setLastError(err instanceof Error ? err.message : "Front camera capture failed");
    } finally {
      setCameraBusy(false);
    }
  }

  async function lockDevice(deviceId: string) {
    if (!wsConnected) {
      setLastError("Live connection is down.");
      return;
    }
    setLockTarget(deviceId);
    setLockBusy("lock");
    setLastError(null);
    try {
      await agentSocket.emitLockScreen({
        requestId: createRequestId("lock"),
        deviceId,
      });
      toast("Device locked", "success");
    } catch (err) {
      setLastError(err instanceof Error ? err.message : "Failed to lock screen");
    } finally {
      setLockBusy(null);
      setLockTarget(null);
    }
  }

  async function unlockDevice(deviceId: string) {
    if (!wsConnected) {
      setLastError("Live connection is down.");
      return;
    }
    setLockTarget(deviceId);
    setLockBusy("unlock");
    setLastError(null);
    try {
      await agentSocket.emitUnlockScreen({
        requestId: createRequestId("unlock"),
        deviceId,
      });
      toast("Unlock requested", "info");
    } catch (err) {
      setLastError(err instanceof Error ? err.message : "Failed to unlock screen");
    } finally {
      setLockBusy(null);
      setLockTarget(null);
    }
  }

  const metrics = [
    {
      label: "Total devices",
      value: devicesWithTasks.length,
      icon: MonitorSmartphone,
    },
    {
      label: "Online",
      value: onlineCount,
      icon: Radio,
    },
    {
      label: "Running tasks",
      value: runningTasks,
      icon: Activity,
    },
  ];

  return (
    <AppShell>
      <div className="space-y-6 sm:space-y-8">
        <header className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between">
          <div className="min-w-0">
            <h1 className="font-display text-3xl tracking-tight sm:text-4xl">
              {(() => {
                const hour = new Date().getHours();
                const greeting =
                  hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
                return greeting;
              })()}
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-[var(--muted)] sm:text-base">
              Your machines are ready.{" "}
              <span className="text-[var(--fg)]">
                {onlineCount} device{onlineCount === 1 ? "" : "s"} online
              </span>
              {" · "}
              <span className="text-[var(--fg)]">
                {runningTasks} active task{runningTasks === 1 ? "" : "s"}
              </span>
            </p>
          </div>
          <Badge tone={wsConnected ? "success" : "warning"} pulse={wsConnected}>
            {wsConnected ? "Realtime connected" : "Connecting…"}
          </Badge>
        </header>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
          {metrics.map((m) => {
            const Icon = m.icon;
            return (
              <Card key={m.label} padding="sm" className="min-w-0">
                <div className="flex items-center gap-2 text-[var(--muted)]">
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--accent-soft)] text-[var(--accent)]">
                    <Icon className="h-3.5 w-3.5 shrink-0" />
                  </span>
                  <span className="truncate text-[10px] uppercase tracking-[0.12em] sm:text-xs">
                    {m.label}
                  </span>
                </div>
                <p className="mt-3 font-display text-2xl tracking-tight sm:text-3xl">
                  {m.value}
                </p>
              </Card>
            );
          })}
        </div>

        {lastError ? (
          <ErrorBanner message={lastError} onDismiss={() => setLastError(null)} />
        ) : null}

        {devicesQuery.isLoading ? (
          <div className="grid gap-3 sm:grid-cols-2 sm:gap-4 xl:grid-cols-3">
            <DeviceCardSkeleton />
            <DeviceCardSkeleton />
            <DeviceCardSkeleton />
          </div>
        ) : devicesQuery.isError ? (
          <ErrorBanner
            message={
              devicesQuery.error instanceof Error
                ? devicesQuery.error.message
                : "Failed to load devices"
            }
          />
        ) : devicesWithTasks.length === 0 ? (
          <Card className="border-dashed text-center" padding="lg">
            <p className="font-display text-xl tracking-tight sm:text-2xl">
              No devices connected.
            </p>
            <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-[var(--muted)]">
              Install the PetAI desktop agent to connect your first computer.
            </p>
            <a
              href="/devices/"
              className="mt-5 inline-flex min-h-11 items-center justify-center rounded-xl bg-[linear-gradient(135deg,#5ae0f7_0%,#39d5f2_48%,#2bb8d4_100%)] px-5 text-sm font-semibold text-[#041016] shadow-[0_10px_28px_-14px_var(--accent-glow)]"
            >
              Connect Device
            </a>
          </Card>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 sm:gap-4 xl:grid-cols-3">
            {devicesWithTasks.map((device) => (
              <DeviceCard
                key={device.id}
                device={device}
                screenshotBusy={screenshotBusy}
                cameraBusy={cameraBusy}
                lockBusy={lockTarget === device.id ? lockBusy : null}
                onScreenshot={() => void takeScreenshot(device.id)}
                onCamera={() => void takeCamera(device.id)}
                onLock={(id) => void lockDevice(id)}
                onUnlock={(id) => void unlockDevice(id)}
              />
            ))}
          </div>
        )}

        <section className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="font-display text-lg tracking-tight sm:text-xl">
              Recent media
            </h2>
            <div className="flex rounded-xl border border-[var(--border)] bg-[var(--panel)] p-1">
              {(
                [
                  ["screen", "Screen"],
                  ["camera", "Camera"],
                ] as const
              ).map(([id, label]) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setMediaTab(id)}
                  className={cn(
                    "rounded-lg px-3.5 py-2 text-xs font-medium transition",
                    mediaTab === id
                      ? "bg-[var(--accent-soft)] text-[var(--accent)] shadow-[inset_0_0_0_1px_color-mix(in_srgb,var(--accent)_25%,transparent)]"
                      : "text-[var(--muted)] hover:text-[var(--fg)]",
                  )}
                >
                  {label}
                  {id === "screen" && latestScreenshot
                    ? ` · ${formatRelativeTime(latestScreenshot.receivedAt)}`
                    : null}
                  {id === "camera" && latestCamera
                    ? ` · ${formatRelativeTime(latestCamera.receivedAt)}`
                    : null}
                </button>
              ))}
            </div>
          </div>
          {mediaTab === "screen" ? (
            <ScreenshotViewer frame={latestScreenshot} />
          ) : (
            <ScreenshotViewer frame={latestCamera} deviceName="Front camera" />
          )}
        </section>
      </div>
    </AppShell>
  );
}
