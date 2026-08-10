"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getAccountContext, getBillingSummary } from "@/lib/api/billing";
import type { BooleanFeature } from "@/lib/types/billing";
import { useAuthStore } from "@/stores/authStore";

export const accountQueryKey = ["account"] as const;
export const billingQueryKey = ["billing"] as const;

export function useAccount() {
  const token = useAuthStore((s) => s.token);
  return useQuery({
    queryKey: accountQueryKey,
    queryFn: getAccountContext,
    enabled: !!token,
    staleTime: 30_000,
  });
}

export function useBilling() {
  const token = useAuthStore((s) => s.token);
  return useQuery({
    queryKey: billingQueryKey,
    queryFn: getBillingSummary,
    enabled: !!token,
    staleTime: 30_000,
  });
}

export function useEntitlement(feature: BooleanFeature): boolean {
  const { data } = useAccount();
  if (!data) return false;
  return Boolean(data.entitlements[feature]);
}

export function useInvalidateAccount() {
  const queryClient = useQueryClient();
  return () => {
    void queryClient.invalidateQueries({ queryKey: accountQueryKey });
    void queryClient.invalidateQueries({ queryKey: billingQueryKey });
    void queryClient.invalidateQueries({ queryKey: ["devices"] });
  };
}
