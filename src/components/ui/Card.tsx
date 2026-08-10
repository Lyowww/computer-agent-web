"use client";

import { cn } from "@/lib/utils/cn";
import type { HTMLAttributes } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  elevated?: boolean;
  noise?: boolean;
  padding?: "none" | "sm" | "md" | "lg";
}

const paddings = {
  none: "",
  sm: "p-4",
  md: "p-5",
  lg: "p-6 sm:p-7",
};

export function Card({
  className,
  elevated = false,
  noise = false,
  padding = "md",
  children,
  ...props
}: CardProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl border border-[var(--border)]",
        elevated
          ? "bg-[var(--panel-elevated)]"
          : "bg-[color-mix(in_srgb,var(--panel)_92%,transparent)]",
        "shadow-[0_18px_48px_-28px_rgba(0,0,0,0.55),0_1px_0_0_rgba(57,213,242,0.06)_inset]",
        paddings[padding],
        className,
      )}
      {...props}
    >
      {noise ? (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-40 panel-noise mix-blend-overlay"
        />
      ) : null}
      <div className="relative">{children}</div>
    </div>
  );
}

export function CardHeader({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("mb-4 flex items-start justify-between gap-3", className)}
      {...props}
    />
  );
}

export function CardTitle({
  className,
  ...props
}: HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={cn(
        "font-display text-lg tracking-tight sm:text-xl",
        className,
      )}
      {...props}
    />
  );
}
