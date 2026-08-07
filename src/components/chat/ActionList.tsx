"use client";

import type { PlannedAction } from "@/lib/types";

export function ActionList({ actions }: { actions: PlannedAction[] }) {
  return (
    <section className="rounded-2xl border border-[var(--border)] bg-[var(--panel)]/85 p-4 shadow-sm">
      <h2 className="font-[family-name:var(--font-display)] text-lg tracking-tight">
        Action list
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
                className="rounded-xl border border-[var(--border)] bg-white/70 px-3 py-2 text-sm"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-medium">{action.type}</span>
                  <span
                    className={
                      status === "ok"
                        ? "text-emerald-600"
                        : status === "fail"
                          ? "text-rose-600"
                          : "text-[var(--muted)]"
                    }
                  >
                    {status}
                  </span>
                </div>
                <pre className="mt-1 overflow-x-auto text-[11px] text-[var(--muted)]">
                  {JSON.stringify(action.params ?? {}, null, 0)}
                </pre>
                {action.error ? (
                  <p className="mt-1 text-xs text-rose-600">{action.error}</p>
                ) : null}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
