"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils/cn";

const META = [
  { label: "macOS", value: "Connected" },
  { label: "Screen capture", value: "On request" },
  { label: "AI status", value: "Ready" },
  { label: "WebSocket", value: "Connected" },
];

export function HeroFallback({
  demoActive,
  statusLine,
}: {
  demoActive?: boolean;
  statusLine?: string;
}) {
  const [cursor, setCursor] = useState({ x: 28, y: 42 });

  useEffect(() => {
    if (!demoActive) return;
    const frames = [
      { x: 28, y: 42 },
      { x: 48, y: 38 },
      { x: 55, y: 55 },
      { x: 62, y: 48 },
      { x: 40, y: 35 },
    ];
    let i = 0;
    const id = window.setInterval(() => {
      i = (i + 1) % frames.length;
      setCursor(frames[i]);
    }, 700);
    return () => window.clearInterval(id);
  }, [demoActive]);

  return (
    <div className="relative mx-auto aspect-[16/11] w-full max-w-3xl">
      <div className="absolute inset-0 rounded-[1.5rem] border border-[var(--border-strong)] bg-gradient-to-br from-[#1c272d] via-[#11171b] to-[#11171b] p-3 shadow-[var(--shadow-glow)] sm:p-4">
        <div className="relative h-full overflow-hidden rounded-xl border border-[var(--border)] bg-[#071018]">
          <div className="flex items-center justify-between border-b border-[var(--border)] bg-[#0d1824] px-3 py-2">
            <span className="text-xs font-medium text-[var(--fg)]">
              PetAI Agent
            </span>
            <span className="flex items-center gap-1.5 text-[10px] text-[var(--success)]">
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--success)] animate-status-breathe" />
              Online
            </span>
          </div>

          <div className="relative h-[calc(100%-2.25rem)] p-3 sm:p-4">
            <div className="absolute left-3 top-3 rounded-lg border border-[var(--border)] bg-[#122030] px-3 py-2 text-xs text-[var(--muted)] sm:left-4 sm:top-4">
              Chrome · youtube.com
            </div>
            <div className="absolute bottom-4 left-4 right-4 rounded-lg border border-[var(--border)] bg-[#0d1824]/90 px-3 py-2 font-mono-ui text-[10px] text-[var(--accent)] sm:text-xs">
              {statusLine || "Agent ready — click the workstation to run a demo"}
            </div>
            <div
              className={cn(
                "absolute h-3 w-3 -translate-x-1/2 -translate-y-1/2 rotate-[-20deg]",
                "border-l-[6px] border-b-[10px] border-l-transparent border-b-[var(--accent)]",
                demoActive && "transition-all duration-500",
              )}
              style={{ left: `${cursor.x}%`, top: `${cursor.y}%` }}
              aria-hidden
            />
            <div className="atmosphere-grid pointer-events-none absolute inset-0 opacity-60" />
          </div>
        </div>
      </div>

      <div className="pointer-events-none absolute -left-2 top-6 hidden flex-col gap-2 sm:flex lg:-left-6">
        {META.slice(0, 2).map((item) => (
          <div
            key={item.label}
            className="rounded-lg border border-[var(--border)] bg-[var(--panel)]/80 px-2.5 py-1.5 backdrop-blur"
          >
            <p className="font-mono-ui text-[9px] uppercase tracking-wider text-[var(--muted-dim)]">
              {item.label}
            </p>
            <p className="text-[11px] text-[var(--soft-blue)]">{item.value}</p>
          </div>
        ))}
      </div>
      <div className="pointer-events-none absolute -right-2 bottom-10 hidden flex-col gap-2 sm:flex lg:-right-6">
        {META.slice(2).map((item) => (
          <div
            key={item.label}
            className="rounded-lg border border-[var(--border)] bg-[var(--panel)]/80 px-2.5 py-1.5 backdrop-blur"
          >
            <p className="font-mono-ui text-[9px] uppercase tracking-wider text-[var(--muted-dim)]">
              {item.label}
            </p>
            <p className="text-[11px] text-[var(--soft-blue)]">{item.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
