"use client";

import { cn } from "@/lib/utils/cn";
import { X } from "lucide-react";
import { useEffect, type ReactNode } from "react";

export function Sheet({
  open,
  onClose,
  title,
  children,
  className,
}: {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  className?: string;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      <button
        type="button"
        aria-label="Close overlay"
        className="absolute inset-0 bg-[color-mix(in_srgb,var(--graphite)_35%,transparent)] backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title || "Sheet"}
        className={cn(
          "relative z-10 w-full max-w-lg animate-sheet-up rounded-t-3xl border border-[var(--border)] bg-[var(--panel)] shadow-2xl sm:animate-fade-in sm:rounded-3xl",
          "pb-[env(safe-area-inset-bottom)]",
          className,
        )}
      >
        <div className="mx-auto mt-3 h-1 w-10 rounded-full bg-[var(--border-strong)] sm:hidden" />
        {title ? (
          <div className="flex items-center justify-between gap-3 border-b border-[var(--border)] px-5 py-4">
            <h2 className="font-display text-lg tracking-tight">
              {title}
            </h2>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-2 text-[var(--muted)] hover:bg-[var(--accent-soft)] hover:text-[var(--fg)]"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : null}
        <div className="px-5 py-4">{children}</div>
      </div>
    </div>
  );
}
