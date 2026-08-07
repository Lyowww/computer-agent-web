"use client";

import { cn } from "@/lib/utils/cn";
import type { ConnectionStatus } from "@/lib/types";
import { connectionLabel } from "@/lib/utils/format";

export function StatusDot({
  status,
  className,
}: {
  status: ConnectionStatus | string;
  className?: string;
}) {
  const online = status === "ONLINE";
  const revoked = status === "REVOKED";
  return (
    <span className={cn("inline-flex items-center gap-2 text-sm", className)}>
      <span
        className={cn(
          "h-2.5 w-2.5 rounded-full",
          online && "bg-emerald-500 shadow-[0_0_0_3px_rgba(16,185,129,0.2)]",
          !online && !revoked && "bg-slate-400",
          revoked && "bg-rose-500",
        )}
      />
      {connectionLabel(status)}
    </span>
  );
}
