import { apiFetch } from "@/lib/api/client";
import type {
  AccountContext,
  BillingSummary,
  CheckoutResult,
  DeviceUsage,
  SubscriptionPlan,
} from "@/lib/types/billing";

export function getAccountContext(): Promise<AccountContext> {
  return apiFetch<AccountContext>("/accounts/me");
}

export function getBillingSummary(): Promise<BillingSummary> {
  return apiFetch<BillingSummary>("/billing");
}

export function getDeviceUsage(): Promise<DeviceUsage> {
  return apiFetch<DeviceUsage>("/devices/usage");
}

export function createCheckout(input: {
  plan: SubscriptionPlan;
  successUrl: string;
  cancelUrl: string;
}): Promise<CheckoutResult> {
  return apiFetch<CheckoutResult>("/billing/checkout", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function upgradeToBusiness(input: {
  successUrl: string;
  cancelUrl: string;
}): Promise<CheckoutResult> {
  return apiFetch<CheckoutResult>("/billing/upgrade-to-business", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function cancelSubscription(atPeriodEnd = true) {
  return apiFetch("/billing/cancel", {
    method: "POST",
    body: JSON.stringify({ atPeriodEnd }),
  });
}

export function listAccountMembers(): Promise<
  Array<{
    id: string;
    role: string;
    user: { id: string; email: string; name: string | null };
  }>
> {
  return apiFetch("/accounts/members");
}

export function listAuditLogs(limit = 50): Promise<
  Array<{
    id: string;
    action: string;
    createdAt: string;
    targetType?: string | null;
    targetId?: string | null;
    actor?: { email: string; name: string | null } | null;
  }>
> {
  return apiFetch(`/accounts/audit-logs?limit=${limit}`);
}
