"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Bot,
  Camera,
  ChevronRight,
  MonitorSmartphone,
  ShieldCheck,
  Cpu,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { WaitlistModal } from "@/components/landing/WaitlistModal";

const features = [
  {
    icon: Bot,
    title: "Autonomous Execution",
    body: "AI-driven mouse, keyboard, and app orchestration that completes multi-step desktop workflows without babysitting every click.",
  },
  {
    icon: Camera,
    title: "Real-time Stream & Vision",
    body: "Screen and front-camera snapshots sync over WebSocket so the agent sees what you see — with near-zero latency feedback.",
  },
  {
    icon: ShieldCheck,
    title: "Human-in-the-Loop",
    body: "Security-critical moves pause in WAITING_FOR_USER. Approve or reject from the dashboard before anything irreversible runs.",
  },
  {
    icon: Cpu,
    title: "System Controls",
    body: "Inspect processes, lock or unlock the machine, launch apps, and pull system state from web or mobile in one control plane.",
  },
];

const steps = [
  {
    n: "01",
    title: "Install PetAI Agent",
    body: "Drop the lightweight agent on macOS, Windows, or Linux and keep it running in the background.",
  },
  {
    n: "02",
    title: "Link your device token",
    body: "Paste the secure device key into the agent Settings to bind it to your dashboard account.",
  },
  {
    n: "03",
    title: "Prompt or quick-act",
    body: "Chat with the AI, fire notifications, or trigger screen, camera, and lock actions from any browser.",
  },
];

