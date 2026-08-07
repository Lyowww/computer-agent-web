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

const QUICK_OPEN = ["Chrome", "Safari", "Firefox", "VS Code", "Slack", "Terminal", "Notes", "Calculator"];

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
      await refresh();
    } catch (err) {
      setLastError(err instanceof Error ? err.message : `Failed to close ${app}`);
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
              Applications
            </h1>
            <p className="mt-1 text-sm text-[var(--muted)]">
              Open or quit apps on the selected desktop agent
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            className="w-full sm:w-auto"
            disabled={!online || busy === "refresh"}
            onClick={() => void refresh()}
          >
            <RefreshCw className={`h-4 w-4 ${busy === "refresh" ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </header>

        <section className="rounded-2xl border border-[var(--border)] bg-[var(--panel)]/85 p-3 shadow-sm sm:p-4">
          <label className="block text-xs font-medium uppercase tracking-wide text-[var(--muted)]">
            Device
          </label>
          <div className="mt-1 flex items-center gap-2 sm:gap-3">
            <select
              value={selectedDeviceId ?? ""}
              onChange={(e) => setSelectedDeviceId(e.target.value || null)}
              className="min-w-0 flex-1 rounded-xl border border-[var(--border)] bg-white px-3 py-2.5 text-base sm:text-sm"
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
        </section>

        {lastError ? (
          <ErrorBanner message={lastError} onDismiss={() => setLastError(null)} />
        ) : null}

        <section className="rounded-2xl border border-[var(--border)] bg-[var(--panel)]/85 p-3 shadow-sm sm:p-4">
          <h2 className="text-sm font-semibold">Quick open</h2>
          <p className="mt-1 text-xs text-[var(--muted)]">Launch a common app on the device</p>
          <div className="mt-3 grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
            {QUICK_OPEN.map((app) => (
              <Button
                key={app}
                type="button"
                size="sm"
                variant="outline"
                className="justify-start sm:justify-center"
                disabled={!online || !!busy}
                onClick={() => void openApp(app)}
              >
                <Play className="h-3.5 w-3.5" />
                {app}
              </Button>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-[var(--border)] bg-[var(--panel)]/85 p-3 shadow-sm sm:p-4">
          <div className="flex items-center justify-between gap-2">
            <div>
              <h2 className="text-sm font-semibold">Running apps ({apps.length})</h2>
              <p className="mt-1 text-xs text-[var(--muted)]">
                Quit an app, or reopen it if it disappeared
              </p>
            </div>
          </div>
          <ul className="mt-4 divide-y divide-[var(--border)]">
            {apps.length ? (
              apps.map((app) => (
                <li
                  key={app.name}
                  className="flex flex-col gap-3 py-3 first:pt-0 last:pb-0 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between"
                >
                  <div className="min-w-0">
                    <p className="truncate font-medium">{app.name}</p>
                    {app.path ? (
                      <p className="truncate text-xs text-[var(--muted)]">{app.path}</p>
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
                      Open
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
              <li className="py-8 text-center text-sm text-[var(--muted)]">
                {online
                  ? "Press Refresh to load running applications."
                  : "Connect an online device to manage apps."}
              </li>
            )}
          </ul>
        </section>
      </div>
    </AppShell>
  );
}
