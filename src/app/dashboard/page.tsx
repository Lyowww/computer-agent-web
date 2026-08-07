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
  const setLastError = useChatStore((s) => s.setLastError);
  const lastError = useChatStore((s) => s.lastError);
  const wsConnected = useChatStore((s) => s.wsConnected);
  const [screenshotBusy, setScreenshotBusy] = useState(false);

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

  return (
    <AppShell>
      <div className="space-y-6">
        <header className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="font-[family-name:var(--font-display)] text-3xl tracking-tight md:text-4xl">
              Dashboard
            </h1>
            <p className="mt-1 text-[var(--muted)]">
              {onlineCount} online · {devicesWithTasks.length} devices
            </p>
          </div>
          <p className="rounded-xl border border-[var(--border)] bg-white/70 px-3 py-2 text-sm">
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
          <div className="rounded-2xl border border-dashed border-[var(--border)] bg-white/60 p-8 text-center">
            <p className="font-medium">No devices yet</p>
            <p className="mt-1 text-sm text-[var(--muted)]">
              Register a desktop agent from the Devices page.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {devicesWithTasks.map((device) => (
              <DeviceCard
                key={device.id}
                device={device}
                screenshotBusy={screenshotBusy}
                onScreenshot={() => void takeScreenshot(device.id)}
              />
            ))}
          </div>
        )}

        <section className="space-y-3">
          <h2 className="text-lg font-semibold">Latest screenshot</h2>
          <ScreenshotViewer frame={latestScreenshot} />
        </section>
      </div>
    </AppShell>
  );
}
