"use client";

import { useQuery } from "@tanstack/react-query";
import { AppShell } from "@/components/layout/AppShell";
import { FeatureGate } from "@/components/billing/FeatureGate";
import { Card } from "@/components/ui/Card";
import { ErrorBanner } from "@/components/ui/ErrorBanner";
import { listAuditLogs } from "@/lib/api/billing";
import { formatTimestamp } from "@/lib/utils/format";

export default function AuditPage() {
  const logsQuery = useQuery({
    queryKey: ["audit-logs"],
    queryFn: () => listAuditLogs(100),
  });

  return (
    <AppShell>
      <div className="mx-auto w-full max-w-4xl space-y-6">
        <header>
          <h1 className="font-display text-2xl tracking-tight sm:text-3xl">
            Audit Logs
          </h1>
          <p className="mt-1 text-sm text-[var(--muted)]">
            Security-relevant workspace actions. Screen contents and credentials
            are never logged.
          </p>
        </header>

        <FeatureGate
          feature="auditLogs"
          description="Track device connects, revokes, subscription changes, and denied feature access."
        >
          {logsQuery.isError ? (
            <ErrorBanner
              message={
                logsQuery.error instanceof Error
                  ? logsQuery.error.message
                  : "Failed to load audit logs"
              }
            />
          ) : (
            <div className="space-y-2">
              {(logsQuery.data as Array<{
                id: string;
                action: string;
                createdAt: string;
                actor?: { email: string; name: string | null } | null;
                targetType?: string | null;
                targetId?: string | null;
              }> | undefined)?.map((log) => (
                <Card key={log.id} className="space-y-1" padding="lg">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="font-mono-ui text-sm">{log.action}</p>
                    <p className="text-xs text-[var(--muted)]">
                      {formatTimestamp(log.createdAt)}
                    </p>
                  </div>
                  <p className="text-sm text-[var(--muted)]">
                    {log.actor?.name || log.actor?.email || "System"}
                    {log.targetType ? ` · ${log.targetType}` : ""}
                    {log.targetId ? ` · ${log.targetId.slice(0, 8)}` : ""}
                  </p>
                </Card>
              ))}
              {!Array.isArray(logsQuery.data) || logsQuery.data.length === 0
                ? !logsQuery.isLoading && (
                <Card className="text-center text-sm text-[var(--muted)]" padding="lg">
                  No audit events yet.
                </Card>
              ) : null}
            </div>
          )}
        </FeatureGate>
      </div>
    </AppShell>
  );
}
