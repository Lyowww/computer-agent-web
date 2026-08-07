"use client";

import { useQuery } from "@tanstack/react-query";
import { AppShell } from "@/components/layout/AppShell";
import { ErrorBanner } from "@/components/ui/ErrorBanner";
import { getMe } from "@/lib/api/auth";
import { getHealth } from "@/lib/api/health";
import { getApiBaseUrl } from "@/lib/api/client";
import { useAuthStore } from "@/stores/authStore";
import { useChatStore } from "@/stores/chatStore";

export default function SettingsPage() {
  const user = useAuthStore((s) => s.user);
  const wsConnected = useChatStore((s) => s.wsConnected);
  const meQuery = useQuery({ queryKey: ["me"], queryFn: getMe });
  const healthQuery = useQuery({
    queryKey: ["health"],
    queryFn: getHealth,
    retry: false,
  });

  const profile = meQuery.data || user;

  return (
    <AppShell>
      <div className="mx-auto max-w-3xl space-y-6">
        <header>
          <h1 className="font-[family-name:var(--font-display)] text-3xl tracking-tight">
            Settings
          </h1>
          <p className="mt-1 text-sm text-[var(--muted)]">
            Account and connection preferences
          </p>
        </header>

        <section className="rounded-2xl border border-[var(--border)] bg-white/80 p-5">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-[var(--muted)]">
            Account
          </h2>
          <dl className="mt-3 space-y-2 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-[var(--muted)]">Name</dt>
              <dd className="font-medium">{profile?.name || "—"}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-[var(--muted)]">Email</dt>
              <dd className="font-medium">{profile?.email}</dd>
            </div>
          </dl>
        </section>

        <section className="rounded-2xl border border-[var(--border)] bg-white/80 p-5">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-[var(--muted)]">
            Connectivity
          </h2>
          <dl className="mt-3 space-y-2 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-[var(--muted)]">API</dt>
              <dd className="truncate font-mono text-xs">{getApiBaseUrl()}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-[var(--muted)]">WebSocket</dt>
              <dd className="font-medium">
                {wsConnected ? "Connected" : "Disconnected"}
              </dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-[var(--muted)]">Backend health</dt>
              <dd className="font-medium">
                {healthQuery.isLoading
                  ? "Checking…"
                  : healthQuery.data?.status || "Unavailable"}
              </dd>
            </div>
          </dl>
          {healthQuery.isError ? (
            <div className="mt-3">
              <ErrorBanner message="Backend health check failed. Confirm NEXT_PUBLIC_API_URL." />
            </div>
          ) : null}
        </section>

        <section className="rounded-2xl border border-[var(--border)] bg-white/80 p-5">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-[var(--muted)]">
            Security
          </h2>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-[var(--muted)]">
            <li>JWT access tokens are kept in sessionStorage for this browser tab.</li>
            <li>Device authentication tokens are shown once at creation and never stored here.</li>
            <li>AI provider API keys and backend secrets never ship in frontend source.</li>
            <li>Voice STT/TTS calls go to your backend (`/api/voice/*`), not third-party keys in the browser.</li>
          </ul>
        </section>
      </div>
    </AppShell>
  );
}
