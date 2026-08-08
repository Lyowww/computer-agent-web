export function PlatformSection() {
  return (
    <section className="landing-section">
      <div className="landing-container text-center">
        <p className="font-mono-ui text-xs uppercase tracking-[0.22em] text-[var(--accent)]">
          One agent · three platforms
        </p>
        <h2 className="mt-4 font-display text-3xl tracking-tight sm:text-4xl md:text-5xl">
          Built for the machines you already own
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-base text-[var(--muted)]">
          Built as a lightweight desktop agent with native OS permissions.
        </p>

        <div className="mx-auto mt-12 grid max-w-3xl gap-4 sm:grid-cols-3">
          {[
            { symbol: "", name: "macOS" },
            { symbol: "⊞", name: "Windows" },
            { symbol: "⌘", name: "Linux" },
          ].map((os) => (
            <div
              key={os.name}
              className="rounded-2xl border border-[var(--border)] bg-[var(--panel)]/60 px-6 py-10"
            >
              <p className="text-3xl text-[var(--soft-blue)]">{os.symbol}</p>
              <p className="mt-3 text-lg font-medium text-[var(--fg)]">{os.name}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
