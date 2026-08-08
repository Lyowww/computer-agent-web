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
import { cn } from "@/lib/utils/cn";

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
              Searchable process table sorted by CPU usage
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            className="w-full sm:w-auto"
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

        <Card padding="none">
          <div className="flex flex-col gap-3 border-b border-[var(--border)] px-3 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-4">
            <h2 className="text-sm font-semibold">
              Running processes ({filtered.length})
            </h2>
            <label className="relative block w-full sm:max-w-xs">
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
            <table className="min-w-full text-left text-sm">
              <thead className="bg-[var(--panel-elevated)]/60 text-[11px] uppercase tracking-wide text-[var(--muted)] sm:text-xs">
                <tr>
                  <th className="px-3 py-2 font-medium sm:px-4">Name</th>
                  <th className="px-3 py-2 font-medium sm:px-4">PID</th>
                  <th className="px-3 py-2 font-medium sm:px-4">CPU</th>
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
                      <td className="max-w-[8rem] truncate px-3 py-2.5 font-medium sm:max-w-[16rem] sm:px-4 md:max-w-none">
                        {proc.name}
                      </td>
                      <td className="whitespace-nowrap px-3 py-2.5 font-[family-name:var(--font-mono)] text-[var(--muted)] sm:px-4">
                        {proc.pid}
                      </td>
                      <td className="whitespace-nowrap px-3 py-2.5 sm:px-4">
                        {proc.cpu !== undefined ? (
                          <span className="inline-flex items-center gap-2">
                            <span
                              className={cn(
                                "h-1.5 w-12 overflow-hidden rounded-full bg-[var(--border)]",
                              )}
                            >
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
                    <td colSpan={3} className="px-4 py-10 text-center text-[var(--muted)]">
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
