"use client";

const STEPS = [
  {
    n: "01",
    title: "Install the Agent",
    body: "Lightweight Electron tray app for macOS, Windows, and Linux with native OS permission prompts.",
    visual: ["macOS", "Windows", "Linux"],
  },
  {
    n: "02",
    title: "Link Your Device",
    body: "Create a device in the dashboard, copy the one-time token, and paste it into the agent settings (stored in the OS keychain).",
    visual: ["device token", "••••••••", "linked"],
  },
  {
    n: "03",
    title: "Tell It What To Do",
    body: "Chat or speak from your phone. PetAI plans, acts, verifies, and asks when something needs approval.",
    visual: ["phone", "→", "desktop"],
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="landing-section">
      <div className="landing-container">
        <div className="max-w-2xl">
          <h2 className="font-display text-3xl tracking-tight sm:text-4xl md:text-5xl">
            How it works
          </h2>
          <p className="mt-4 text-base text-[var(--muted)] sm:text-lg">
            Install. Link. Prompt.
          </p>
        </div>

        <div className="mt-12 space-y-8">
          {STEPS.map((step) => (
            <div
              key={step.n}
              className="grid gap-6 border-t border-[var(--border)] pt-8 lg:grid-cols-[0.35fr_1fr_0.7fr]"
            >
              <p className="font-mono-ui text-sm text-[var(--accent)]">{step.n}</p>
              <div>
                <h3 className="text-xl font-semibold text-[var(--fg)] sm:text-2xl">
                  {step.title}
                </h3>
                <p className="mt-3 max-w-xl text-sm leading-relaxed text-[var(--muted)] sm:text-base">
                  {step.body}
                </p>
              </div>
              <div className="flex items-center gap-2 rounded-2xl border border-[var(--border)] bg-[var(--panel)]/60 px-4 py-5">
                {step.visual.map((chip) => (
                  <span
                    key={chip}
                    className="rounded-lg border border-[var(--border)] bg-[var(--bg)]/70 px-2.5 py-1.5 font-mono-ui text-[11px] text-[var(--soft-blue)]"
                  >
                    {chip}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
