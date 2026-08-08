"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils/cn";

const FLOW = [
  { id: "PROMPT", sample: '"Open Notion and Slack"' },
  { id: "VISION", sample: "Screenshot 1920×1080" },
  { id: "PLAN", sample: "OPEN_APP · CLICK · TYPE" },
  { id: "ACTION", sample: "HOTKEY · WAIT" },
  { id: "SCREENSHOT", sample: "Capture on request" },
  { id: "VERIFY", sample: "Confirm outcome" },
];

const ACTIONS = [
  { type: "OPEN_APP", payload: "Chrome" },
  { type: "CLICK", payload: "{ x: 412, y: 88 }" },
  { type: "TYPE_TEXT", payload: "youtube.com" },
  { type: "HOTKEY", payload: "meta+l" },
  { type: "WAIT", payload: "800ms" },
  { type: "SCREENSHOT", payload: "quality: 80" },
];

export function ExecutionDemo() {
  const ref = useRef<HTMLElement>(null);
  const [active, setActive] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const onScroll = () => {
      const rect = el.getBoundingClientRect();
      const view = window.innerHeight;
      const progress = Math.min(
        1,
        Math.max(0, (view * 0.55 - rect.top) / (rect.height * 0.7)),
      );
      setActive(Math.min(FLOW.length - 1, Math.floor(progress * FLOW.length)));
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <section ref={ref} className="landing-section border-y border-[var(--border)] bg-[var(--bg-elevated)]/60">
      <div className="landing-container">
        <div className="max-w-2xl">
          <h2 className="font-display text-3xl tracking-tight sm:text-4xl md:text-5xl">
            Give it the outcome. Let it handle the clicks.
          </h2>
          <p className="mt-4 text-base text-[var(--muted)] sm:text-lg">
            Structured desktop actions — not shell scripts. The agent plans,
            executes, screenshots on request, and verifies.
          </p>
        </div>

        <div className="mt-12 flex flex-col gap-3 lg:flex-row lg:items-stretch lg:gap-2">
          {FLOW.map((node, i) => (
            <div key={node.id} className="flex flex-1 items-stretch gap-2">
              <div
                className={cn(
                  "flex-1 rounded-2xl border p-4 transition duration-500",
                  i <= active
                    ? "border-[var(--accent)]/35 bg-[var(--accent-soft)]"
                    : "border-[var(--border)] bg-[var(--panel)]/40",
                )}
              >
                <p className="font-mono-ui text-xs tracking-wider text-[var(--accent)]">
                  {node.id}
                </p>
                <p className="mt-2 text-sm text-[var(--muted)]">{node.sample}</p>
              </div>
              {i < FLOW.length - 1 ? (
                <div className="hidden items-center text-[var(--muted-dim)] lg:flex">
                  →
                </div>
              ) : null}
            </div>
          ))}
        </div>

        <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {ACTIONS.map((action, i) => (
            <div
              key={action.type}
              className={cn(
                "rounded-xl border border-[var(--border)] bg-[var(--panel)]/70 p-4 font-mono-ui text-sm transition",
                i <= active && "border-[var(--accent)]/25",
              )}
            >
              <p className="text-[var(--accent)]">{action.type}</p>
              <p className="mt-1 text-[var(--muted)]">{action.payload}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
