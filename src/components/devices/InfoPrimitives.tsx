"use client";

import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { cn } from "@/lib/utils/cn";
import type { ReactNode } from "react";

export function MetaField({
  label,
  value,
  hint,
  className,
}: {
  label: string;
  value: ReactNode;
  hint?: string;
  className?: string;
}) {
  return (
    <div className={cn("min-w-0", className)} title={hint}>
      <dt className="text-[11px] uppercase tracking-wide text-[var(--muted)]">
        {label}
      </dt>
      <dd className="mt-1 break-words text-sm font-medium text-[var(--fg)]">
        {value ?? <span className="text-[var(--muted)]">Unavailable</span>}
      </dd>
    </div>
  );
}

export function InfoSection({
  title,
  description,
  children,
  className,
}: {
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <Card className={cn("h-full", className)}>
      <CardHeader>
        <div>
          <CardTitle>{title}</CardTitle>
          {description ? (
            <p className="mt-1 text-xs text-[var(--muted)]">{description}</p>
          ) : null}
        </div>
      </CardHeader>
      {children}
    </Card>
  );
}

export function StatCard({
  label,
  value,
  detail,
}: {
  label: string;
  value: ReactNode;
  detail?: ReactNode;
}) {
  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--panel-elevated)]/70 px-3 py-3 sm:px-4">
      <p className="text-[11px] uppercase tracking-wide text-[var(--muted)]">
        {label}
      </p>
      <p className="mt-1 font-display text-lg tracking-tight sm:text-xl">
        {value}
      </p>
      {detail ? (
        <p className="mt-1 line-clamp-2 text-xs text-[var(--muted)]">{detail}</p>
      ) : null}
    </div>
  );
}

export function EmptyHint({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-xl border border-dashed border-[var(--border)] bg-[var(--bg-elevated)]/50 px-4 py-6 text-center text-sm text-[var(--muted)]">
      {children}
    </div>
  );
}
