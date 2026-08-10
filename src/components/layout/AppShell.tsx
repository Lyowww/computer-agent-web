"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  MonitorSmartphone,
  MessageSquareCode,
  Settings,
  LogOut,
  Radio,
  AppWindow,
  Cpu,
  User,
  CreditCard,
  Gauge,
  Users,
  ScrollText,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { useAuthStore } from "@/stores/authStore";
import { useChatStore } from "@/stores/chatStore";
import { AuthGuard } from "@/components/layout/AuthGuard";
import { Badge } from "@/components/ui/Badge";
import { AccountBadge } from "@/components/billing/AccountBadge";
import { useAccount } from "@/hooks/useAccount";

const primaryNav = [
  { href: "/dashboard", label: "Dashboard", short: "Home", icon: LayoutDashboard },
  { href: "/devices", label: "Devices", short: "Devices", icon: MonitorSmartphone },
  { href: "/chat", label: "Chat", short: "Chat", icon: MessageSquareCode },
  { href: "/apps", label: "Apps", short: "Apps", icon: AppWindow },
  { href: "/processes", label: "Processes", short: "Procs", icon: Cpu },
];

const secondaryNav = [
  { href: "/usage", label: "Usage", short: "Usage", icon: Gauge },
  { href: "/billing", label: "Billing", short: "Bill", icon: CreditCard },
  { href: "/settings", label: "Settings", short: "More", icon: Settings },
];

