"use client";

import { cn } from "@/lib/utils/cn";
import { Loader2 } from "lucide-react";
import type { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "ghost" | "danger" | "outline";
type Size = "sm" | "md" | "lg" | "icon";

const variants: Record<Variant, string> = {
  primary:
    "bg-[linear-gradient(135deg,#5ae0f7_0%,#39d5f2_48%,#2bb8d4_100%)] text-[#041016] hover:brightness-110 shadow-[0_10px_28px_-14px_var(--accent-glow)] border border-transparent",
  secondary:
    "bg-[var(--accent-soft)] text-[var(--accent)] border border-[color-mix(in_srgb,var(--accent)_28%,transparent)] hover:bg-[color-mix(in_srgb,var(--accent)_20%,transparent)]",
  ghost:
    "bg-transparent text-[var(--muted)] border border-transparent hover:bg-[var(--accent-soft)] hover:text-[var(--fg)]",
  danger:
    "bg-[var(--danger)] text-white hover:brightness-105 shadow-[0_8px_24px_-12px_rgba(227,93,114,0.4)] border border-transparent",
  outline:
    "border border-[var(--border-strong)] bg-[var(--panel-elevated)] text-[var(--fg)] hover:border-[var(--accent)]/45 hover:bg-[var(--bg-elevated)]",
};

const sizes: Record<Size, string> = {
  sm: "min-h-9 px-3.5 py-1.5 text-sm gap-1.5",
  md: "min-h-10 px-4 py-2 text-sm gap-2",
  lg: "min-h-11 px-5 py-2.5 text-[0.9375rem] gap-2",
  icon: "h-10 w-10 min-h-10 min-w-10 p-0",
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
        "inline-flex items-center justify-center rounded-xl font-medium tracking-tight transition-all duration-150",
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
