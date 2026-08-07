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
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/devices", label: "Devices", icon: MonitorSmartphone },
  { href: "/chat", label: "Chat", icon: MessageSquare },
  { href: "/apps", label: "Apps", icon: AppWindow },
  { href: "/processes", label: "Processes", icon: Cpu },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const clearSession = useAuthStore((s) => s.clearSession);
  const wsConnected = useChatStore((s) => s.wsConnected);

  function logout() {
    clearSession();
    router.replace("/login");
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-[var(--bg)] text-[var(--fg)]">
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

        <div className="mx-auto flex min-h-screen max-w-7xl flex-col md:flex-row">
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
                    {item.label}
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

          <div className="flex min-h-screen flex-1 flex-col pb-20 md:pb-0">
            <header className="sticky top-0 z-20 flex items-center justify-between border-b border-[var(--border)] bg-[var(--panel)]/75 px-4 py-3 backdrop-blur-md md:hidden">
              <div>
                <p className="font-[family-name:var(--font-display)] text-xl">PetAI</p>
                <p className="text-xs text-[var(--muted)]">
                  {wsConnected ? "Connected" : "Offline"}
                </p>
              </div>
              <button
                type="button"
                onClick={logout}
                className="rounded-lg border border-[var(--border)] px-3 py-1.5 text-sm"
              >
                Sign out
              </button>
            </header>
            <main className="flex-1 px-4 py-5 md:px-8 md:py-8">{children}</main>
          </div>
        </div>

        <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-[var(--border)] bg-[var(--panel)]/95 backdrop-blur-md md:hidden">
          <div className="mx-auto grid max-w-lg grid-cols-6 gap-1 px-1 py-2">
            {nav.map((item) => {
              const Icon = item.icon;
              const active = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex flex-col items-center gap-1 rounded-xl px-2 py-2 text-[11px]",
                    active ? "text-[var(--accent)]" : "text-[var(--muted)]",
                  )}
                >
                  <Icon className="h-5 w-5" />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </nav>
      </div>
    </AuthGuard>
  );
}
