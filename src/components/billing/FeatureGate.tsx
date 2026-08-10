"use client";

import Link from "next/link";
import { Lock } from "lucide-react";
import { useEntitlement } from "@/hooks/useAccount";
import type { BooleanFeature } from "@/lib/types/billing";
import {
  FEATURE_LABELS,
  PLAN_LABELS,
  requiredPlanForFeature,
} from "@/lib/types/billing";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils/cn";

interface FeatureGateProps {
  feature: BooleanFeature;
  children?: React.ReactNode;
  fallback?: "locked" | "hidden" | "upgrade";
  className?: string;
  description?: string;
}

export function FeatureGate({
  feature,
  children,
  fallback = "locked",
  className,
  description,
}: FeatureGateProps) {
  const allowed = useEntitlement(feature);
  if (allowed) return <>{children}</>;
  if (fallback === "hidden") return null;
  if (fallback === "upgrade") {
    return <UpgradeRequired feature={feature} description={description} />;
  }
  return (
    <LockedFeature
      feature={feature}
      description={description}
      className={className}
    />
  );
}

export function LockedFeature({
  feature,
  description,
  className,
}: {
  feature: BooleanFeature;
  description?: string;
  className?: string;
}) {
  const plan = requiredPlanForFeature(feature);
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--panel)]/80 p-6",
        className,
      )}
    >
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--panel-elevated)]">
          <Lock className="h-4 w-4 text-[var(--muted)]" />
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="font-display text-xl tracking-tight">
            {FEATURE_LABELS[feature]}
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">
            {description ??
              `Unlock ${FEATURE_LABELS[feature].toLowerCase()} for your workspace.`}
          </p>
          <p className="mt-3 text-sm text-[var(--fg)]">
            Available with {PLAN_LABELS[plan]}.
          </p>
          <Link href="/billing/" className="mt-4 inline-flex">
            <Button size="sm">Upgrade</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

export function UpgradeRequired({
  feature,
  description,
}: {
  feature: BooleanFeature;
  description?: string;
}) {
  const plan = requiredPlanForFeature(feature);
  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--accent-soft)]/40 p-5">
      <p className="font-medium">This feature requires {PLAN_LABELS[plan]}</p>
      <p className="mt-1 text-sm text-[var(--muted)]">
        {description ??
          `${FEATURE_LABELS[feature]} is available with ${PLAN_LABELS[plan]}.`}
      </p>
      <Link href="/billing/" className="mt-3 inline-flex">
        <Button size="sm" variant="secondary">
          View Plans
        </Button>
      </Link>
    </div>
  );
}
