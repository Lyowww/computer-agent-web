"use client";

import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Cpu, RefreshCw, Search } from "lucide-react";
import { listDevices } from "@/lib/api/devices";
import { agentSocket } from "@/lib/ws/client";
import { createRequestId } from "@/lib/utils/format";
import { useChatStore } from "@/stores/chatStore";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/Button";
import { ErrorBanner } from "@/components/ui/ErrorBanner";
import { StatusDot } from "@/components/ui/StatusDot";
import { Card } from "@/components/ui/Card";
import { TableRowSkeleton } from "@/components/ui/Skeleton";

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
  const [query, setQuery] = useState("");
  const [loadedOnce, setLoadedOnce] = useState(false);

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

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = [...processes].sort((a, b) => (b.cpu ?? 0) - (a.cpu ?? 0));
    if (!q) return list;
    return list.filter(
      (p) =>
        p.name.toLowerCase().includes(q) || String(p.pid).includes(q),
    );
  }, [processes, query]);

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
      setLoadedOnce(true);
    } catch (err) {
      setLastError(err instanceof Error ? err.message : "Failed to list processes");
    } finally {
      setBusy(false);
    }
  }

  return (
    <AppShell>
      <div className="mx-auto w-full max-w-6xl space-y-5 sm:space-y-6">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0 flex-1">
            <p className="inline-flex items-center gap-2 text-sm text-[var(--muted)]">
              <Cpu className="h-4 w-4 shrink-0" />
              Device control
            </p>
            <h1 className="mt-1 font-display text-2xl tracking-tight sm:text-3xl lg:text-4xl">
              Processes
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[var(--muted)] sm:text-base">
              Searchable process table sorted by CPU usage
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            className="w-full shrink-0 sm:w-auto"
            disabled={!online || busy}
            loading={busy}
            onClick={() => void refresh()}
          >
            <RefreshCw className={`h-4 w-4 ${busy ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </header>

        <Card>
          <label className="block text-xs font-medium uppercase tracking-wide text-[var(--muted)]">
            Device
          </label>
          <div className="mt-2 flex min-w-0 items-center gap-3">
            <select
              value={selectedDeviceId ?? ""}
              onChange={(e) => setSelectedDeviceId(e.target.value || null)}
              className="select-field min-w-0 flex-1"
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

        <Card padding="none">
          <div className="flex flex-col gap-3 border-b border-[var(--border)] px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:px-6">
            <h2 className="shrink-0 text-base font-semibold">
              Running processes ({filtered.length})
            </h2>
            <label className="relative block w-full sm:max-w-sm">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted)]" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Filter by name or PID"
                className="select-field w-full pl-9"
              />
            </label>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[28rem] table-fixed text-left text-sm sm:min-w-0 sm:table-auto">
              <thead className="bg-[var(--panel-elevated)]/60 text-xs uppercase tracking-wide text-[var(--muted)]">
                <tr>
                  <th className="w-[50%] px-4 py-3 font-medium sm:w-auto sm:px-6">Name</th>
                  <th className="w-[20%] px-4 py-3 font-medium sm:w-28 sm:px-6">PID</th>
                  <th className="w-[30%] px-4 py-3 font-medium sm:w-40 sm:px-6">CPU</th>
                </tr>
              </thead>
              <tbody>
                {busy && !processes.length ? (
                  <TableRowSkeleton rows={8} />
                ) : filtered.length ? (
                  filtered.map((proc) => (
                    <tr
                      key={`${proc.pid}-${proc.name}`}
                      className="border-t border-[var(--border)]"
                    >
                      <td className="truncate px-4 py-3 font-medium sm:max-w-none sm:px-6 sm:text-base">
                        {proc.name}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 font-[family-name:var(--font-mono)] text-[var(--muted)] sm:px-6">
                        {proc.pid}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 sm:px-6">
                        {proc.cpu !== undefined ? (
                          <span className="inline-flex items-center gap-2.5">
                            <span className="h-1.5 w-14 overflow-hidden rounded-full bg-[var(--border)] sm:w-16">
                              <span
                                className="block h-full rounded-full bg-[var(--accent)]"
                                style={{
                                  width: `${Math.min(100, Math.max(4, proc.cpu))}%`,
                                }}
                              />
                            </span>
                            <span className="font-[family-name:var(--font-mono)] text-[var(--muted)]">
                              {proc.cpu}%
                            </span>
                          </span>
                        ) : (
                          "—"
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={3} className="px-4 py-12 text-center text-[var(--muted)] sm:px-6">
                      {online
                        ? loadedOnce || processes.length
                          ? "No processes match your filter."
                          : "Press Refresh to load processes."
                        : "Connect an online device to inspect processes."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </AppShell>
  );
}
