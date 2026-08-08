"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AppShell } from "@/components/layout/AppShell";
import { DeviceCard } from "@/components/devices/DeviceCard";
import { ScreenshotViewer } from "@/components/screenshot/ScreenshotViewer";
import { ErrorBanner } from "@/components/ui/ErrorBanner";
import { Spinner } from "@/components/ui/Spinner";
import { listDevices } from "@/lib/api/devices";
import { listTasks } from "@/lib/api/tasks";
import { agentSocket } from "@/lib/ws/client";
import { createRequestId } from "@/lib/utils/format";
import { useChatStore } from "@/stores/chatStore";
import type { Device } from "@/lib/types";

export default function DashboardPage() {
  const devicesQuery = useQuery({ queryKey: ["devices"], queryFn: listDevices });
  const tasksQuery = useQuery({ queryKey: ["tasks"], queryFn: listTasks });
  const latestScreenshot = useChatStore((s) => s.latestScreenshot);
  const latestCamera = useChatStore((s) => s.latestCamera);
  const setLastError = useChatStore((s) => s.setLastError);
  const lastError = useChatStore((s) => s.lastError);
  const wsConnected = useChatStore((s) => s.wsConnected);
  const [screenshotBusy, setScreenshotBusy] = useState(false);
  const [cameraBusy, setCameraBusy] = useState(false);
  const [lockBusy, setLockBusy] = useState<"lock" | "unlock" | null>(null);
  const [lockTarget, setLockTarget] = useState<string | null>(null);

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
    } catch (err) {
      setLastError(err instanceof Error ? err.message : "Failed to unlock screen");
    } finally {
      setLockBusy(null);
      setLockTarget(null);
    }
  }

  return (
    <AppShell>
      <div className="space-y-4 sm:space-y-6">
        <header className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between">
          <div className="min-w-0">
            <h1 className="font-[family-name:var(--font-display)] text-2xl tracking-tight sm:text-3xl md:text-4xl">
              Dashboard
            </h1>
            <p className="mt-1 text-sm text-[var(--muted)] sm:text-base">
              {onlineCount} online · {devicesWithTasks.length} devices
            </p>
          </div>
          <p className="w-fit rounded-xl border border-[var(--border)] bg-white/70 px-3 py-2 text-sm">
            {wsConnected ? "Realtime connected" : "Connecting…"}
          </p>
        </header>

        {lastError ? (
          <ErrorBanner message={lastError} onDismiss={() => setLastError(null)} />
        ) : null}

        {devicesQuery.isLoading ? (
          <div className="flex items-center gap-2 text-[var(--muted)]">
            <Spinner /> Loading devices…
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
          <div className="rounded-2xl border border-dashed border-[var(--border)] bg-white/60 p-6 text-center sm:p-8">
            <p className="font-medium">No devices yet</p>
            <p className="mt-1 text-sm text-[var(--muted)]">
              Register a desktop agent from the Devices page.
            </p>
          </div>
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

        <section className="space-y-3">
          <h2 className="text-base font-semibold sm:text-lg">Latest screenshot</h2>
          <ScreenshotViewer frame={latestScreenshot} />
        </section>

        <section className="space-y-3">
          <h2 className="text-base font-semibold sm:text-lg">Latest front camera</h2>
          <ScreenshotViewer frame={latestCamera} deviceName="Front camera" />
        </section>
      </div>
    </AppShell>
  );
}
