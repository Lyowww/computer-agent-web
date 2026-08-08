"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils/cn";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

const STEPS = [
  "Analyze screen",
  "Open Chrome",
  "Click address bar",
  "Type URL",
  "Press Enter",
  "Verify result",
];

export function OperateDemo() {
  const reduced = usePrefersReducedMotion();
  const [step, setStep] = useState(0);
  const [url, setUrl] = useState("");
  const activeStep = reduced ? STEPS.length - 1 : step;
  const activeUrl = reduced ? "youtube.com" : url;

  useEffect(() => {
    if (reduced) return;
    const id = window.setInterval(() => {
      setStep((s) => {
        const next = (s + 1) % STEPS.length;
        if (next >= 3 && next <= 4) {
          setUrl("youtube.com".slice(0, Math.min(12, (next - 2) * 6)));
        }
        if (next === 0) setUrl("");
        if (next >= 4) setUrl("youtube.com");
        return next;
      });
    }, 1400);
    return () => window.clearInterval(id);
  }, [reduced]);

  return (
    <section id="product" className="landing-section">
      <div className="landing-container">
        <div className="max-w-2xl">
          <p className="font-mono-ui text-xs uppercase tracking-[0.2em] text-[var(--accent)]">
            It can actually use your computer
          </p>
          <h2 className="mt-3 font-display text-3xl tracking-tight text-[var(--fg)] sm:text-4xl md:text-5xl">
            AI that doesn&apos;t just answer. It operates.
          </h2>
          <p className="mt-4 text-base text-[var(--muted)] sm:text-lg">
            Watch a simulated run: requested screenshots, structured clicks and
            typing, then verification — the same loop PetAI uses on a real
            desktop.
          </p>
        </div>

        <div className="mt-10 grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-start">
          <div className="overflow-hidden rounded-2xl border border-[var(--border-strong)] bg-[#071018] shadow-[var(--shadow-soft)]">
            <div className="flex items-center gap-2 border-b border-[var(--border)] bg-[#0d1824] px-4 py-2.5">
              <span className="h-2.5 w-2.5 rounded-full bg-[#ff647c]/80" />
              <span className="h-2.5 w-2.5 rounded-full bg-[#ffd166]/80" />
              <span className="h-2.5 w-2.5 rounded-full bg-[#63f5a4]/80" />
              <span className="ml-3 text-xs text-[var(--muted-dim)]">
                Desktop · Chrome
              </span>
            </div>
            <div className="relative aspect-[16/10] p-4 sm:p-6">
              <div className="rounded-xl border border-[var(--border)] bg-[#0f1a26] p-3">
                <div className="flex items-center gap-2 rounded-lg border border-[var(--border)] bg-[#11171b] px-3 py-2">
                  <span className="text-xs text-[var(--muted-dim)]">🔒</span>
                  <span className="font-mono-ui text-sm text-[var(--soft-blue)]">
                    {activeUrl || "about:blank"}
                    {activeStep === 3 ? (
                      <span className="ml-0.5 inline-block h-3.5 w-px bg-[var(--accent)] animate-[cursor-blink_1s_step-end_infinite]" />
                    ) : null}
                  </span>
                </div>
                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  {["Home", "Subscriptions", "Library"].map((tab, i) => (
                    <div
                      key={tab}
                      className={cn(
                        "h-16 rounded-lg border border-[var(--border)] bg-[#122030]",
                        activeStep >= 5 && i === 0 && "ring-1 ring-[var(--accent)]/40",
                      )}
                    />
                  ))}
                </div>
              </div>
              <div
                className="pointer-events-none absolute h-0 w-0 border-l-[7px] border-b-[12px] border-l-transparent border-b-[var(--accent)] transition-all duration-700"
                style={{
                  left: `${20 + activeStep * 10}%`,
                  top: `${35 + (activeStep % 3) * 8}%`,
                }}
                aria-hidden
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--panel)]/70 p-4">
              <p className="text-xs uppercase tracking-wider text-[var(--muted-dim)]">
                User
              </p>
              <p className="mt-2 text-sm text-[var(--fg)] sm:text-base">
                &ldquo;Open Chrome and go to youtube.com&rdquo;
              </p>
            </div>
            <ol className="space-y-2">
              {STEPS.map((label, i) => (
                <li
                  key={label}
                  className={cn(
                    "flex items-center gap-3 rounded-xl border px-3 py-2.5 text-sm transition",
                    i === activeStep
                      ? "border-[var(--accent)]/40 bg-[var(--accent-soft)] text-[var(--fg)]"
                      : i < activeStep
                        ? "border-[var(--border)] text-[var(--muted)]"
                        : "border-transparent text-[var(--muted-dim)]",
                  )}
                >
                  <span className="font-mono-ui w-5 text-xs text-[var(--accent)]">
                    {i < activeStep ? "✓" : String(i + 1).padStart(2, "0")}
                  </span>
                  {label}
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </section>
  );
}
