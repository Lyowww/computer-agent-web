"use client";

import { useState } from "react";
import { cn } from "@/lib/utils/cn";

const NODES = [
  {
    id: "phone",
    title: "Phone / Browser",
    detail: "Chat, voice, screens, devices, approvals",
  },
  {
    id: "web",
    title: "PetAI Web",
    detail: "Dashboard control plane optimized for mobile",
  },
  {
    id: "backend",
    title: "Backend",
    detail: "Auth, tasks, WebSockets, rate limits, device ownership",
  },
  {
    id: "ai",
    title: "AI Vision",
    detail: "Vision, planning, structured actions, verification",
  },
  {
    id: "agent",
    title: "Desktop Agent",
    detail: "Mouse, keyboard, apps, screenshots, OS permissions",
  },
  {
    id: "computer",
    title: "Your Computer",
    detail: "macOS, Windows, or Linux machine",
  },
] as const;

export function ArchitectureScene() {
  const [active, setActive] = useState<(typeof NODES)[number]["id"]>("ai");

  const selected = NODES.find((n) => n.id === active) ?? NODES[0];

  return (
    <section id="architecture" className="landing-section border-y border-[var(--border)]">
      <div className="landing-container">
        <div className="max-w-2xl">
          <p className="font-mono-ui text-xs uppercase tracking-[0.2em] text-[var(--accent)]">
            System architecture
          </p>
          <h2 className="mt-3 font-display text-3xl tracking-tight sm:text-4xl md:text-5xl">
            Phone → Cloud → Desktop
          </h2>
          <p className="mt-4 text-base text-[var(--muted)] sm:text-lg">
            Click a node to inspect how the control plane is wired.
          </p>
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-2">
            {NODES.map((node, i) => (
              <button
                key={node.id}
                type="button"
                onClick={() => setActive(node.id)}
                className={cn(
                  "focus-ring flex w-full items-center gap-4 rounded-2xl border px-4 py-3.5 text-left transition",
                  active === node.id
                    ? "border-[var(--accent)]/40 bg-[var(--accent-soft)]"
                    : "border-[var(--border)] bg-[var(--panel)]/50 hover:border-[var(--border-strong)]",
                )}
              >
                <span className="font-mono-ui text-xs text-[var(--accent)]">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="flex-1 text-sm font-medium sm:text-base">
                  {node.title}
                </span>
                {i < NODES.length - 1 ? (
                  <span className="text-[var(--muted-dim)]">↓</span>
                ) : null}
              </button>
            ))}
          </div>

          <div className="rounded-2xl border border-[var(--border-strong)] bg-[var(--panel)]/80 p-6">
            <p className="font-mono-ui text-xs uppercase tracking-[0.18em] text-[var(--accent)]">
              {selected.title}
            </p>
            <p className="mt-4 text-lg leading-relaxed text-[var(--fg)]">
              {selected.detail}
            </p>
            <div className="mt-8 h-px bg-gradient-to-r from-[var(--accent)]/50 via-[var(--border)] to-transparent" />
            <p className="mt-4 text-sm text-[var(--muted)]">
              Animated paths in production connect these layers over WebSocket
              with authenticated channels for web clients and desktop agents.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
