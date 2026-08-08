"use client";

import { cn } from "@/lib/utils/cn";
import type { UiPhase } from "@/lib/types";
import { phaseLabel } from "@/lib/utils/format";
import { Badge } from "@/components/ui/Badge";

const phaseTone: Record<
  UiPhase,
  "neutral" | "accent" | "success" | "warning" | "danger" | "info"
> = {
  idle: "neutral",
  thinking: "info",
  waiting_for_screenshot: "warning",
  executing: "accent",
  verifying: "info",
  waiting_for_user: "warning",
  completed: "success",
  failed: "danger",
};

export function PhaseBadge({
  phase,
  className,
}: {
  phase: UiPhase;
  className?: string;
}) {
  const active =
    phase !== "idle" && phase !== "completed" && phase !== "failed";

  return (
    <Badge
      tone={phaseTone[phase]}
      pulse={active}
      className={cn(className)}
    >
      {phaseLabel(phase)}
    </Badge>
  );
}