export default function LandingPage() {
  const [waitlistOpen, setWaitlistOpen] = useState(false);

  return (
    <div className="relative min-h-[100dvh] overflow-x-hidden bg-[var(--bg)] text-[var(--fg)]">
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(6,182,212,0.22),transparent_55%),radial-gradient(circle_at_90%_20%,rgba(8,145,178,0.12),transparent_40%),linear-gradient(180deg,#090d16_0%,#0c1220_45%,#090d16_100%)]" />
        <div
          className="absolute inset-0 opacity-[0.4]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(30,41,59,0.55) 1px, transparent 1px), linear-gradient(90deg, rgba(30,41,59,0.55) 1px, transparent 1px)",
            backgroundSize: "64px 64px",
            maskImage: "radial-gradient(ellipse at center, black 20%, transparent 75%)",
          }}
        />
        <div className="absolute -left-32 top-24 h-72 w-72 rounded-full bg-[radial-gradient(circle,rgba(6,182,212,0.18),transparent_70%)] blur-2xl" />
        <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-[radial-gradient(circle,rgba(14,116,144,0.16),transparent_70%)] blur-3xl" />
      </div>

      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-5 pt-[max(1.25rem,env(safe-area-inset-top))] sm:px-6">
        <div className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-cyan-500/30 bg-cyan-500/10 text-cyan-300">
            <MonitorSmartphone className="h-4 w-4" />
          </span>
          <span className="font-[family-name:var(--font-display)] text-xl tracking-tight text-white">
            PetAI
          </span>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="border-white/15 bg-white/5 text-white hover:bg-white/10"
          onClick={() => setWaitlistOpen(true)}
        >
          Join Waitlist
        </Button>
      </header>

      <main>
        {/* Hero — brand first, full-bleed atmosphere */}
        <section className="relative mx-auto flex min-h-[calc(100dvh-5rem)] max-w-6xl flex-col justify-center px-4 pb-16 pt-6 sm:px-6 sm:pb-24">
          <p className="font-[family-name:var(--font-display)] text-5xl leading-[0.95] tracking-tight text-white sm:text-6xl md:text-7xl lg:text-8xl">
            PetAI
          </p>
          <h1 className="mt-5 max-w-3xl text-xl font-semibold leading-snug text-slate-100 sm:mt-6 sm:text-2xl md:text-3xl">
            Control Any Desktop Computer with Autonomous AI Agents
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-slate-400 sm:text-base md:text-lg">
            Real-time screen capture, remote process control, voice commands, and
            human-in-the-loop AI safety approvals — from your phone or browser.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Button
              size="lg"
              className="w-full sm:w-auto"
              onClick={() => setWaitlistOpen(true)}
            >
              <Sparkles className="h-4 w-4" />
              Get Early Access
            </Button>
            <Link href="/login/" className="w-full sm:w-auto">
              <Button
                size="lg"
                variant="outline"
                className="w-full border-white/15 bg-white/5 text-white hover:bg-white/10 sm:w-auto"
              >
                Developer Login
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
          <div
            className="pointer-events-none mt-12 h-40 w-full overflow-hidden rounded-2xl border border-cyan-500/20 bg-[linear-gradient(135deg,rgba(6,182,212,0.12),rgba(15,23,42,0.4))] sm:mt-16 sm:h-56 md:h-72"
            aria-hidden
          >
            <div className="flex h-full items-end gap-1 p-4 opacity-80 sm:p-6">
              {Array.from({ length: 28 }).map((_, i) => (
                <div
                  key={i}
                  className="flex-1 rounded-t-sm bg-gradient-to-t from-cyan-500/80 to-cyan-300/30"
                  style={{
                    height: `${28 + ((i * 37) % 70)}%`,
                    animationDelay: `${i * 40}ms`,
                  }}
                />
              ))}
            </div>
          </div>
        </section>

        <section className="border-t border-white/5 bg-[#0c1220]/80 py-16 sm:py-20">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <h2 className="font-[family-name:var(--font-display)] text-3xl tracking-tight text-white sm:text-4xl">
              Built for precision remote control
            </h2>
            <p className="mt-3 max-w-2xl text-sm text-slate-400 sm:text-base">
              Everything you need to operate a desktop agent safely — vision,
              execution, approvals, and system tooling in one surface.
            </p>
            <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {features.map((feature) => {
                const Icon = feature.icon;
                return (
                  <div key={feature.title} className="space-y-3">
                    <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-cyan-500/25 bg-cyan-500/10 text-cyan-300">
                      <Icon className="h-5 w-5" />
                    </span>
                    <h3 className="text-base font-semibold text-white">
                      {feature.title}
                    </h3>
                    <p className="text-sm leading-relaxed text-slate-400">
                      {feature.body}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section className="py-16 sm:py-20">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <h2 className="font-[family-name:var(--font-display)] text-3xl tracking-tight text-white sm:text-4xl">
              How it works
            </h2>
            <p className="mt-3 max-w-xl text-sm text-slate-400 sm:text-base">
              Three steps from bare metal to remote AI control.
            </p>
            <ol className="mt-10 space-y-0">
              {steps.map((step, index) => (
                <li
                  key={step.n}
                  className="relative flex gap-5 border-l border-cyan-500/25 py-6 pl-8 last:pb-0 sm:gap-8 sm:pl-10"
                >
                  <span className="absolute -left-[9px] top-7 h-[17px] w-[17px] rounded-full border-2 border-cyan-400 bg-[#090d16] shadow-[0_0_12px_rgba(6,182,212,0.55)]" />
                  <span className="font-[family-name:var(--font-mono)] text-sm text-cyan-400/80">
                    {step.n}
                  </span>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-lg font-semibold text-white">
                      {step.title}
                    </h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-slate-400">
                      {step.body}
                    </p>
                    {index < steps.length - 1 ? (
                      <ChevronRight className="mt-3 h-4 w-4 text-slate-600" />
                    ) : null}
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="border-t border-white/5 py-16 sm:py-20">
          <div className="mx-auto max-w-6xl px-4 text-center sm:px-6">
            <h2 className="font-[family-name:var(--font-display)] text-3xl tracking-tight text-white sm:text-4xl">
              Early access is opening soon
            </h2>
            <p className="mx-auto mt-3 max-w-lg text-sm text-slate-400 sm:text-base">
              Join the waitlist for PetAI Computer Agent. Existing operators can
              sign in below.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button size="lg" onClick={() => setWaitlistOpen(true)}>
                Join Waitlist
              </Button>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-white/5 py-8 pb-[max(2rem,env(safe-area-inset-bottom))]">
        <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-4 px-4 text-sm text-slate-500 sm:flex-row sm:items-center sm:px-6">
          <p>© {new Date().getFullYear()} PetAI Computer Agent</p>
          <Link
            href="/login/"
            className="text-slate-600 transition hover:text-cyan-400"
          >
            Developer Sign In
          </Link>
        </div>
      </footer>

      <WaitlistModal open={waitlistOpen} onClose={() => setWaitlistOpen(false)} />
    </div>
  );
}
