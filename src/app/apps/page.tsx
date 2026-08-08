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
      <div className="mx-auto max-w-4xl space-y-4 sm:space-y-5">
        <header className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between">
          <div className="min-w-0">
            <p className="inline-flex items-center gap-2 text-sm text-[var(--muted)]">
              <AppWindow className="h-4 w-4" />
              Device control
            </p>
            <h1 className="mt-1 font-[family-name:var(--font-display)] text-2xl tracking-tight sm:text-3xl">
              App Center
            </h1>
            <p className="mt-1 text-sm text-[var(--muted)]">
              Launch presets, quit running apps, and lock the selected agent
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            className="w-full sm:w-auto"
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
        </Card>

        {lastError ? (
          <ErrorBanner message={lastError} onDismiss={() => setLastError(null)} />
        ) : null}

        <Card>
          <h2 className="text-sm font-semibold">Lock screen</h2>
          <p className="mt-1 text-xs text-[var(--muted)]">
            Lock opens the OS lock screen. Unlock types the password saved in the
            desktop agent Settings.
          </p>
          <LockControls
            className="mt-3 grid grid-cols-2 gap-2 sm:max-w-sm"
            disabled={!online}
            busy={busy === "lock" ? "lock" : busy === "unlock" ? "unlock" : null}
            onLock={() => void lockScreen()}
            onUnlock={() => void unlockScreen()}
          />
        </Card>

        <Card>
          <h2 className="text-sm font-semibold">Quick launch</h2>
          <p className="mt-1 text-xs text-[var(--muted)]">
            Launch a common app on the device
          </p>
          <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {QUICK_OPEN.map((app) => (
              <Button
                key={app}
                type="button"
                size="sm"
                variant="outline"
                className="justify-start"
                disabled={!online || !!busy}
                onClick={() => void openApp(app)}
              >
                <Play className="h-3.5 w-3.5 text-[var(--accent)]" />
                {app}
              </Button>
            ))}
          </div>
        </Card>

        <Card padding="none">
          <div className="border-b border-[var(--border)] px-4 py-3 sm:px-5">
            <h2 className="text-sm font-semibold">Running apps ({apps.length})</h2>
            <p className="mt-1 text-xs text-[var(--muted)]">
              Focus / reopen an app, or quit it remotely
            </p>
          </div>
          <ul className="divide-y divide-[var(--border)] px-4 sm:px-5">
            {apps.length ? (
              apps.map((app) => (
                <li
                  key={app.name}
                  className="flex flex-col gap-3 py-3 first:pt-3 last:pb-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between"
                >
                  <div className="min-w-0">
                    <p className="truncate font-medium">{app.name}</p>
                    {app.path ? (
                      <p className="truncate font-[family-name:var(--font-mono)] text-xs text-[var(--muted)]">
                        {app.path}
                      </p>
                    ) : null}
                  </div>
                  <div className="grid grid-cols-2 gap-2 sm:flex">
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
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
              <li className="py-10 text-center text-sm text-[var(--muted)]">
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
