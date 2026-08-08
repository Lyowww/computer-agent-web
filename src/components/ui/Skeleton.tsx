"use client";

import { cn } from "@/lib/utils/cn";
import type { HTMLAttributes } from "react";

export function Skeleton({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-xl bg-[linear-gradient(90deg,var(--border)_0%,var(--panel-elevated)_45%,var(--border)_100%)] bg-[length:200%_100%] animate-[skeleton-shimmer_1.4s_ease-in-out_infinite]",
        className,
      )}
      {...props}
    />
  );
}

export function DeviceCardSkeleton() {
  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--panel)]/90 p-5 space-y-4">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <Skeleton className="h-6 w-36" />
          <Skeleton className="h-4 w-20" />
        </div>
        <Skeleton className="h-5 w-16 rounded-full" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Skeleton className="h-12" />
        <Skeleton className="h-12" />
      </div>
      <Skeleton className="h-10 w-full" />
      <div className="grid grid-cols-2 gap-2">
        <Skeleton className="h-9" />
        <Skeleton className="h-9" />
      </div>
    </div>
  );
}

export function TableRowSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <>
      {Array.from({ length: rows }).map((_, i) => (
        <tr key={i} className="border-t border-[var(--border)]">
          <td className="px-3 py-3 sm:px-4">
            <Skeleton className="h-4 w-32" />
          </td>
          <td className="px-3 py-3 sm:px-4">
            <Skeleton className="h-4 w-14" />
          </td>
          <td className="px-3 py-3 sm:px-4">
            <Skeleton className="h-4 w-12" />
          </td>
        </tr>
      ))}
    </>
  );
}
