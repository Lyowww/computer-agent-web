"use client";

import { CheckCircle2, Circle, Loader2, XCircle } from "lucide-react";
import type { TaskProgressStep } from "@/lib/types";
import { PhaseBadge } from "@/components/ui/PhaseBadge";
import type { UiPhase } from "@/lib/types";
import { Card } from "@/components/ui/Card";

export function TaskProgress({
  steps,
  phase,
}: {
  steps: TaskProgressStep[];
  phase: UiPhase;
}) {
  if (!steps.length && phase === "idle") return null;

  return (
    <Card>
      <div className="mb-3 flex items-center justify-between gap-2">
        <h3 className="text-sm font-semibold">Task status</h3>
        <PhaseBadge phase={phase} />
      </div>
      <ol className="space-y-2">
        {steps.map((step) => (
          <li key={step.id} className="flex items-start gap-2 text-sm">
            {step.status === "active" ? (
              <Loader2 className="mt-0.5 h-4 w-4 animate-spin text-[var(--accent)]" />
            ) : step.status === "done" ? (
              <CheckCircle2 className="mt-0.5 h-4 w-4 text-[var(--success)]" />
            ) : step.status === "error" ? (
              <XCircle className="mt-0.5 h-4 w-4 text-[var(--danger)]" />
            ) : (
              <Circle className="mt-0.5 h-4 w-4 text-[var(--muted)]" />
            )}
            <span
              className={
                step.status === "active"
                  ? "font-medium text-[var(--fg)]"
                  : "text-[var(--muted)]"
              }
            >
              {step.label}
            </span>
          </li>
        ))}
      </ol>
    </Card>
  );
}
