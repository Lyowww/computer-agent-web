"use client";

import Link from "next/link";
import { X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import type { BooleanFeature } from "@/lib/types/billing";
import {
  FEATURE_LABELS,
  PLAN_LABELS,
  requiredPlanForFeature,
} from "@/lib/types/billing";

interface UpgradeDialogProps {
  open: boolean;
  onClose: () => void;
  feature?: BooleanFeature;
  title?: string;
  message?: string;
  /** Device-limit specific copy */
  deviceLimit?: { max: number; planName: string };
}

export function UpgradeDialog({
  open,
  onClose,
  feature,
  title,
  message,
  deviceLimit,
}: UpgradeDialogProps) {
  if (!open) return null;

  const plan = feature ? requiredPlanForFeature(feature) : "PERSONAL_PRO";
  const resolvedTitle =
    title ??
    (deviceLimit
      ? `You've reached your ${deviceLimit.max}-device limit`
      : feature
        ? `This feature requires ${PLAN_LABELS[plan]}`
        : "Upgrade your plan");

  const resolvedMessage =
    message ??
    (deviceLimit
      ? `Upgrade to continue adding devices beyond your ${deviceLimit.planName} plan.`
      : feature
        ? `${FEATURE_LABELS[feature]} is available with ${PLAN_LABELS[plan]}.`
        : "Choose a plan that fits your workspace.");

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-[color-mix(in_srgb,#04070a_72%,transparent)] p-4 backdrop-blur-sm sm:items-center">
      <button
        type="button"
        className="absolute inset-0 cursor-default"
        aria-label="Close"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        className="relative w-full max-w-md rounded-2xl border border-[var(--border)] bg-[var(--panel)] p-6 shadow-xl"
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-3 top-3 rounded-lg p-2 text-[var(--muted)] hover:bg-[var(--panel-elevated)] hover:text-[var(--fg)]"
          aria-label="Close dialog"
        >
          <X className="h-4 w-4" />
        </button>
        <h2 className="pr-8 font-display text-2xl tracking-tight">
          {resolvedTitle}
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">
          {resolvedMessage}
        </p>
        <div className="mt-5 flex flex-wrap gap-2">
          <Link href="/billing/" onClick={onClose}>
            <Button>View Plans</Button>
          </Link>
          <Button variant="secondary" onClick={onClose}>
            Not now
          </Button>
        </div>
      </div>
    </div>
  );
}
