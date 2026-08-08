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
  sm: "p-3 sm:p-4",
  md: "p-4 sm:p-5",
  lg: "p-5 sm:p-6",
};

export function Card({
  className,
  elevated = false,
  noise = true,
  padding = "md",
  children,
  ...props
}: CardProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl border border-[var(--border)]",
        elevated ? "bg-[var(--panel-elevated)]" : "bg-[var(--panel)]/90",
        "shadow-[0_1px_0_0_rgba(255,255,255,0.04)_inset,0_12px_40px_-24px_rgba(0,0,0,0.45)]",
        paddings[padding],
        className,
      )}
      {...props}
    >
      {noise ? (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-60 panel-noise mix-blend-overlay"
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
  return <div className={cn("mb-3 flex items-start justify-between gap-3", className)} {...props} />;
}

export function CardTitle({
  className,
  ...props
}: HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={cn(
        "font-[family-name:var(--font-display)] text-lg tracking-tight sm:text-xl",
        className,
      )}
      {...props}
    />
  );
}
