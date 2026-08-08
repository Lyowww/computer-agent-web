"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils/cn";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

const DETECTIONS = [
  { label: "Chrome", x: 8, y: 12, w: 40, h: 18 },
  { label: "Address Bar", x: 18, y: 28, w: 58, h: 10 },
  { label: "YouTube tab", x: 12, y: 48, w: 28, h: 14 },
  { label: "Search field", x: 35, y: 62, w: 42, h: 12 },
];

export function VisionDemo() {
  const reduced = usePrefersReducedMotion();
  const [tick, setTick] = useState(0);
  const visible = reduced ? DETECTIONS.length : tick;

  useEffect(() => {
    if (reduced) return;
    const id = window.setInterval(() => {
      setTick((v) => (v >= DETECTIONS.length ? 0 : v + 1));
    }, 1100);
    return () => window.clearInterval(id);
  }, [reduced]);

  return (
    <section className="landing-section">
      <div className="landing-container">
        <div className="max-w-2xl">
          <h2 className="font-display text-3xl tracking-tight sm:text-4xl md:text-5xl">
            It sees what your computer sees.
          </h2>
          <p className="mt-4 text-base text-[var(--muted)] sm:text-lg">
            Screenshots are requested when needed — not a continuous stream —
            then the vision planner locates UI elements before acting.
          </p>
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-2">
          <div className="overflow-hidden rounded-2xl border border-[var(--border-strong)] bg-[#071018]">
            <div className="border-b border-[var(--border)] px-4 py-2 font-mono-ui text-xs text-[var(--muted)]">
              SCREENSHOT · 1920 × 1080
            </div>
            <div className="relative aspect-[16/10] bg-[radial-gradient(ellipse_at_30%_20%,rgba(77,232,255,0.08),transparent_50%),#0a121c]">
              <div className="absolute left-6 top-6 h-10 w-40 rounded-md border border-[var(--border)] bg-[#122030]" />
              <div className="absolute left-[18%] top-[28%] h-8 w-[58%] rounded-md border border-[var(--border)] bg-[#0d1824]" />
              <div className="absolute left-[12%] top-[48%] h-14 w-[28%] rounded-md border border-[var(--border)] bg-[#152536]" />
              <div className="absolute left-[35%] top-[62%] h-10 w-[42%] rounded-md border border-[var(--border)] bg-[#122030]" />
              <div className="pointer-events-none absolute inset-0 overflow-hidden opacity-40">
                <div className="h-8 w-full bg-gradient-to-b from-[var(--accent)]/20 to-transparent animate-[scan-line_3.5s_linear_infinite]" />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-[var(--border-strong)] bg-[var(--panel)]/70 p-5">
            <p className="font-mono-ui text-xs uppercase tracking-[0.18em] text-[var(--accent)]">
              AI perception layer
            </p>
            <ul className="mt-4 space-y-2">
              {DETECTIONS.map((d, i) => (
                <li
                  key={d.label}
                  className={cn(
                    "flex items-center justify-between rounded-xl border px-3 py-2.5 text-sm transition",
                    i < visible
                      ? "border-[var(--accent)]/30 bg-[var(--accent-soft)] text-[var(--fg)]"
                      : "border-[var(--border)] text-[var(--muted-dim)]",
                  )}
                >
                  <span>Detected: {d.label}</span>
                  <span className="font-mono-ui text-xs text-[var(--muted)]">
                    {i < visible ? "ok" : "…"}
                  </span>
                </li>
              ))}
            </ul>

            <div className="relative mt-6 aspect-[16/10] overflow-hidden rounded-xl border border-[var(--border)] bg-[#071018]">
              {DETECTIONS.map((d, i) =>
                i < visible ? (
                  <div
                    key={d.label}
                    className="absolute rounded border border-[var(--accent)]/70 bg-[var(--accent)]/5"
                    style={{
                      left: `${d.x}%`,
                      top: `${d.y}%`,
                      width: `${d.w}%`,
                      height: `${d.h}%`,
                    }}
                  >
                    <span className="absolute -top-5 left-0 font-mono-ui text-[10px] text-[var(--accent)]">
                      {d.label}
                    </span>
                  </div>
                ) : null,
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
