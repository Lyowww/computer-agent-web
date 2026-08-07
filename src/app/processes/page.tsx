"use client";

import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Cpu, RefreshCw } from "lucide-react";
import { listDevices } from "@/lib/api/devices";
import { agentSocket } from "@/lib/ws/client";
import { createRequestId } from "@/lib/utils/format";
import { useChatStore } from "@/stores/chatStore";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/Button";
import { ErrorBanner } from "@/components/ui/ErrorBanner";
import { StatusDot } from "@/components/ui/StatusDot";

export default function ProcessesPage() {
  const devicesQuery = useQuery({ queryKey: ["devices"], queryFn: listDevices });
  const {
    selectedDeviceId,
    setSelectedDeviceId,
    processes,
    wsConnected,
    lastError,
    setLastError,
  } = useChatStore();
  const [busy, setBusy] = useState(false);

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
    setBusy(true);
    setLastError(null);
    try {
      await agentSocket.emitListProcesses({
        requestId: createRequestId("procs"),
        deviceId: selectedDeviceId,
        limit: 80,
      });
    } catch (err) {
      setLastError(err instanceof Error ? err.message : "Failed to list processes");
    } finally {
      setBusy(false);
    }
  }

  return (
    <AppShell>
      <div className="mx-auto max-w-4xl space-y-4 sm:space-y-5">
        <header className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end sm:justify-between">
          <div className="min-w-0">
            <p className="inline-flex items-center gap-2 text-sm text-[var(--muted)]">
              <Cpu className="h-4 w-4" />
              Device control
            </p>
            <h1 className="mt-1 font-[family-name:var(--font-display)] text-2xl tracking-tight sm:text-3xl">
              Processes
            </h1>
            <p className="mt-1 text-sm text-[var(--muted)]">
              Top processes reported by the desktop agent
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            className="w-full sm:w-auto"
            disabled={!online || busy}
            onClick={() => void refresh()}
          >
            <RefreshCw className={`h-4 w-4 ${busy ? "animate-spin" : ""}`} />
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

        <section className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--panel)]/85 shadow-sm">
          <div className="border-b border-[var(--border)] px-3 py-3 sm:px-4">
            <h2 className="text-sm font-semibold">Running processes ({processes.length})</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-white/50 text-[11px] uppercase tracking-wide text-[var(--muted)] sm:text-xs">
                <tr>
                  <th className="px-3 py-2 font-medium sm:px-4">Name</th>
                  <th className="px-3 py-2 font-medium sm:px-4">PID</th>
                  <th className="px-3 py-2 font-medium sm:px-4">CPU</th>
                </tr>
              </thead>
              <tbody>
                {processes.length ? (
                  processes.map((proc) => (
                    <tr
                      key={`${proc.pid}-${proc.name}`}
                      className="border-t border-[var(--border)]"
                    >
                      <td className="max-w-[10rem] truncate px-3 py-2 font-medium sm:max-w-none sm:px-4">
                        {proc.name}
                      </td>
                      <td className="px-3 py-2 text-[var(--muted)] sm:px-4">{proc.pid}</td>
                      <td className="px-3 py-2 text-[var(--muted)] sm:px-4">
                        {proc.cpu !== undefined ? `${proc.cpu}%` : "—"}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={3} className="px-4 py-10 text-center text-[var(--muted)]">
                      {online
                        ? "Press Refresh to load processes."
                        : "Connect an online device to inspect processes."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </AppShell>
  );
}
