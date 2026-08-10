"use client";

import { AppShell } from "@/components/layout/AppShell";
import { Card } from "@/components/ui/Card";
import { useAccount } from "@/hooks/useAccount";
import { ACCOUNT_TYPE_LABELS, PLAN_LABELS } from "@/lib/types/billing";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default function UsagePage() {
  const account = useAccount();
  const data = account.data;

  return (
    <AppShell>
      <div className="mx-auto w-full max-w-3xl space-y-6">
        <header>
          <h1 className="font-display text-2xl tracking-tight sm:text-3xl">
            Usage
          </h1>
          <p className="mt-1 text-sm text-[var(--muted)]">
            Track how your workspace consumes plan limits.
          </p>
        </header>

        <Card padding="lg" className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-wide text-[var(--muted)]">
                Devices
              </p>
              <p className="mt-1 font-mono-ui text-3xl text-[var(--fg)]">
                {data?.usage.devices ?? "—"} / {data?.entitlements.maxDevices ?? "—"}
              </p>
            </div>
            {data ? (
              <div className="text-right text-sm text-[var(--muted)]">
                <p>{ACCOUNT_TYPE_LABELS[data.accountType]}</p>
                <p>{PLAN_LABELS[data.subscription.plan]}</p>
              </div>
            ) : null}
          </div>

          <div className="h-2 overflow-hidden rounded-full bg-[var(--panel-elevated)]">
            <div
              className="h-full rounded-full bg-[var(--accent)] transition-all"
              style={{
                width: `${Math.min(
                  100,
                  data
                    ? (data.usage.devices / Math.max(data.entitlements.maxDevices, 1)) *
                      100
                    : 0,
                )}%`,
              }}
            />
          </div>

          {data?.limitState === "OVER_LIMIT" ? (
            <p className="text-sm text-[var(--warning)]">
              This workspace is over the current device limit. Existing devices
              stay connected — remove a device or upgrade to add more.
            </p>
          ) : null}

          <Link href="/billing/" className="inline-flex">
            <Button size="sm" variant="secondary">
              View plans
            </Button>
          </Link>
        </Card>
      </div>
    </AppShell>
  );
}
