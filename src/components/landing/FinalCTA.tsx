"use client";

import Link from "next/link";

export function FinalCTA({ onWaitlist }: { onWaitlist: () => void }) {
  return (
    <section className="landing-section relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(77,232,255,0.12),transparent_55%)]" />
      <div className="landing-container relative grid items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]">
        <div>
          <h2 className="font-display text-4xl leading-[1.05] tracking-tight sm:text-5xl md:text-6xl">
            Your computer is already there.
            <br />
            Give it an agent.
          </h2>
          <p className="mt-5 max-w-lg text-base text-[var(--muted)] sm:text-lg">
            Control your device from anywhere with vision, automation, and a
            human approval layer.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={onWaitlist}
              className="focus-ring inline-flex min-h-[48px] items-center justify-center rounded-xl bg-[var(--accent)] px-5 text-base font-semibold text-white"
            >
              Get Early Access
            </button>
            <Link
              href="/login/"
              className="focus-ring inline-flex min-h-[48px] items-center justify-center rounded-xl border border-[var(--border-strong)] px-5 text-base font-medium"
            >
              Developer Login
            </Link>
          </div>
        </div>

        <div className="relative mx-auto flex h-56 w-full max-w-md items-center justify-center sm:h-72">
          <div className="relative flex h-40 w-40 items-center justify-center">
            <span className="absolute inset-0 rounded-full border border-[var(--accent)]/20 animate-connect-pulse" />
            <span className="absolute inset-4 rounded-full border border-[var(--accent)]/30" />
            <span className="h-16 w-16 rounded-full bg-[radial-gradient(circle_at_30%_30%,#7ddfff,#22c7e8_45%,#11171b_75%)] shadow-[0_0_40px_-8px_var(--accent-glow)]" />
            <p className="absolute -bottom-8 font-mono-ui text-xs tracking-[0.2em] text-[var(--accent)]">
              AI CORE
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
