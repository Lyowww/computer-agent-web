"use client";

import { AlertTriangle, X } from "lucide-react";
import { Button } from "@/components/ui/Button";

export function ErrorBanner({
  message,
  onDismiss,
}: {
  message: string;
  onDismiss?: () => void;
}) {
  return (
    <div
      role="alert"
      className="flex items-start gap-3 rounded-xl border border-[color-mix(in_srgb,var(--danger)_35%,transparent)] bg-[var(--danger-soft)] px-4 py-3 text-sm text-[var(--danger)]"
    >
      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
      <p className="flex-1 text-[var(--fg)]">{message}</p>
      {onDismiss ? (
        <Button variant="ghost" size="sm" onClick={onDismiss} aria-label="Dismiss">
          <X className="h-4 w-4" />
        </Button>
      ) : null}
    </div>
  );
}
