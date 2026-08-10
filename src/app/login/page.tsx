"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { ArrowLeft, ShieldAlert } from "lucide-react";
import { login } from "@/lib/api/auth";
import { loginSchema } from "@/lib/validators/schemas";
import { useAuthStore } from "@/stores/authStore";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { ErrorBanner } from "@/components/ui/ErrorBanner";
import { Badge } from "@/components/ui/Badge";

export default function LoginPage() {
  const router = useRouter();
  const token = useAuthStore((s) => s.token);
  const setSession = useAuthStore((s) => s.setSession);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (token) router.replace("/dashboard/");
  }, [token, router]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const parsed = loginSchema.safeParse({ email, password });
      if (!parsed.success) {
        setError(parsed.error.issues[0]?.message || "Invalid credentials");
        return;
      }
      const result = await login(parsed.data);
      setSession(result.user, result.accessToken);
      router.replace("/dashboard/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Authentication failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="relative min-h-[100dvh] overflow-hidden bg-[var(--bg)]">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(57,213,242,0.14),transparent_45%),radial-gradient(circle_at_80%_0%,rgba(99,230,173,0.1),transparent_40%),linear-gradient(160deg,#05080b,#070b0e_45%,#0a1016)]" />
        <div className="atmosphere-grid absolute inset-0 opacity-50" />
      </div>

      <div className="relative mx-auto flex min-h-[100dvh] max-w-6xl flex-col justify-center px-4 py-8 sm:py-10 md:flex-row md:items-center md:gap-16 md:px-8">
        <div className="mb-8 max-w-lg md:mb-0">
          <Link
            href="/"
            className="mb-6 inline-flex items-center gap-2 text-sm text-[var(--muted)] hover:text-[var(--accent)]"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to PetAI
          </Link>
          <p className="font-display text-4xl tracking-tight text-[var(--fg)] sm:text-5xl md:text-6xl">
            PETAI
          </p>
          <h1 className="mt-3 text-xl font-semibold text-[var(--fg)] sm:mt-4 sm:text-2xl md:text-3xl">
            Developer access
          </h1>
          <p className="mt-3 max-w-md text-sm text-[var(--muted)] sm:text-base">
            Sign in to monitor devices, chat with the agent, capture screens, and
            approve sensitive actions in real time.
          </p>
        </div>

        <form
          onSubmit={(e) => void onSubmit(e)}
          className="w-full max-w-md rounded-2xl border border-[var(--border)] bg-[color-mix(in_srgb,var(--panel-elevated)_92%,transparent)] p-5 shadow-[0_24px_64px_-28px_rgba(0,0,0,0.7)] backdrop-blur-xl sm:rounded-3xl sm:p-7"
        >
          <div className="mb-5 flex items-start gap-3 rounded-xl border border-[var(--warning)]/30 bg-[var(--warning-soft)] p-3">
            <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-[var(--warning)]" />
            <div className="min-w-0">
              <Badge tone="warning" className="mb-1.5">
                Signup closed
              </Badge>
              <p className="text-xs leading-relaxed text-[var(--muted)]">
                Public registration is closed. Sign in with an existing account,
                or join the waitlist from the landing page for early access.
              </p>
            </div>
          </div>

          {error ? (
            <div className="mb-4">
              <ErrorBanner message={error} onDismiss={() => setError(null)} />
            </div>
          ) : null}

          <div className="space-y-3">
            <Input
              label="Email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Input
              label="Password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
            />
          </div>

          <Button type="submit" className="mt-5 w-full" loading={busy}>
            {busy ? "Please wait…" : "Sign in"}
          </Button>

          <p className="mt-4 text-center text-xs text-[var(--muted)]">
            Session tokens are stored in the browser session only. No API keys or
            device secrets are embedded in this app.
          </p>
        </form>
      </div>
    </div>
  );
}
