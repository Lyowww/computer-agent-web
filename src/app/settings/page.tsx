"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Check, Copy, Activity, Terminal } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { ErrorBanner } from "@/components/ui/ErrorBanner";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { getMe } from "@/lib/api/auth";
import { getHealth } from "@/lib/api/health";
import { getApiBaseUrl } from "@/lib/api/client";
import { useAuthStore } from "@/stores/authStore";
import { useChatStore } from "@/stores/chatStore";
import { useToast } from "@/components/ui/Toast";

const INSTALL_SCRIPTS = [
  {
    os: "macOS",
    script: "curl -sSL https://get.petai.dev/agent/macos | bash",
  },
  {
    os: "Linux",
    script: "curl -sSL https://get.petai.dev/agent/linux | bash",
  },
  {
    os: "Windows (PowerShell)",
    script:
      "irm https://get.petai.dev/agent/windows.ps1 | iex",
  },
] as const;

function avatarInitials(name?: string | null, email?: string | null) {
  const source = (name || email || "?").trim();
  const parts = source.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return source.slice(0, 2).toUpperCase();
}

export default function SettingsPage() {
  const user = useAuthStore((s) => s.user);
  const wsConnected = useChatStore((s) => s.wsConnected);
  const { toast } = useToast();
  const meQuery = useQuery({ queryKey: ["me"], queryFn: getMe });
  const healthQuery = useQuery({
    queryKey: ["health"],
    queryFn: getHealth,
    retry: false,
  });
  const [pingMs, setPingMs] = useState<number | null>(null);
  const [pingBusy, setPingBusy] = useState(false);
  const [pingError, setPingError] = useState<string | null>(null);
  const [copiedOs, setCopiedOs] = useState<string | null>(null);

  const profile = meQuery.data || user;

  async function runDiagnostics() {
    setPingBusy(true);
    setPingError(null);
    const started = performance.now();
    try {
      const base = getApiBaseUrl().replace(/\/$/, "");
      const res = await fetch(`${base}/api/health`, {
        method: "GET",
        cache: "no-store",
      });
      const elapsed = Math.round(performance.now() - started);
      setPingMs(elapsed);
      if (!res.ok) {
        setPingError(`HTTP ${res.status}`);
        toast("Health check failed", "error");
      } else {
        toast(`API latency ${elapsed}ms`, "success");
        void healthQuery.refetch();
      }
    } catch (err) {
      setPingError(err instanceof Error ? err.message : "Ping failed");
      setPingMs(null);
      toast("Connection test failed", "error");
    } finally {
      setPingBusy(false);
    }
  }

  async function copyScript(os: string, script: string) {
    await navigator.clipboard.writeText(script);
    setCopiedOs(os);
    toast("Install script copied", "success");
    setTimeout(() => setCopiedOs(null), 1500);
  }

  return (
    <AppShell>
      <div className="mx-auto max-w-3xl space-y-4 sm:space-y-6">
        <header>
          <h1 className="font-[family-name:var(--font-display)] text-2xl tracking-tight sm:text-3xl">
            Settings
          </h1>
          <p className="mt-1 text-sm text-[var(--muted)]">
            Account, diagnostics, and agent installation
          </p>
        </header>

        <Card>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-[var(--muted)]">
            Account
          </h2>
          <div className="mt-4 flex items-center gap-4">
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl border border-[var(--border)] bg-[var(--accent-soft)] font-[family-name:var(--font-mono)] text-lg font-semibold text-[var(--accent)]">
              {avatarInitials(profile?.name, profile?.email)}
            </span>
            <dl className="min-w-0 flex-1 space-y-2 text-sm">
              <div>
                <dt className="text-[var(--muted)]">Name</dt>
                <dd className="font-medium break-all">{profile?.name || "—"}</dd>
              </div>
              <div>
                <dt className="text-[var(--muted)]">Email</dt>
                <dd className="font-medium break-all">{profile?.email}</dd>
              </div>
            </dl>
          </div>
        </Card>

        <Card>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="text-sm font-semibold uppercase tracking-wide text-[var(--muted)]">
                Connectivity
              </h2>
              <p className="mt-1 text-xs text-[var(--muted)]">
                REST + WebSocket diagnostic suite
              </p>
            </div>
            <Button
              size="sm"
              variant="outline"
              loading={pingBusy}
              onClick={() => void runDiagnostics()}
            >
              <Activity className="h-3.5 w-3.5" />
              Run ping test
            </Button>
          </div>
          <dl className="mt-4 space-y-3 text-sm">
            <div className="flex flex-col gap-0.5 sm:flex-row sm:justify-between sm:gap-4">
              <dt className="text-[var(--muted)]">API</dt>
              <dd className="break-all font-[family-name:var(--font-mono)] text-xs">
                {getApiBaseUrl()}
              </dd>
            </div>
            <div className="flex flex-col gap-0.5 sm:flex-row sm:justify-between sm:gap-4">
              <dt className="text-[var(--muted)]">WebSocket</dt>
              <dd>
                <Badge tone={wsConnected ? "success" : "warning"} pulse={wsConnected}>
                  {wsConnected ? "Connected" : "Disconnected"}
                </Badge>
              </dd>
            </div>
            <div className="flex flex-col gap-0.5 sm:flex-row sm:justify-between sm:gap-4">
              <dt className="text-[var(--muted)]">Backend health</dt>
              <dd className="font-medium">
                {healthQuery.isLoading
                  ? "Checking…"
                  : healthQuery.data?.status || "Unavailable"}
              </dd>
            </div>
            <div className="flex flex-col gap-0.5 sm:flex-row sm:justify-between sm:gap-4">
              <dt className="text-[var(--muted)]">Last ping</dt>
              <dd className="font-[family-name:var(--font-mono)] font-medium">
                {pingMs !== null ? `${pingMs} ms` : "—"}
                {pingError ? (
                  <span className="ml-2 text-[var(--danger)]">{pingError}</span>
                ) : null}
              </dd>
            </div>
          </dl>
          {healthQuery.isError ? (
            <div className="mt-3">
              <ErrorBanner message="Backend health check failed. Confirm NEXT_PUBLIC_API_URL." />
            </div>
          ) : null}
        </Card>

        <Card>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-[var(--muted)]">
            Agent installation
          </h2>
          <p className="mt-1 text-xs text-[var(--muted)]">
            Copy the install script for your OS, then paste the device token from
            Devices → Show Agent Key.
          </p>
          <ul className="mt-4 space-y-3">
            {INSTALL_SCRIPTS.map((item) => (
              <li
                key={item.os}
                className="rounded-xl border border-[var(--border)] bg-[#0a0f18] p-3"
              >
                <div className="mb-2 flex items-center justify-between gap-2">
                  <span className="inline-flex items-center gap-2 text-sm font-medium text-slate-200">
                    <Terminal className="h-3.5 w-3.5 text-cyan-400" />
                    {item.os}
                  </span>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => void copyScript(item.os, item.script)}
                  >
                    {copiedOs === item.os ? (
                      <Check className="h-3.5 w-3.5" />
                    ) : (
                      <Copy className="h-3.5 w-3.5" />
                    )}
                    {copiedOs === item.os ? "Copied" : "Copy"}
                  </Button>
                </div>
                <pre className="overflow-x-auto whitespace-pre-wrap break-all font-[family-name:var(--font-mono)] text-[11px] text-cyan-300/90">
                  {item.script}
                </pre>
              </li>
            ))}
          </ul>
        </Card>

        <Card>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-[var(--muted)]">
            Security
          </h2>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-[var(--muted)]">
            <li>JWT access tokens are kept in sessionStorage for this browser tab.</li>
            <li>
              Device authentication tokens stay available on Devices under Show
              Agent Key.
            </li>
            <li>AI provider API keys and backend secrets never ship in frontend source.</li>
            <li>
              Voice STT/TTS calls go to your backend (`/api/voice/*`), not
              third-party keys in the browser.
            </li>
          </ul>
        </Card>
      </div>
    </AppShell>
  );
}
