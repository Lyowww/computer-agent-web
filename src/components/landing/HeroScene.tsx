"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef, useState } from "react";
import type { AgentPhase } from "@/components/three/AIAgentCore";
import { AIActivity } from "@/components/landing/AIActivity";
import { HeroFallback } from "@/components/landing/HeroFallback";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { useWebGLSupport } from "@/hooks/useWebGLSupport";
import { cn } from "@/lib/utils/cn";

const PetAIWorld = dynamic(
  () => import("@/components/three/PetAIWorld").then((m) => m.PetAIWorld),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full min-h-[280px] items-center justify-center rounded-2xl bg-[#11171b]">
        <div className="text-center">
          <p className="font-display text-lg tracking-tight text-[var(--fg)]">
            PETAI
          </p>
          <p className="mt-2 font-mono-ui text-xs text-[var(--muted)]">
            Initializing visual system…
          </p>
          <span className="mx-auto mt-3 block h-1.5 w-1.5 rounded-full bg-[var(--accent)] animate-connect-pulse" />
        </div>
      </div>
    ),
  },
);

const DEMO_SCRIPT: { phase: AgentPhase; line: string; progress: number }[] = [
  { phase: "THINKING", line: "Planning safe desktop actions…", progress: 0.12 },
  { phase: "SCREENSHOT", line: "Requesting screenshot…", progress: 0.28 },
  { phase: "EXECUTING", line: "Opening Chrome…", progress: 0.42 },
  { phase: "EXECUTING", line: "Clicking address bar…", progress: 0.58 },
  { phase: "EXECUTING", line: "Typing youtube.com…", progress: 0.72 },
  { phase: "VERIFYING", line: "Verifying from a new screenshot…", progress: 0.88 },
  { phase: "COMPLETED", line: "Task complete", progress: 1 },
];

export function HeroScene({ onWaitlist }: { onWaitlist: () => void }) {
  const reducedMotion = usePrefersReducedMotion();
  const webgl = useWebGLSupport();
  const [phase, setPhase] = useState<AgentPhase>("READY");
  const [statusLine, setStatusLine] = useState<string | undefined>();
  const [demoProgress, setDemoProgress] = useState(0);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [running, setRunning] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  const timerRef = useRef<number[]>([]);
  const runningRef = useRef(false);

  const clearTimers = useCallback(() => {
    timerRef.current.forEach((id) => window.clearTimeout(id));
    timerRef.current = [];
  }, []);

  const runDemo = useCallback(() => {
    if (runningRef.current) return;
    runningRef.current = true;
    clearTimers();
    setRunning(true);
    setPhase("READY");
    setDemoProgress(0);

    DEMO_SCRIPT.forEach((step, index) => {
      const id = window.setTimeout(
        () => {
          setPhase(step.phase);
          setStatusLine(step.line);
          setDemoProgress(step.progress);
          if (index === DEMO_SCRIPT.length - 1) {
            const reset = window.setTimeout(() => {
              setPhase("READY");
              setStatusLine(undefined);
              setDemoProgress(0);
              runningRef.current = false;
              setRunning(false);
            }, 1600);
            timerRef.current.push(reset);
          }
        },
        reducedMotion ? 120 + index * 160 : 700 + index * 850,
      );
      timerRef.current.push(id);
    });
  }, [clearTimers, reducedMotion]);

  useEffect(() => () => clearTimers(), [clearTimers]);

  useEffect(() => {
    const onScroll = () => {
      const el = sectionRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      // Map hero exit into a smooth 0→1 reveal curve for 3D props.
      const start = window.innerHeight * 0.15;
      const end = rect.height * 0.85;
      const raw = (start - rect.top) / Math.max(1, end);
      setScrollProgress(Math.min(1, Math.max(0, raw)));
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  useEffect(() => {
    if (reducedMotion || !webgl) return;
    const id = window.setTimeout(() => runDemo(), 1800);
    return () => window.clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reducedMotion, webgl]);

  const use3d = webgl && !reducedMotion;

  return (
    <section
      ref={sectionRef}
      className="relative min-h-[100dvh] overflow-x-clip pt-[max(5.5rem,env(safe-area-inset-top)+4rem)]"
    >
      <div className="landing-container relative z-10 grid items-center gap-8 pb-16 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.1fr)] lg:gap-8 lg:pb-20">
        <div className="max-w-xl">
          <p className="font-display text-[clamp(3.5rem,12vw,7.5rem)] leading-[0.9] tracking-tight text-[var(--fg)]">
            PETAI
          </p>
          <h1 className="mt-5 text-balance font-display text-[clamp(1.75rem,4.5vw,3.25rem)] leading-[1.05] tracking-tight text-[var(--fg)]">
            Control Any Device
            <br />
            Computer with AI
          </h1>
          <p className="mt-4 max-w-md text-base leading-relaxed text-[var(--muted)] sm:text-lg">
            Your computer. Your phone. An agent that can see, act, verify, and
            ask when it matters.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
            <button
              type="button"
              onClick={onWaitlist}
              className="focus-ring inline-flex min-h-[48px] items-center justify-center rounded-xl bg-[var(--accent)] px-5 text-base font-semibold text-white transition hover:bg-[var(--soft-blue)]"
            >
              Get Early Access
            </button>
            <a
              href="/login/"
              className="focus-ring inline-flex min-h-[48px] items-center justify-center rounded-xl border border-[var(--border-strong)] bg-[var(--panel)]/50 px-5 text-base font-medium text-[var(--fg)] transition hover:border-[var(--accent)]/40"
            >
              Developer Login
            </a>
          </div>
          <p className="mt-6 text-xs text-[var(--muted-dim)] sm:text-sm">
            Near-real-time vision · structured actions · human approval
          </p>
        </div>

        <div className="relative">
          <div
            className={cn(
              "relative overflow-hidden rounded-2xl border border-[var(--border)] bg-[#11171b]",
              "min-h-[320px] sm:min-h-[400px] lg:min-h-[520px]",
              !use3d && "hidden",
            )}
          >
            {use3d ? (
              <PetAIWorld
                className="absolute inset-0"
                phase={phase}
                demoProgress={demoProgress}
                scrollProgress={scrollProgress}
                reducedMotion={reducedMotion}
                onDemoRequest={runDemo}
              />
            ) : null}
          </div>

          {!use3d ? (
            <HeroFallback demoActive={running} statusLine={statusLine} />
          ) : null}

          <div className="pointer-events-none absolute inset-x-3 bottom-3 flex justify-center lg:inset-x-auto lg:bottom-5 lg:right-4 lg:justify-end">
            <div className="pointer-events-auto w-full max-w-sm lg:w-72">
              <AIActivity
                phase={phase}
                statusLine={statusLine}
                className="origin-bottom shadow-2xl"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-6 left-1/2 z-10 hidden -translate-x-1/2 flex-col items-center gap-2 text-[var(--muted-dim)] md:flex">
        <span className="font-mono-ui text-[10px] uppercase tracking-[0.2em]">
          Scroll
        </span>
        <span className="h-8 w-px bg-gradient-to-b from-[var(--accent)] to-transparent" />
      </div>
    </section>
  );
}
