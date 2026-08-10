"use client";

import type { AppInfo, ProcessInfo } from "@/lib/types";

export function DeviceStatePanel({
  apps,
  processes,
}: {
  apps: AppInfo[];
  processes: ProcessInfo[];
}) {
  return (
    <section className="rounded-2xl border border-[var(--border)] bg-[color-mix(in_srgb,var(--panel)_92%,transparent)] p-5 shadow-[0_18px_48px_-28px_rgba(0,0,0,0.55)]">
      <h2 className="font-display text-lg tracking-tight">
        Device state
      </h2>
      <p className="mt-1 text-xs text-[var(--muted)]">
        Running apps and top processes from the desktop agent
      </p>

      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
            Apps ({apps.length})
          </h3>
          <ul className="mt-2 max-h-40 space-y-1 overflow-y-auto text-sm">
            {apps.length ? (
              apps.map((app) => (
                <li
                  key={app.name}
                  className="truncate rounded-lg border border-[var(--border)] bg-[var(--panel-elevated)] px-2.5 py-1.5"
                >
                  {app.name}
                </li>
              ))
            ) : (
              <li className="text-[var(--muted)]">Press Apps to refresh</li>
            )}
          </ul>
        </div>
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
            Processes ({processes.length})
          </h3>
          <ul className="mt-2 max-h-40 space-y-1 overflow-y-auto text-sm">
            {processes.length ? (
              processes.map((proc) => (
                <li
                  key={`${proc.pid}-${proc.name}`}
                  className="flex justify-between gap-2 rounded-lg border border-[var(--border)] bg-[var(--panel-elevated)] px-2.5 py-1.5"
                >
                  <span className="truncate">{proc.name}</span>
                  <span className="shrink-0 text-[var(--muted)]">
                    {proc.pid}
                    {proc.cpu !== undefined ? ` · ${proc.cpu}%` : ""}
                  </span>
                </li>
              ))
            ) : (
              <li className="text-[var(--muted)]">Press Processes to refresh</li>
            )}
          </ul>
        </div>
      </div>
    </section>
  );
}
