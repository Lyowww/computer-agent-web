"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils/cn";

const links = [
  { href: "#product", label: "Product" },
  { href: "#how-it-works", label: "How it works" },
  { href: "#safety", label: "Safety" },
  { href: "#architecture", label: "Developers" },
];

export function LandingNav({ onWaitlist }: { onWaitlist: () => void }) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-300",
        scrolled
          ? "border-b border-[var(--border)] bg-[var(--bg)]/80 py-2 backdrop-blur-xl"
          : "bg-transparent py-4",
      )}
    >
      <div className="landing-container flex items-center justify-between gap-4 pt-[env(safe-area-inset-top)]">
        <a
          href="#top"
          className="font-display text-xl tracking-tight text-[var(--fg)] sm:text-2xl"
        >
          PETAI
        </a>

        <nav className="hidden items-center gap-7 md:flex" aria-label="Primary">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-sm text-[var(--muted)] transition hover:text-[var(--fg)]"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <Link
            href="/login/"
            className="focus-ring rounded-lg px-3 py-2 text-sm text-[var(--muted)] transition hover:text-[var(--fg)]"
          >
            Developer Login
          </Link>
          <button
            type="button"
            onClick={onWaitlist}
            className="focus-ring rounded-xl bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[var(--soft-blue)]"
          >
            Get Early Access
          </button>
        </div>

        <button
          type="button"
          className="focus-ring flex h-11 w-11 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--panel)]/60 md:hidden"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open ? (
        <div className="border-t border-[var(--border)] bg-[var(--bg)]/95 backdrop-blur-xl md:hidden">
          <nav className="landing-container flex flex-col gap-1 py-4" aria-label="Mobile">
            {links.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="rounded-xl px-3 py-3 text-base text-[var(--fg)]"
              >
                {link.label}
              </a>
            ))}
            <Link
              href="/login/"
              onClick={() => setOpen(false)}
              className="rounded-xl px-3 py-3 text-base text-[var(--muted)]"
            >
              Developer Login
            </Link>
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                onWaitlist();
              }}
              className="mt-2 min-h-[48px] rounded-xl bg-[var(--accent)] px-4 text-base font-semibold text-white"
            >
              Get Early Access
            </button>
          </nav>
        </div>
      ) : null}
    </header>
  );
}
