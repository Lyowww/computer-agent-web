"use client";

import { cn } from "@/lib/utils/cn";
import { Loader2 } from "lucide-react";
import type { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "ghost" | "danger" | "outline";
type Size = "sm" | "md" | "lg" | "icon";

const variants: Record<Variant, string> = {
  primary:
    "bg-[var(--accent)] text-[var(--graphite)] hover:bg-[var(--accent-strong)] hover:text-white shadow-[0_10px_28px_-16px_var(--accent-glow)]",
  secondary:
    "bg-[var(--accent-soft)] text-[var(--steel)] hover:bg-[color-mix(in_srgb,var(--cyan)_22%,white)]",
  ghost: "bg-transparent text-[var(--fg)] hover:bg-[var(--accent-soft)]",
  danger:
    "bg-[var(--danger)] text-white hover:brightness-105 shadow-[0_8px_24px_-12px_rgba(227,93,114,0.35)]",
  outline:
    "border border-[var(--border-strong)] bg-[var(--panel-elevated)] text-[var(--fg)] hover:border-[var(--teal)] hover:bg-[var(--bg-elevated)]",
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
