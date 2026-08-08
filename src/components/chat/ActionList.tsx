"use client";

import type { PlannedAction } from "@/lib/types";
import { formatActionChip } from "@/lib/utils/format";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/utils/cn";

export function ActionList({ actions }: { actions: PlannedAction[] }) {
  return (
    <Card>
      <h2 className="font-display text-lg tracking-tight">
        Action stream
      </h2>
      <p className="mt-1 text-xs text-[var(--muted)]">
        Planned / executed actions when AI is on
      </p>
      {!actions.length ? (
        <p className="mt-3 text-sm text-[var(--muted)]">No actions yet.</p>
      ) : (
        <ul className="mt-3 space-y-2">
          {actions.map((action, index) => {
            const status =
              action.success === true
                ? "ok"
                : action.success === false
                  ? "fail"
                  : "pending";
            return (
              <li
                key={`${action.type}-${index}-${action.actionId ?? ""}`}
                className="rounded-xl border border-[var(--border)] bg-[var(--panel-elevated)]/70 px-3 py-2.5 text-sm"
              >
                <div className="flex items-start justify-between gap-2">
                  <span
                    className={cn(
                      "inline-flex max-w-[85%] flex-wrap items-center gap-1.5 rounded-lg border border-[var(--border)] bg-[var(--accent-soft)] px-2.5 py-1 font-[family-name:var(--font-mono)] text-[11px] font-medium text-[var(--accent)]",
                    )}
                  >
                    {formatActionChip(action.type, action.params ?? {})}
                  </span>
                  <Badge
                    tone={
                      status === "ok"
                        ? "success"
                        : status === "fail"
                          ? "danger"
                          : "neutral"
                    }
                    className="shrink-0"
                  >
                    {status}
                  </Badge>
                </div>
                {action.reason ? (
                  <p className="mt-2 text-xs text-[var(--muted)]">{action.reason}</p>
                ) : null}
                {action.error ? (
                  <p className="mt-1 text-xs text-[var(--danger)]">{action.error}</p>
                ) : null}
              </li>
            );
          })}
        </ul>
      )}
    </Card>
  );
}
