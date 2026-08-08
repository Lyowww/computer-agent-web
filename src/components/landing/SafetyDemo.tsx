"use client";

import { useState } from "react";
import { Lock, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils/cn";

const FLOW = [
  "AI proposes action",
  "Detects consequential action",
  "PAUSES",
  "USER APPROVES",
  "CONTINUES",
];

export function SafetyDemo() {
  const [approved, setApproved] = useState<boolean | null>(null);
  const stage =
    approved === null ? 2 : approved ? 4 : 2;

  return (
    <section id="safety" className="landing-section bg-[var(--bg-elevated)]/50">
      <div className="landing-container">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--panel)]/60 px-3 py-1 text-xs text-[var(--muted)]">
            <ShieldCheck className="h-3.5 w-3.5 text-[var(--accent)]" />
            Human-in-the-loop
          </div>
          <h2 className="mt-4 font-display text-3xl tracking-tight sm:text-4xl md:text-5xl">
            Powerful enough to act. Designed to ask first.
          </h2>
          <p className="mt-4 text-base text-[var(--muted)] sm:text-lg">
            When an action looks consequential — purchases, deletes, credential
            changes — PetAI pauses and waits for your approval.
          </p>
        </div>

        <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_0.9fr] lg:items-center">
          <div className="rounded-2xl border border-[var(--warning)]/30 bg-[var(--panel)] p-5 shadow-[var(--shadow-soft)] sm:p-6">
            <div className="flex items-center gap-2 text-[var(--warning)]">
              <Lock className="h-4 w-4" />
              <span className="font-mono-ui text-xs uppercase tracking-[0.16em]">
                PetAI wants to continue
              </span>
            </div>
            <p className="mt-5 text-sm text-[var(--muted)]">Action</p>
            <p className="mt-1 text-lg font-medium text-[var(--fg)]">
              Purchase item
            </p>
            <p className="mt-4 text-sm text-[var(--muted)]">Reason</p>
            <p className="mt-1 text-sm leading-relaxed text-[var(--muted)]">
              This action has external consequences.
            </p>

            {approved === null ? (
              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={() => setApproved(false)}
                  className="focus-ring min-h-[44px] flex-1 rounded-xl border border-[var(--border-strong)] px-4 text-sm font-medium"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => setApproved(true)}
                  className="focus-ring min-h-[44px] flex-1 rounded-xl bg-[var(--accent)] px-4 text-sm font-semibold text-white"
                >
                  Approve
                </button>
              </div>
            ) : (
              <div className="mt-6 rounded-xl border border-[var(--border)] bg-[var(--bg)]/60 px-4 py-3 text-sm">
                {approved ? (
                  <span className="text-[var(--success)]">
                    Approved — agent continues with verification.
                  </span>
                ) : (
                  <span className="text-[var(--muted)]">
                    Cancelled — no further actions will run for this step.
                  </span>
                )}
                <button
                  type="button"
                  className="ml-3 text-[var(--accent)] underline-offset-2 hover:underline"
                  onClick={() => setApproved(null)}
                >
                  Reset demo
                </button>
              </div>
            )}
          </div>

          <ol className="space-y-3">
            {FLOW.map((label, i) => (
              <li
                key={label}
                className={cn(
                  "flex items-center gap-4 rounded-xl border px-4 py-3 text-sm transition",
                  i <= stage
                    ? "border-[var(--accent)]/30 bg-[var(--accent-soft)] text-[var(--fg)]"
                    : "border-[var(--border)] text-[var(--muted-dim)]",
                )}
              >
                <span className="font-mono-ui text-xs text-[var(--accent)]">
                  {String(i + 1).padStart(2, "0")}
                </span>
                {label}
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
