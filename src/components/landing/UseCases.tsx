"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils/cn";

const CASES = [
  {
    title: "Away from your desk",
    prompt: "Download the invoice from my email and save it to Desktop.",
    screen: "Mail → Invoice.pdf → Desktop",
  },
  {
    title: "Before a meeting",
    prompt: "Open Notion, Chrome with the deck, and Slack.",
    screen: "Notion · Chrome · Slack",
  },
  {
    title: "Quick lock",
    prompt: "Lock my computer.",
    screen: "Screen locked",
  },
  {
    title: "Voice",
    prompt: "Open the project and prepare everything for the meeting.",
    screen: "Voice → STT → task",
  },
  {
    title: "Remote status",
    prompt: "Show me what's currently on my computer.",
    screen: "Requested screenshot",
  },
];

export function UseCases() {
  const ref = useRef<HTMLElement>(null);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const onScroll = () => {
      const rect = el.getBoundingClientRect();
      const progress = Math.min(
        1,
        Math.max(0, (window.innerHeight * 0.45 - rect.top) / (rect.height * 0.75)),
      );
      setIndex(Math.min(CASES.length - 1, Math.floor(progress * CASES.length)));
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const active = CASES[index];

  return (
    <section ref={ref} className="landing-section bg-[var(--bg-elevated)]/40">
      <div className="landing-container">
        <div className="max-w-2xl">
          <h2 className="font-display text-3xl tracking-tight sm:text-4xl md:text-5xl">
            Real work. Real desktop.
          </h2>
          <p className="mt-4 text-base text-[var(--muted)] sm:text-lg">
            Scroll through scenarios — the simulated desktop follows along.
          </p>
        </div>

        <div className="mt-10 grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
          <div className="space-y-2 lg:sticky lg:top-28">
            {CASES.map((item, i) => (
              <button
                key={item.title}
                type="button"
                onClick={() => setIndex(i)}
                className={cn(
                  "focus-ring w-full rounded-2xl border px-4 py-4 text-left transition",
                  i === index
                    ? "border-[var(--accent)]/35 bg-[var(--accent-soft)]"
                    : "border-transparent hover:border-[var(--border)]",
                )}
              >
                <p className="text-sm font-medium text-[var(--fg)]">{item.title}</p>
                <p className="mt-1 text-sm text-[var(--muted)]">&ldquo;{item.prompt}&rdquo;</p>
              </button>
            ))}
          </div>

          <div className="overflow-hidden rounded-2xl border border-[var(--border-strong)] bg-[#071018]">
            <div className="border-b border-[var(--border)] px-4 py-3">
              <p className="font-mono-ui text-xs text-[var(--accent)]">SIMULATED DESKTOP</p>
              <p className="mt-1 text-sm text-[var(--muted)]">{active.title}</p>
            </div>
            <div className="flex aspect-[16/11] flex-col justify-between p-5 sm:p-8">
              <div className="rounded-xl border border-[var(--border)] bg-[#0d1824] p-4">
                <p className="text-xs text-[var(--muted-dim)]">Prompt</p>
                <p className="mt-2 text-sm text-[var(--fg)] sm:text-base">
                  {active.prompt}
                </p>
              </div>
              <div className="rounded-xl border border-[var(--accent)]/25 bg-[var(--accent-soft)] p-4">
                <p className="font-mono-ui text-xs text-[var(--accent)]">Desktop response</p>
                <p className="mt-2 text-lg text-[var(--fg)]">{active.screen}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
