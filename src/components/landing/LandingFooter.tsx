import Link from "next/link";

export function LandingFooter() {
  return (
    <footer className="border-t border-[var(--border)] pb-[max(2rem,env(safe-area-inset-bottom))] pt-12">
      <div className="landing-container">
        <div className="flex flex-col gap-10 md:flex-row md:justify-between">
          <div>
            <p className="font-display text-2xl tracking-tight">PETAI</p>
            <p className="mt-2 max-w-xs text-sm text-[var(--muted)]">
              Computer control for humans.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
            <div>
              <p className="text-xs uppercase tracking-wider text-[var(--muted-dim)]">
                Product
              </p>
              <ul className="mt-3 space-y-2 text-sm text-[var(--muted)]">
                <li>
                  <a href="#product" className="hover:text-[var(--fg)]">
                    Product
                  </a>
                </li>
                <li>
                  <a href="#how-it-works" className="hover:text-[var(--fg)]">
                    How it works
                  </a>
                </li>
                <li>
                  <a href="#safety" className="hover:text-[var(--fg)]">
                    Safety
                  </a>
                </li>
                <li>
                  <a href="#architecture" className="hover:text-[var(--fg)]">
                    Developers
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider text-[var(--muted-dim)]">
                Access
              </p>
              <ul className="mt-3 space-y-2 text-sm text-[var(--muted)]">
                <li>
                  <Link href="/login/" className="hover:text-[var(--fg)]">
                    Login
                  </Link>
                </li>
                <li>
                  <a href="#top" className="hover:text-[var(--fg)]">
                    Early Access
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider text-[var(--muted-dim)]">
                Platforms
              </p>
              <p className="mt-3 text-sm text-[var(--muted)]">
                macOS · Windows · Linux
              </p>
            </div>
          </div>
        </div>
        <p className="mt-12 border-t border-[var(--border)] pt-6 text-sm text-[var(--muted-dim)]">
          © 2026 PETAI
        </p>
      </div>
    </footer>
  );
}
