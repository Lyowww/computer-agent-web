"use client";

import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Play, RefreshCw, Square, AppWindow } from "lucide-react";
import { listDevices } from "@/lib/api/devices";
import { agentSocket } from "@/lib/ws/client";
import { createRequestId } from "@/lib/utils/format";
import { useChatStore } from "@/stores/chatStore";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/Button";
import { ErrorBanner } from "@/components/ui/ErrorBanner";
import { StatusDot } from "@/components/ui/StatusDot";
import { Card } from "@/components/ui/Card";
import { Select } from "@/components/ui/Select";
import { LockControls } from "@/components/devices/LockControls";
import { useToast } from "@/components/ui/Toast";

const QUICK_OPEN = [
  "Chrome",
  "Safari",
  "Firefox",
  "VS Code",
  "Slack",
  "Terminal",
  "Notes",
  "Calculator",
];

export default function AppsPage() {
  const devicesQuery = useQuery({ queryKey: ["devices"], queryFn: listDevices });
  const {
    selectedDeviceId,
    setSelectedDeviceId,
    apps,
    wsConnected,
    lastError,
    setLastError,
    setApps,
  } = useChatStore();
  const { toast } = useToast();
  const [busy, setBusy] = useState<string | null>(null);

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

  const online = selectedDevice?.connectionStatus === "ONLINE" && wsConnected;

  async function refresh() {
    if (!selectedDeviceId || !online) {
      setLastError("Select an online device first.");
      return;
    }
    setBusy("refresh");
    setLastError(null);
    try {
      await agentSocket.emitListApps({
        requestId: createRequestId("apps"),
        deviceId: selectedDeviceId,
        limit: 60,
      });
    } catch (err) {
      setLastError(err instanceof Error ? err.message : "Failed to list apps");
    } finally {
      setBusy(null);
    }
  }

  async function openApp(app: string) {
    if (!selectedDeviceId || !online) {
      setLastError("Select an online device first.");
      return;
    }
    setBusy(`open:${app}`);
    setLastError(null);
    try {
      await agentSocket.emitOpenApp({
        requestId: createRequestId("open"),
        app,
        deviceId: selectedDeviceId,
      });
      toast(`Opening ${app}`, "info");
      await refresh();
    } catch (err) {
      setLastError(err instanceof Error ? err.message : `Failed to open ${app}`);
    } finally {
      setBusy(null);
    }
  }

  async function closeApp(app: string) {
    if (!selectedDeviceId || !online) {
      setLastError("Select an online device first.");
      return;
    }
    setBusy(`close:${app}`);
    setLastError(null);
    try {
      await agentSocket.emitCloseApp({
        requestId: createRequestId("close"),
        app,
        deviceId: selectedDeviceId,
      });
      setApps(apps.filter((a) => a.name !== app));
      toast(`Quit ${app}`, "success");
      await refresh();
    } catch (err) {
      setLastError(err instanceof Error ? err.message : `Failed to close ${app}`);
    } finally {
      setBusy(null);
    }
  }

  async function lockScreen() {
    if (!selectedDeviceId || !online) {
      setLastError("Select an online device first.");
      return;
    }
    setBusy("lock");
    setLastError(null);
    try {
      await agentSocket.emitLockScreen({
        requestId: createRequestId("lock"),
        deviceId: selectedDeviceId,
      });
      toast("Lock command sent", "info");
    } catch (err) {
      setLastError(err instanceof Error ? err.message : "Failed to lock screen");
    } finally {
      setBusy(null);
    }
  }

  async function unlockScreen() {
    if (!selectedDeviceId || !online) {
      setLastError("Select an online device first.");
      return;
    }
    setBusy("unlock");
    setLastError(null);
    try {
      await agentSocket.emitUnlockScreen({
        requestId: createRequestId("unlock"),
        deviceId: selectedDeviceId,
      });
      toast("Unlock command sent", "info");
    } catch (err) {
      setLastError(err instanceof Error ? err.message : "Failed to unlock screen");
    } finally {
      setBusy(null);
    }
  }

  return (
    <AppShell>
      <div className="mx-auto w-full max-w-6xl space-y-5 sm:space-y-6">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0 flex-1">
            <p className="inline-flex items-center gap-2 text-sm text-[var(--muted)]">
              <AppWindow className="h-4 w-4 shrink-0" />
              Device control
            </p>
            <h1 className="mt-1 font-display text-2xl tracking-tight sm:text-3xl lg:text-4xl">
              App Center
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[var(--muted)] sm:text-base">
              Launch presets, quit running apps, and lock the selected agent
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            className="w-full shrink-0 sm:w-auto"
            disabled={!online || busy === "refresh"}
            loading={busy === "refresh"}
            onClick={() => void refresh()}
          >
            <RefreshCw className={`h-4 w-4 ${busy === "refresh" ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </header>

        <Card>
          <label className="block text-xs font-medium uppercase tracking-wide text-[var(--muted)]">
            Device
          </label>
          <div className="mt-2 flex min-w-0 items-center gap-3">
            <Select
              className="min-w-0 flex-1"
              aria-label="Select device"
              value={selectedDeviceId ?? ""}
              onChange={(next) => setSelectedDeviceId(next || null)}
              placeholder="Select device"
              options={
                devicesQuery.data?.map((device) => ({
                  value: device.id,
                  label: device.name,
                  description: device.connectionStatus,
                })) ?? []
              }
            />
            {selectedDevice ? (
              <div className="shrink-0">
                <StatusDot status={selectedDevice.connectionStatus} />
              </div>
            ) : null}
          </div>
        </Card>

        {lastError ? (
          <ErrorBanner message={lastError} onDismiss={() => setLastError(null)} />
        ) : null}

        <Card>
          <h2 className="text-base font-semibold">Lock screen</h2>
          <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">
            Lock opens the OS lock screen. Unlock types the password saved in the
            desktop agent Settings.
          </p>
          <LockControls
            className="mt-4 grid w-full grid-cols-1 gap-3 sm:grid-cols-2 sm:max-w-md"
            disabled={!online}
            busy={busy === "lock" ? "lock" : busy === "unlock" ? "unlock" : null}
            onLock={() => void lockScreen()}
            onUnlock={() => void unlockScreen()}
          />
        </Card>

        <Card>
          <h2 className="text-base font-semibold">Quick launch</h2>
          <p className="mt-2 text-sm text-[var(--muted)]">
            Launch a common app on the device
          </p>
          <div className="mt-4 grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-4">
            {QUICK_OPEN.map((app) => (
              <Button
                key={app}
                type="button"
                size="md"
                variant="outline"
                className="w-full justify-start"
                disabled={!online || !!busy}
                onClick={() => void openApp(app)}
              >
                <Play className="h-3.5 w-3.5 shrink-0 text-[var(--accent)]" />
                <span className="truncate">{app}</span>
              </Button>
            ))}
          </div>
        </Card>

        <Card padding="none">
          <div className="border-b border-[var(--border)] px-4 py-4 sm:px-6">
            <h2 className="text-base font-semibold">Running apps ({apps.length})</h2>
            <p className="mt-1.5 text-sm text-[var(--muted)]">
              Focus / reopen an app, or quit it remotely
            </p>
          </div>
          <ul className="divide-y divide-[var(--border)] px-4 sm:px-6">
            {apps.length ? (
              apps.map((app) => (
                <li
                  key={app.name}
                  className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between sm:gap-4"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium sm:text-base">{app.name}</p>
                    {app.path ? (
                      <p className="mt-1 truncate font-[family-name:var(--font-mono)] text-xs text-[var(--muted)] sm:text-sm">
                        {app.path}
                      </p>
                    ) : null}
                  </div>
                  <div className="grid w-full grid-cols-2 gap-2 sm:flex sm:w-auto sm:shrink-0">
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="w-full sm:w-auto"
                      disabled={!online || !!busy}
                      onClick={() => void openApp(app.name)}
                    >
                      <Play className="h-3.5 w-3.5" />
                      Focus
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="danger"
                      className="w-full sm:w-auto"
                      disabled={!online || !!busy}
                      onClick={() => void closeApp(app.name)}
                    >
                      <Square className="h-3.5 w-3.5" />
                      Quit
                    </Button>
                  </div>
                </li>
              ))
            ) : (
              <li className="px-1 py-12 text-center text-sm text-[var(--muted)]">
                {online
                  ? "Press Refresh to load running applications."
                  : "Connect an online device to manage apps."}
              </li>
            )}
          </ul>
        </Card>
      </div>
    </AppShell>
  );
}