function initials(name?: string | null, email?: string | null) {
  const source = (name || email || "?").trim();
  const parts = source.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return source.slice(0, 2).toUpperCase();
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const clearSession = useAuthStore((s) => s.clearSession);
  const wsConnected = useChatStore((s) => s.wsConnected);
  const account = useAccount();
  const isChat = pathname.startsWith("/chat");
  const isBusiness = account.data?.accountType === "BUSINESS";
  const showTeam = isBusiness && account.data?.entitlements.teamManagement;
  const showAudit = isBusiness && account.data?.entitlements.auditLogs;

  const businessNav = [
    ...(showTeam
      ? [{ href: "/team", label: "Team", short: "Team", icon: Users }]
      : []),
    ...(showAudit
      ? [{ href: "/audit", label: "Audit Logs", short: "Audit", icon: ScrollText }]
      : []),
  ];

  const desktopNav = [...primaryNav, ...businessNav, ...secondaryNav];
  const mobileNav = [...primaryNav, secondaryNav[1]!, secondaryNav[2]!];

  function logout() {
    clearSession();
    router.replace("/login/");
  }

  return (
    <AuthGuard>
      <div className="min-h-[100dvh] overflow-x-hidden bg-[var(--bg)] text-[var(--fg)]">
        <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
          <div className="absolute -left-24 top-0 h-80 w-80 rounded-full bg-[radial-gradient(circle,rgba(57,213,242,0.16),transparent_70%)] blur-2xl" />
          <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-[radial-gradient(circle,rgba(99,230,173,0.12),transparent_70%)] blur-2xl" />
          <div
            className="absolute inset-0 opacity-35"
            style={{
              backgroundImage:
                "radial-gradient(rgba(28,39,45,0.12) 1px, transparent 1px)",
              backgroundSize: "22px 22px",
            }}
          />
        </div>

        <div className="relative mx-auto flex min-h-[100dvh] w-full max-w-[1600px] flex-col md:flex-row">
          <aside className="hidden w-64 shrink-0 border-r border-[var(--border)] bg-[var(--panel)]/75 backdrop-blur-md md:flex md:flex-col lg:w-72 xl:w-80">
            <div className="relative border-b border-[var(--border)] px-5 py-6">
              <div className="absolute inset-y-0 left-0 w-px bg-gradient-to-b from-transparent via-[var(--accent)]/50 to-transparent" />
              <p className="font-display text-2xl tracking-tight text-[var(--fg)]">
                PETAI
              </p>
              <p className="mt-1 text-sm text-[var(--muted)]">Computer Agent</p>
              <div className="mt-4">
                <AccountBadge account={account.data} />
              </div>
            </div>
            <nav className="flex flex-1 flex-col gap-1 overflow-y-auto p-3" aria-label="App">
              {desktopNav.map((item) => {
                const Icon = item.icon;
                const active = pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={`${item.href}/`}
                    className={cn(
                      "group relative flex min-h-[44px] items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition",
                      active
                        ? "bg-[var(--accent-soft)] text-[var(--accent)] shadow-[inset_0_0_0_1px_color-mix(in_srgb,var(--accent)_30%,transparent)]"
                        : "text-[var(--muted)] hover:bg-[var(--panel-elevated)] hover:text-[var(--fg)]",
                    )}
                  >
                    {active ? (
                      <span className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-full bg-[var(--accent)] shadow-[0_0_8px_var(--accent-glow)]" />
                    ) : null}
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
                    wsConnected ? "text-[var(--success)]" : "text-[var(--warning)]",
                  )}
                />
                {wsConnected ? "Live connection" : "Reconnecting…"}
              </div>
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--accent-soft)] font-mono-ui text-xs font-semibold text-[var(--accent)]">
                  {initials(user?.name, user?.email)}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">
                    {user?.name || user?.email}
                  </p>
                  <button
                    type="button"
                    onClick={logout}
                    className="mt-0.5 inline-flex items-center gap-1.5 text-xs text-[var(--muted)] hover:text-[var(--fg)]"
                  >
                    <LogOut className="h-3 w-3" />
                    Sign out
                  </button>
                </div>
              </div>
            </div>
          </aside>

          <div
            className={cn(
              "flex min-h-0 flex-1 flex-col",
              "pb-[calc(5.25rem+env(safe-area-inset-bottom))] md:pb-0",
            )}
          >
            <header className="sticky top-0 z-20 flex items-center justify-between gap-3 border-b border-[var(--border)] bg-[var(--panel)]/90 px-4 py-3 backdrop-blur-md pt-[max(0.75rem,env(safe-area-inset-top))] md:hidden">
              <div className="min-w-0">
                <p className="font-display text-lg leading-tight">PETAI</p>
                <div className="mt-0.5 flex items-center gap-2">
                  <Badge
                    tone={wsConnected ? "success" : "warning"}
                    pulse={wsConnected}
                    className="px-2 py-0.5 text-[10px]"
                  >
                    {wsConnected ? "Connected" : "Offline"}
                  </Badge>
                  <AccountBadge account={account.data} compact />
                </div>
              </div>
              <button
                type="button"
                onClick={logout}
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--panel-elevated)]"
                aria-label="Sign out"
              >
                <User className="h-4 w-4 text-[var(--muted)]" />
              </button>
            </header>

            <main
              className={cn(
                "flex min-h-0 w-full flex-1 flex-col",
                isChat
                  ? "px-0 py-0 md:px-6 md:py-6"
                  : "px-4 py-5 sm:px-6 sm:py-6 md:px-8 md:py-8 lg:px-10",
              )}
            >
              {children}
            </main>
          </div>
        </div>

        <nav
          className="fixed inset-x-0 bottom-0 z-30 border-t border-[var(--border)] bg-[var(--panel)]/95 backdrop-blur-md md:hidden"
          style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
          aria-label="Mobile"
        >
          <div className="grid w-full grid-cols-6 gap-0 px-1 pt-1.5">
            {mobileNav.map((item) => {
              const Icon = item.icon;
              const active = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={`${item.href}/`}
                  className={cn(
                    "relative flex min-h-[52px] min-w-0 flex-col items-center justify-center gap-1 rounded-xl px-0.5 py-1.5 text-[11px] leading-none transition",
                    active ? "text-[var(--accent)]" : "text-[var(--muted)]",
                  )}
                >
                  {active ? (
                    <span className="absolute inset-x-3 top-0 h-0.5 rounded-full bg-[var(--accent)] shadow-[0_0_10px_var(--accent-glow)]" />
                  ) : null}
                  <Icon
                    className={cn(
                      "h-[1.15rem] w-[1.15rem] shrink-0",
                      active && "drop-shadow-[0_0_6px_var(--accent-glow)]",
                    )}
                  />
                  <span className="max-w-full truncate px-0.5 text-center font-medium tracking-tight">
                    {item.short}
                  </span>
                </Link>
              );
            })}
          </div>
        </nav>
      </div>
    </AuthGuard>
  );
}
