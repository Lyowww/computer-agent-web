"use client";

import { useEffect, type ReactNode } from "react";
import { useAuthStore } from "@/stores/authStore";

export function AuthHydrator({ children }: { children: ReactNode }) {
  const hydrate = useAuthStore((s) => s.hydrate);
  const hydrated = useAuthStore((s) => s.hydrated);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  if (!hydrated) {
    return (
      <div className="flex min-h-[100dvh] flex-col items-center justify-center gap-3 bg-[var(--bg)]">
        <p className="font-display text-2xl tracking-tight text-[var(--fg)]">
          PETAI
        </p>
        <p className="font-mono-ui text-xs text-[var(--muted)]">
          Initializing agent interface…
        </p>
        <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent)] animate-connect-pulse" />
      </div>
    );
  }

  return children;
}
