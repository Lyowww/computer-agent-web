"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { ArrowLeft, ShieldAlert } from "lucide-react";
import { login, register } from "@/lib/api/auth";
import { loginSchema, registerSchema } from "@/lib/validators/schemas";
import { useAuthStore } from "@/stores/authStore";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { ErrorBanner } from "@/components/ui/ErrorBanner";
import { Badge } from "@/components/ui/Badge";

export default function LoginPage() {
  const router = useRouter();
  const token = useAuthStore((s) => s.token);
  const setSession = useAuthStore((s) => s.setSession);
  const [mode, setMode] = useState<"login" | "register">("login");
  const [devBypass, setDevBypass] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
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
      if (mode === "login") {
        const parsed = loginSchema.safeParse({ email, password });
        if (!parsed.success) {
          setError(parsed.error.issues[0]?.message || "Invalid credentials");
          return;
        }
        const result = await login(parsed.data);
        setSession(result.user, result.accessToken);
      } else {
        if (!devBypass) {
          setError(
            "Public registration is disabled. Join the waitlist from the landing page.",
          );
          return;
        }
        const parsed = registerSchema.safeParse({
          email,
          password,
          name: name || undefined,
        });
        if (!parsed.success) {
          setError(parsed.error.issues[0]?.message || "Invalid registration");
          return;
        }
        const result = await register(parsed.data);
        setSession(result.user, result.accessToken);
      }
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
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(57,213,242,0.16),transparent_45%),radial-gradient(circle_at_80%_0%,rgba(99,230,173,0.12),transparent_40%),linear-gradient(160deg,#f1ece2,#e8e2d4_45%,#ddd6c6)]" />
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
          className="w-full max-w-md rounded-2xl border border-[var(--border-strong)] bg-[var(--panel)]/90 p-5 shadow-2xl backdrop-blur sm:rounded-3xl sm:p-6"
        >
          <div className="mb-4 flex items-start gap-3 rounded-xl border border-[var(--warning)]/30 bg-[var(--warning-soft)] p-3">
            <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-[var(--warning)]" />
            <div className="min-w-0">
              <Badge tone="warning" className="mb-1.5">
                Coming Soon Mode Active
              </Badge>
              <p className="text-xs leading-relaxed text-[var(--muted)]">
                Public registration is closed. Sign in if you already have an
                account, or enable developer bypass to create one.
              </p>
            </div>
          </div>

          <div className="mb-5 flex rounded-xl bg-[var(--panel-elevated)] p-1">
            <button
              type="button"
              className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium transition ${
                mode === "login"
                  ? "bg-[var(--panel)] text-[var(--fg)] shadow-sm"
                  : "text-[var(--muted)]"
              }`}
              onClick={() => setMode("login")}
            >
              Sign in
            </button>
            <button
              type="button"
              className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium transition ${
                mode === "register"
                  ? "bg-[var(--panel)] text-[var(--fg)] shadow-sm"
                  : "text-[var(--muted)]"
              }`}
              onClick={() => setMode("register")}
            >
              Create account
            </button>
          </div>

          {error ? (
            <div className="mb-4">
              <ErrorBanner message={error} onDismiss={() => setError(null)} />
            </div>
          ) : null}

          {mode === "register" ? (
            <div className="mb-3 space-y-3">
              <label className="flex min-h-[44px] items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--panel-elevated)] px-3 py-2 text-sm">
                <input
                  type="checkbox"
                  checked={devBypass}
                  onChange={(e) => setDevBypass(e.target.checked)}
                  className="accent-[var(--accent)]"
                />
                Developer bypass (internal / test)
              </label>
              <Input
                label="Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Optional"
                disabled={!devBypass}
              />
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
              autoComplete={mode === "login" ? "current-password" : "new-password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
            />
          </div>

          <Button
            type="submit"
            className="mt-5 w-full"
            loading={busy}
            disabled={mode === "register" && !devBypass}
          >
            {busy
              ? "Please wait…"
              : mode === "login"
                ? "Sign in"
                : "Create account"}
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
