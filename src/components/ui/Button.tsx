"use client";

import { cn } from "@/lib/utils/cn";
import { Loader2 } from "lucide-react";
import type { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "ghost" | "danger" | "outline";
type Size = "sm" | "md" | "lg" | "icon";

const variants: Record<Variant, string> = {
  primary:
    "bg-[var(--accent)] text-white hover:bg-[var(--accent-strong)] shadow-[0_0_0_1px_rgba(6,182,212,0.25),0_8px_24px_-12px_var(--accent-glow)] hover:shadow-[0_0_20px_-4px_var(--accent-glow)]",
  secondary:
    "bg-[var(--accent-soft)] text-[var(--accent)] hover:bg-[color-mix(in_srgb,var(--accent)_22%,transparent)]",
  ghost: "bg-transparent text-[var(--fg)] hover:bg-[var(--accent-soft)]",
  danger:
    "bg-[var(--danger)] text-white hover:brightness-110 shadow-[0_8px_24px_-12px_rgba(225,29,72,0.5)]",
  outline:
    "border border-[var(--border)] bg-[var(--panel)]/70 text-[var(--fg)] hover:border-[var(--border-strong)] hover:bg-[var(--panel-elevated)]",
};

const sizes: Record<Size, string> = {
  sm: "min-h-[36px] px-3 py-1.5 text-sm",
  md: "min-h-[40px] px-4 py-2 text-sm",
  lg: "min-h-[44px] px-5 py-2.5 text-base",
  icon: "h-10 w-10 min-h-[40px] min-w-[40px] p-0",
};

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
}

export function Button({
  className,
  variant = "primary",
  size = "md",
  type = "button",
  loading = false,
  disabled,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-all duration-150",
        "active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 disabled:active:scale-100",
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    >
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
      {children}
    </button>
  );
}
