"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  MonitorSmartphone,
  MessageSquare,
  Settings,
  LogOut,
  Radio,
  AppWindow,
  Cpu,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { useAuthStore } from "@/stores/authStore";
import { useChatStore } from "@/stores/chatStore";
import { AuthGuard } from "@/components/layout/AuthGuard";

const nav = [
  { href: "/dashboard", label: "Home", short: "Home", icon: LayoutDashboard },
  { href: "/devices", label: "Devices", short: "Devices", icon: MonitorSmartphone },
  { href: "/chat", label: "Chat", short: "Chat", icon: MessageSquare },
  { href: "/apps", label: "Apps", short: "Apps", icon: AppWindow },
  { href: "/processes", label: "Processes", short: "Procs", icon: Cpu },
  { href: "/settings", label: "Settings", short: "More", icon: Settings },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const clearSession = useAuthStore((s) => s.clearSession);
  const wsConnected = useChatStore((s) => s.wsConnected);
  const isChat = pathname.startsWith("/chat");

  function logout() {
    clearSession();
    router.replace("/login");
  }

  return (
    <AuthGuard>
      <div className="min-h-[100dvh] overflow-x-hidden bg-[var(--bg)] text-[var(--fg)]">
        <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
          <div className="absolute -left-24 top-0 h-80 w-80 rounded-full bg-[radial-gradient(circle,rgba(14,116,144,0.22),transparent_70%)] blur-2xl" />
          <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-[radial-gradient(circle,rgba(15,23,42,0.55),transparent_70%)] blur-2xl" />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(248,250,252,0.92),rgba(226,232,240,0.88))]" />
          <div
            className="absolute inset-0 opacity-[0.35]"
            style={{
              backgroundImage:
                "radial-gradient(rgba(15,23,42,0.06) 1px, transparent 1px)",
              backgroundSize: "22px 22px",
            }}
          />
        </div>

        <div className="relative mx-auto flex min-h-[100dvh] max-w-7xl flex-col md:flex-row">
          <aside className="hidden w-64 shrink-0 border-r border-[var(--border)] bg-[var(--panel)]/80 backdrop-blur-md md:flex md:flex-col">
            <div className="border-b border-[var(--border)] px-5 py-6">
              <p className="font-[family-name:var(--font-display)] text-2xl tracking-tight text-[var(--fg)]">
                PetAI
              </p>
              <p className="mt-1 text-sm text-[var(--muted)]">Computer Agent</p>
            </div>
            <nav className="flex flex-1 flex-col gap-1 p-3">
              {nav.map((item) => {
                const Icon = item.icon;
                const active = pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition",
                      active
                        ? "bg-[var(--accent-soft)] text-[var(--accent)]"
                        : "text-[var(--muted)] hover:bg-white/60 hover:text-[var(--fg)]",
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label === "Home" ? "Dashboard" : item.label}
                  </Link>
                );
              })}
            </nav>
            <div className="border-t border-[var(--border)] p-4">
              <div className="mb-3 flex items-center gap-2 text-xs text-[var(--muted)]">
                <Radio
                  className={cn(
                    "h-3.5 w-3.5",
                    wsConnected ? "text-emerald-600" : "text-amber-600",
                  )}
                />
                {wsConnected ? "Live connection" : "Reconnecting…"}
              </div>
              <p className="truncate text-sm font-medium">{user?.name || user?.email}</p>
              <button
                type="button"
                onClick={logout}
                className="mt-3 inline-flex items-center gap-2 text-sm text-[var(--muted)] hover:text-[var(--fg)]"
              >
                <LogOut className="h-4 w-4" />
                Sign out
              </button>
            </div>
          </aside>

          <div
            className={cn(
              "flex min-h-0 flex-1 flex-col",
              // Reserve space for mobile bottom nav + safe area
              "pb-[calc(4.25rem+env(safe-area-inset-bottom))] md:pb-0",
            )}
          >
            <header className="sticky top-0 z-20 flex items-center justify-between gap-3 border-b border-[var(--border)] bg-[var(--panel)]/90 px-3 py-2.5 backdrop-blur-md pt-[max(0.625rem,env(safe-area-inset-top))] md:hidden">
              <div className="min-w-0">
                <p className="font-[family-name:var(--font-display)] text-lg leading-tight">
                  PetAI
                </p>
                <p className="truncate text-[11px] text-[var(--muted)]">
                  {wsConnected ? "Connected" : "Offline"}
                  {user?.email ? ` · ${user.email}` : ""}
                </p>
              </div>
              <button
                type="button"
                onClick={logout}
                className="shrink-0 rounded-lg border border-[var(--border)] px-2.5 py-1.5 text-xs"
              >
                Sign out
              </button>
            </header>

            <main
              className={cn(
                "flex min-h-0 flex-1 flex-col",
                isChat
                  ? "px-0 py-0 md:px-6 md:py-6"
                  : "px-3 py-4 sm:px-4 sm:py-5 md:px-8 md:py-8",
              )}
            >
              {children}
            </main>
          </div>
        </div>

        <nav
          className="fixed inset-x-0 bottom-0 z-30 border-t border-[var(--border)] bg-[var(--panel)]/95 backdrop-blur-md md:hidden"
          style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
        >
          <div className="mx-auto flex max-w-lg items-stretch justify-between gap-0.5 px-1 pt-1">
            {nav.map((item) => {
              const Icon = item.icon;
              const active = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex min-w-0 flex-1 flex-col items-center gap-0.5 rounded-lg px-1 py-1.5 text-[10px] leading-tight",
                    active ? "text-[var(--accent)]" : "text-[var(--muted)]",
                  )}
                >
                  <Icon className="h-5 w-5 shrink-0" />
                  <span className="w-full truncate text-center">{item.short}</span>
                </Link>
              );
            })}
          </div>
        </nav>
      </div>
    </AuthGuard>
  );
}
