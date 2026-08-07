"use client";

import { cn } from "@/lib/utils/cn";
import type { UiPhase } from "@/lib/types";
import { phaseLabel } from "@/lib/utils/format";

const styles: Record<UiPhase, string> = {
  idle: "bg-slate-100 text-slate-600",
  thinking: "bg-sky-100 text-sky-700",
  waiting_for_screenshot: "bg-amber-100 text-amber-800",
  executing: "bg-cyan-100 text-cyan-800",
  verifying: "bg-indigo-100 text-indigo-800",
  waiting_for_user: "bg-orange-100 text-orange-800",
  completed: "bg-emerald-100 text-emerald-800",
  failed: "bg-rose-100 text-rose-800",
};

export function PhaseBadge({
  phase,
  className,
}: {
  phase: UiPhase;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-lg px-2.5 py-1 text-xs font-semibold tracking-wide",
        styles[phase],
        className,
      )}
    >
      {phase !== "idle" && phase !== "completed" && phase !== "failed" ? (
        <span className="mr-1.5 h-1.5 w-1.5 animate-pulse rounded-full bg-current" />
      ) : null}
      {phaseLabel(phase)}
    </span>
  );
}
