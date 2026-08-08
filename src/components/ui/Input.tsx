"use client";

import { cn } from "@/lib/utils/cn";
import type { InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export function Input({ className, label, error, id, ...props }: InputProps) {
  const inputId = id || props.name;
  return (
    <label className="block space-y-1.5">
      {label ? (
        <span className="text-sm font-medium text-[var(--fg)]">{label}</span>
      ) : null}
      <input
        id={inputId}
        className={cn(
          "w-full rounded-xl border border-[var(--border)] bg-[var(--panel-elevated)] px-3 py-2.5 text-sm text-[var(--fg)] outline-none transition placeholder:text-[var(--muted)]",
          "focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent-soft)]",
          error && "border-[var(--danger)] focus:border-[var(--danger)] focus:ring-[var(--danger-soft)]",
          className,
        )}
        {...props}
      />
      {error ? <span className="text-xs text-[var(--danger)]">{error}</span> : null}
    </label>
  );
}
