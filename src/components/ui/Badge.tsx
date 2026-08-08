"use client";

import { cn } from "@/lib/utils/cn";
import type { HTMLAttributes } from "react";

type BadgeTone =
  | "neutral"
  | "accent"
  | "success"
  | "warning"
  | "danger"
  | "info";

const tones: Record<BadgeTone, string> = {
  neutral: "bg-[var(--panel-elevated)] text-[var(--muted)] border-[var(--border)]",
  accent: "bg-[var(--accent-soft)] text-[var(--accent)] border-[color-mix(in_srgb,var(--accent)_35%,transparent)]",
  success: "bg-[var(--success-soft)] text-[var(--success)] border-[color-mix(in_srgb,var(--success)_35%,transparent)]",
  warning: "bg-[var(--warning-soft)] text-[var(--warning)] border-[color-mix(in_srgb,var(--warning)_35%,transparent)]",
  danger: "bg-[var(--danger-soft)] text-[var(--danger)] border-[color-mix(in_srgb,var(--danger)_35%,transparent)]",
  info: "bg-[var(--accent-soft)] text-[var(--accent-strong)] border-[color-mix(in_srgb,var(--accent)_30%,transparent)]",
};

export function Badge({
  className,
  tone = "neutral",
  pulse = false,
  children,
  ...props
}: HTMLAttributes<HTMLSpanElement> & {
  tone?: BadgeTone;
  pulse?: boolean;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-semibold tracking-wide",
        tones[tone],
        className,
      )}
      {...props}
    >
      {pulse ? (
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-current" />
      ) : null}
      {children}
    </span>
  );
}
