"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { login, register } from "@/lib/api/auth";
import { loginSchema, registerSchema } from "@/lib/validators/schemas";
import { useAuthStore } from "@/stores/authStore";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { ErrorBanner } from "@/components/ui/ErrorBanner";

export default function LoginPage() {
  const router = useRouter();
  const token = useAuthStore((s) => s.token);
  const setSession = useAuthStore((s) => s.setSession);
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (token) router.replace("/dashboard");
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
      router.replace("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Authentication failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[var(--bg)]">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(14,116,144,0.28),transparent_45%),radial-gradient(circle_at_80%_0%,rgba(15,23,42,0.18),transparent_40%),linear-gradient(160deg,#dbe7f3,#eef4f8_45%,#d9ebe9)]" />
        <div
          className="absolute inset-0 opacity-40"
          style={{
            backgroundImage:
              "radial-gradient(rgba(15,23,42,0.08) 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />
      </div>

      <div className="relative mx-auto flex min-h-screen max-w-6xl flex-col justify-center px-4 py-10 md:flex-row md:items-center md:gap-16 md:px-8">
        <div className="mb-10 max-w-lg md:mb-0">
          <p className="font-[family-name:var(--font-display)] text-5xl tracking-tight text-[var(--fg)] md:text-6xl">
            PetAI
          </p>
          <h1 className="mt-4 text-2xl font-semibold text-slate-800 md:text-3xl">
            Control your computer from anywhere.
          </h1>
          <p className="mt-3 max-w-md text-[var(--muted)]">
            Sign in to monitor devices, chat with the agent, capture screens, and
            approve sensitive actions in real time.
          </p>
        </div>

        <form
          onSubmit={(e) => void onSubmit(e)}
          className="w-full max-w-md rounded-3xl border border-[var(--border)] bg-white/85 p-6 shadow-xl backdrop-blur"
        >
          <div className="mb-5 flex rounded-xl bg-slate-100 p-1">
            <button
              type="button"
              className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium ${
                mode === "login" ? "bg-white shadow-sm" : "text-[var(--muted)]"
              }`}
              onClick={() => setMode("login")}
            >
              Sign in
            </button>
            <button
              type="button"
              className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium ${
                mode === "register" ? "bg-white shadow-sm" : "text-[var(--muted)]"
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
            <div className="mb-3">
              <Input
                label="Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Optional"
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

          <Button type="submit" className="mt-5 w-full" disabled={busy}>
            {busy ? "Please wait…" : mode === "login" ? "Sign in" : "Create account"}
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
