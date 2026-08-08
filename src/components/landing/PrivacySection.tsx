const ITEMS = [
  {
    label: "Screenshots",
    value: "Requested, not continuous",
  },
  {
    label: "Tokens",
    value: "Separated by device",
  },
  {
    label: "Screen data",
    value: "Ephemeral by default",
  },
  {
    label: "OS access",
    value: "Permission controlled",
  },
];

export function PrivacySection() {
  return (
    <section className="landing-section border-y border-[var(--border)] bg-[#05080c]">
      <div className="landing-container">
        <div className="max-w-2xl">
          <h2 className="font-display text-3xl tracking-tight sm:text-4xl">
            Privacy that matches the architecture
          </h2>
          <p className="mt-4 text-base text-[var(--muted)]">
            Honest controls — no continuous streaming claims, no unrestricted
            shell access.
          </p>
        </div>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {ITEMS.map((item) => (
            <div key={item.label} className="border-t border-[var(--border-strong)] pt-4">
              <p className="font-mono-ui text-[11px] uppercase tracking-[0.18em] text-[var(--muted-dim)]">
                {item.label}
              </p>
              <p className="mt-2 text-base text-[var(--fg)]">{item.value}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
