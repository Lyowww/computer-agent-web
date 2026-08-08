"use client";

import { cn } from "@/lib/utils/cn";
import type { ConnectionStatus } from "@/lib/types";
import { connectionLabel } from "@/lib/utils/format";

export function StatusDot({
  status,
  className,
  showLabel = true,
}: {
  status: ConnectionStatus | string;
  className?: string;
  showLabel?: boolean;
}) {
  const online = status === "ONLINE";
  const revoked = status === "REVOKED";
  return (
    <span className={cn("inline-flex items-center gap-2 text-sm", className)}>
      <span
        className={cn(
          "relative flex h-2.5 w-2.5",
          online && "animate-pulse-glow",
        )}
      >
        <span
          className={cn(
            "absolute inline-flex h-full w-full rounded-full opacity-60",
            online && "animate-ping bg-emerald-400",
          )}
        />
        <span
          className={cn(
            "relative inline-flex h-2.5 w-2.5 rounded-full",
            online && "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.7)]",
            !online && !revoked && "bg-slate-400",
            revoked && "bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]",
          )}
        />
      </span>
      {showLabel ? connectionLabel(status) : null}
    </span>
  );
}
