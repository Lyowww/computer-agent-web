"use client";

import { useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { useAuthStore } from "@/stores/authStore";

export function AuthGuard({ children }: { children: ReactNode }) {
  const router = useRouter();
  const token = useAuthStore((s) => s.token);
  const hydrated = useAuthStore((s) => s.hydrated);

  useEffect(() => {
    if (hydrated && !token) {
      router.replace("/login/");
    }
  }, [hydrated, token, router]);

  if (!hydrated) {
    return (
      <div className="flex min-h-screen items-center justify-center text-[var(--muted)]">
        Loading…
      </div>
    );
  }

  if (!token) return null;

  return children;
}
