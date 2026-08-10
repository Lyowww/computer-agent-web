"use client";

import Link from "next/link";
import {
  ACCOUNT_TYPE_LABELS,
  PLAN_LABELS,
  type AccountContext,
} from "@/lib/types/billing";
import { Badge } from "@/components/ui/Badge";

export function AccountBadge({
  account,
  compact = false,
}: {
  account?: AccountContext | null;
  compact?: boolean;
}) {
  if (!account) return null;

  const planLabel = PLAN_LABELS[account.subscription.plan];
  const typeLabel = ACCOUNT_TYPE_LABELS[account.accountType];
  const showTypeSeparately =
    account.subscription.plan === "FREE" ||
    (account.accountType === "BUSINESS" &&
      account.subscription.plan !== "BUSINESS" &&
      account.subscription.plan !== "BUSINESS_PRO");

  const devices = `${account.usage.devices} / ${account.entitlements.maxDevices} devices`;

  if (compact) {
    return (
      <Link
        href="/billing/"
        className="inline-flex items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--panel-elevated)] px-2.5 py-1 text-xs text-[var(--muted)] hover:text-[var(--fg)]"
      >
        <Badge tone="neutral" className="px-1.5 py-0 text-[10px]">
          {showTypeSeparately ? `${typeLabel} · ${planLabel}` : planLabel}
        </Badge>
        <span className="font-mono-ui">{devices}</span>
      </Link>
    );
  }

  return (
    <Link
      href="/billing/"
      className="block rounded-xl border border-[var(--border)] bg-[var(--panel-elevated)]/70 px-3 py-2.5 transition hover:border-[var(--accent)]/40"
    >
      <p className="text-xs uppercase tracking-wide text-[var(--muted)]">
        {typeLabel}
      </p>
      <p className="mt-0.5 text-sm font-medium text-[var(--fg)]">{planLabel}</p>
      <p className="mt-1 font-mono-ui text-xs text-[var(--muted)]">{devices}</p>
      {account.limitState === "OVER_LIMIT" ? (
        <p className="mt-1 text-[11px] text-[var(--warning)]">Over device limit</p>
      ) : null}
    </Link>
  );
}
