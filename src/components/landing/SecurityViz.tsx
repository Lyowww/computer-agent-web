"use client";

import { Check, X } from "lucide-react";

const ALLOWED = ["click", "type", "hotkey", "open app", "wait", "screenshot"];
const BLOCKED = ["shell", "eval", "arbitrary code"];

export function SecurityViz() {
  return (
    <section className="landing-section">
      <div className="landing-container">
        <div className="max-w-2xl">
          <h2 className="font-display text-3xl tracking-tight sm:text-4xl md:text-5xl">
            Secure by architecture.
          </h2>
          <p className="mt-4 text-base text-[var(--muted)] sm:text-lg">
            The AI returns structured actions. A secure gate validates them with
            Zod before the desktop agent can touch the OS.
          </p>
        </div>

        <div className="mt-10 overflow-hidden rounded-2xl border border-[var(--border-strong)] bg-[var(--panel)]/60">
          <div className="grid divide-y divide-[var(--border)] md:grid-cols-4 md:divide-x md:divide-y-0">
            {[
              { title: "AI Brain", body: "Vision + planning" },
              { title: "Secure Gate", body: "Zod-validated actions" },
              { title: "Desktop Agent", body: "Electron + OS APIs" },
              { title: "Real Computer", body: "Mouse, keys, apps" },
            ].map((node, i) => (
              <div key={node.title} className="relative p-5 sm:p-6">
                <p className="font-mono-ui text-[10px] uppercase tracking-[0.18em] text-[var(--accent)]">
                  {String(i + 1).padStart(2, "0")}
                </p>
                <p className="mt-2 text-lg font-medium text-[var(--fg)]">
                  {node.title}
                </p>
                <p className="mt-1 text-sm text-[var(--muted)]">{node.body}</p>
                {i < 3 ? (
                  <span className="absolute bottom-3 right-4 hidden text-[var(--muted-dim)] md:block">
                    →
                  </span>
                ) : null}
              </div>
            ))}
          </div>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-[var(--danger)]/25 bg-[var(--danger-soft)] p-5">
            <p className="text-sm font-medium text-[var(--danger)]">Not allowed</p>
            <ul className="mt-3 space-y-2">
              {BLOCKED.map((item) => (
                <li key={item} className="flex items-center gap-2 text-sm text-[var(--muted)]">
                  <X className="h-4 w-4 text-[var(--danger)]" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-2xl border border-[var(--success)]/25 bg-[var(--success-soft)] p-5">
            <p className="text-sm font-medium text-[var(--success)]">Allowed actions</p>
            <ul className="mt-3 grid grid-cols-2 gap-2">
              {ALLOWED.map((item) => (
                <li key={item} className="flex items-center gap-2 text-sm text-[var(--muted)]">
                  <Check className="h-4 w-4 text-[var(--success)]" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
