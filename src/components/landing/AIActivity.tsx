"use client";

import { cn } from "@/lib/utils/cn";
import type { AgentPhase } from "@/components/three/AIAgentCore";

const STEPS: { phase: AgentPhase; label: string }[] = [
  { phase: "THINKING", label: "Thinking" },
  { phase: "SCREENSHOT", label: "Screenshot" },
  { phase: "EXECUTING", label: "Click / Type" },
  { phase: "VERIFYING", label: "Verify" },
  { phase: "COMPLETED", label: "Completed" },
];

export function AIActivity({
  phase,
  taskLabel = "Open Chrome and visit youtube.com",
  statusLine,
  className,
}: {
  phase: AgentPhase;
  taskLabel?: string;
  statusLine?: string;
  className?: string;
}) {
  const activeIndex = STEPS.findIndex((s) => s.phase === phase);

  return (
    <div
      className={cn(
        "rounded-2xl border border-[var(--border-strong)] bg-[var(--panel)]/80 p-4 shadow-[var(--shadow-soft)] backdrop-blur-md sm:p-5",
        className,
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span
            className={cn(
              "h-2 w-2 rounded-full bg-[var(--success)]",
              phase !== "READY" && "animate-status-breathe",
            )}
          />
          <span className="font-mono-ui text-[11px] uppercase tracking-[0.18em] text-[var(--muted)]">
            Agent online
          </span>
        </div>
        <span className="font-mono-ui text-[11px] text-[var(--accent)]">
          {phase}
        </span>
      </div>

      <p className="mt-3 text-sm text-[var(--muted)]">Task</p>
      <p className="mt-1 text-sm font-medium text-[var(--fg)] sm:text-base">
        {taskLabel}
      </p>

      <ol className="mt-4 space-y-2">
        {STEPS.map((step, i) => {
          const done = activeIndex > i || phase === "COMPLETED";
          const active = step.phase === phase;
          return (
            <li key={step.phase} className="flex items-center gap-3 text-sm">
              <span
                className={cn(
                  "flex h-5 w-5 items-center justify-center rounded-full border text-[10px]",
                  done || active
                    ? "border-[var(--accent)]/50 bg-[var(--accent-soft)] text-[var(--accent)]"
                    : "border-[var(--border)] text-[var(--muted-dim)]",
                )}
              >
                {done && !active ? "✓" : i + 1}
              </span>
              <span
                className={cn(
                  active
                    ? "text-[var(--fg)]"
                    : done
                      ? "text-[var(--muted)]"
                      : "text-[var(--muted-dim)]",
                )}
              >
                {step.label}
              </span>
            </li>
          );
        })}
      </ol>

      {statusLine ? (
        <p className="mt-4 border-t border-[var(--border)] pt-3 font-mono-ui text-xs text-[var(--soft-blue)]">
          {statusLine}
        </p>
      ) : null}
    </div>
  );
}
