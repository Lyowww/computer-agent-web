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
            online && "animate-ping bg-[var(--success)]",
          )}
        />
        <span
          className={cn(
            "relative inline-flex h-2.5 w-2.5 rounded-full",
            online && "bg-[var(--success)] shadow-[0_0_8px_rgba(99,230,173,0.5)]",
            !online && !revoked && "bg-[var(--muted-dim)]",
            revoked && "bg-[var(--danger)] shadow-[0_0_8px_rgba(227,93,114,0.45)]",
          )}
        />
      </span>
      {showLabel ? connectionLabel(status) : null}
    </span>
  );
}
