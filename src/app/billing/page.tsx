"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Check, Minus } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { ErrorBanner } from "@/components/ui/ErrorBanner";
import { useAccount, useBilling, useInvalidateAccount } from "@/hooks/useAccount";
import {
  createCheckout,
  upgradeToBusiness,
} from "@/lib/api/billing";
import {
  ACCOUNT_TYPE_LABELS,
  PLAN_LABELS,
  type SubscriptionPlan,
} from "@/lib/types/billing";
import { useToast } from "@/components/ui/Toast";
import { ApiError } from "@/lib/api/client";
import { formatTimestamp } from "@/lib/utils/format";

function returnUrls() {
  const origin =
    typeof window !== "undefined" ? window.location.origin : "http://localhost:3001";
  return {
    successUrl: `${origin}/billing/?checkout=success`,
    cancelUrl: `${origin}/billing/?checkout=cancel`,
  };
}

export default function BillingPage() {
  const billing = useBilling();
  const account = useAccount();
  const invalidate = useInvalidateAccount();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const checkoutMutation = useMutation({
    mutationFn: (plan: SubscriptionPlan) =>
      createCheckout({ plan, ...returnUrls() }),
    onSuccess: async (result) => {
      if (result.checkoutUrl) {
        window.location.href = result.checkoutUrl;
        return;
      }
      if (result.appliedImmediately) {
        toast("Plan updated", "success");
        invalidate();
        await queryClient.invalidateQueries({ queryKey: ["billing"] });
      }
    },
    onError: (err) => {
      toast(
        err instanceof ApiError ? err.message : "Checkout failed",
        "error",
      );
    },
  });

  const businessMutation = useMutation({
    mutationFn: () => upgradeToBusiness(returnUrls()),
    onSuccess: async (result) => {
      if (result.checkoutUrl) {
        window.location.href = result.checkoutUrl;
        return;
      }
      if (result.appliedImmediately) {
        toast("Upgraded to Business", "success");
        invalidate();
      }
    },
    onError: (err) => {
      toast(
        err instanceof ApiError ? err.message : "Upgrade failed",
        "error",
      );
    },
  });

  const data = billing.data;
  const currentPlan = data?.subscription.plan ?? account.data?.subscription.plan;

  return (
    <AppShell>
      <div className="mx-auto w-full max-w-6xl space-y-6">
        <header>
          <h1 className="font-display text-2xl tracking-tight sm:text-3xl">
            Billing
          </h1>
          <p className="mt-1 text-sm text-[var(--muted)]">
            Manage your plan, device limits, and workspace entitlements.
          </p>
        </header>

        {billing.isError ? (
          <ErrorBanner
            message={
              billing.error instanceof Error
                ? billing.error.message
                : "Failed to load billing"
            }
          />
        ) : null}

        {data ? (
          <>
            <Card padding="lg" className="space-y-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-wide text-[var(--muted)]">
                    Current plan
                  </p>
                  <h2 className="mt-1 font-display text-2xl tracking-tight">
                    {PLAN_LABELS[data.subscription.plan]}
                  </h2>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <Badge tone="neutral">
                      {ACCOUNT_TYPE_LABELS[data.accountType]}
                    </Badge>
                    <Badge
                      tone={
                        data.subscription.status === "ACTIVE" ||
                        data.subscription.status === "TRIALING"
                          ? "success"
                          : "warning"
                      }
                    >
                      {data.subscription.status}
                    </Badge>
                  </div>
                </div>
                <div className="text-right text-sm text-[var(--muted)]">
                  <p>
                    Devices{" "}
                    <span className="font-mono-ui text-[var(--fg)]">
                      {data.usage.devices} / {data.entitlements.maxDevices}
                    </span>
                  </p>
                  {data.subscription.currentPeriodEnd ? (
                    <p className="mt-1">
                      Renews{" "}
                      {formatTimestamp(data.subscription.currentPeriodEnd)}
                    </p>
                  ) : null}
                </div>
              </div>

              {data.accountType === "PERSONAL" ? (
                <div className="rounded-xl border border-[var(--border)] bg-[var(--panel-elevated)]/60 p-4">
                  <p className="font-medium">Need a team workspace?</p>
                  <p className="mt-1 text-sm text-[var(--muted)]">
                    Upgrade to Business for 5 devices, team roles, and audit logs.
                    Existing devices stay connected.
                  </p>
                  <Button
                    className="mt-3"
                    size="sm"
                    loading={businessMutation.isPending}
                    onClick={() => businessMutation.mutate()}
                  >
                    Upgrade to Business
                  </Button>
                </div>
              ) : null}
            </Card>

            <section className="space-y-3">
              <h2 className="font-display text-xl tracking-tight">
                Plan comparison
              </h2>
              <div className="overflow-x-auto rounded-2xl border border-[var(--border)]">
                <table className="min-w-full text-left text-sm">
                  <thead className="bg-[var(--panel-elevated)] text-[var(--muted)]">
                    <tr>
                      <th className="px-4 py-3 font-medium">Feature</th>
                      {(["FREE", "PERSONAL_PRO", "BUSINESS"] as SubscriptionPlan[]).map(
                        (plan) => (
                          <th key={plan} className="px-4 py-3 font-medium">
                            {PLAN_LABELS[plan]}
                            {currentPlan === plan ? (
                              <span className="ml-2 text-[10px] text-[var(--accent)]">
                                Current
                              </span>
                            ) : null}
                          </th>
                        ),
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {data.comparison.map((row) => (
                      <tr
                        key={row.key}
                        className="border-t border-[var(--border)]"
                      >
                        <td className="px-4 py-3 text-[var(--fg)]">{row.label}</td>
                        {(["FREE", "PERSONAL_PRO", "BUSINESS"] as SubscriptionPlan[]).map(
                          (plan) => {
                            const value = row.values[plan];
                            return (
                              <td key={plan} className="px-4 py-3">
                                {typeof value === "boolean" ? (
                                  value ? (
                                    <Check className="h-4 w-4 text-[var(--success)]" />
                                  ) : (
                                    <Minus className="h-4 w-4 text-[var(--muted)]" />
                                  )
                                ) : (
                                  <span className="font-mono-ui">{value}</span>
                                )}
                              </td>
                            );
                          },
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                {(
                  [
                    ["FREE", "Free"],
                    ["PERSONAL_PRO", "Personal Pro"],
                    ["BUSINESS", "Business"],
                  ] as const
                ).map(([plan, label]) => (
                  <Card key={plan} className="space-y-3" padding="lg">
                    <div>
                      <h3 className="font-display text-lg">{label}</h3>
                      <p className="mt-1 text-xs text-[var(--muted)]">
                        {plan === "FREE"
                          ? "For getting started"
                          : plan === "PERSONAL_PRO"
                            ? "Advanced AI & device intel"
                            : "Teams & audit logs"}
                      </p>
                    </div>
                    {plan === "FREE" || currentPlan === plan ? (
                      <Button variant="outline" disabled className="w-full">
                        {currentPlan === plan ? "Current plan" : "Included"}
                      </Button>
                    ) : (
                      <Button
                        className="w-full"
                        loading={
                          checkoutMutation.isPending &&
                          checkoutMutation.variables === plan
                        }
                        onClick={() => checkoutMutation.mutate(plan)}
                      >
                        {plan === "BUSINESS" ? "Choose Business" : "Upgrade"}
                      </Button>
                    )}
                  </Card>
                ))}
              </div>
            </section>
          </>
        ) : billing.isLoading ? (
          <Card padding="lg">
            <p className="text-sm text-[var(--muted)]">Loading billing…</p>
          </Card>
        ) : null}
      </div>
    </AppShell>
  );
}
