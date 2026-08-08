"use client";

import { useState } from "react";
import Link from "next/link";
import { Camera, Copy, MessageSquare, RefreshCw } from "lucide-react";
import type { Device } from "@/lib/types";
import { formatOs, formatRelativeTime, taskStatusToPhase } from "@/lib/utils/format";
import { StatusDot } from "@/components/ui/StatusDot";
import { Button } from "@/components/ui/Button";
import { PhaseBadge } from "@/components/ui/PhaseBadge";
import { LockControls } from "@/components/devices/LockControls";

export function DeviceCard({
  device,
  onScreenshot,
  screenshotBusy,
  onRegenerateToken,
  regenerateBusy,
  onLock,
  onUnlock,
  lockBusy,
}: {
  device: Device;
  onScreenshot?: (deviceId: string) => void;
  screenshotBusy?: boolean;
  onRegenerateToken?: (deviceId: string) => void;
  regenerateBusy?: boolean;
  onLock?: (deviceId: string) => void;
  onUnlock?: (deviceId: string) => void;
  lockBusy?: "lock" | "unlock" | null;
}) {
  const active = device.activeTask;
  const [copied, setCopied] = useState(false);
  const online = device.connectionStatus === "ONLINE";

  async function copyToken() {
    if (!device.deviceToken) return;
    await navigator.clipboard.writeText(device.deviceToken);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <article className="rounded-2xl border border-[var(--border)] bg-[var(--panel)]/90 p-4 shadow-sm backdrop-blur sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate font-[family-name:var(--font-display)] text-lg tracking-tight sm:text-xl">
            {device.name}
          </h3>
          <p className="mt-1 text-sm text-[var(--muted)]">{formatOs(device.os)}</p>
        </div>
        <StatusDot status={device.connectionStatus} />
      </div>

      <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
        <div>
          <dt className="text-[var(--muted)]">Last seen</dt>
          <dd className="mt-0.5 font-medium">{formatRelativeTime(device.lastSeenAt)}</dd>
        </div>
        <div>
          <dt className="text-[var(--muted)]">Connection</dt>
          <dd className="mt-0.5 font-medium">{device.connectionStatus}</dd>
        </div>
      </dl>

      <div className="mt-4 rounded-xl border border-[var(--border)] bg-slate-950/95 p-3">
        <div className="mb-2 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs uppercase tracking-wide text-slate-400">Device token</p>
          <div className="flex flex-wrap gap-1">
            {device.deviceToken ? (
              <Button size="sm" variant="outline" onClick={() => void copyToken()}>
                <Copy className="h-3.5 w-3.5" />
                {copied ? "Copied" : "Copy"}
              </Button>
            ) : null}
            {onRegenerateToken ? (
              <Button
                size="sm"
                variant="outline"
                disabled={regenerateBusy}
                onClick={() => onRegenerateToken(device.id)}
              >
                <RefreshCw className="h-3.5 w-3.5" />
                {regenerateBusy ? "…" : "Regenerate"}
              </Button>
            ) : null}
          </div>
        </div>
        {device.deviceToken ? (
          <pre className="overflow-x-auto whitespace-pre-wrap break-all text-xs text-emerald-300">
            {device.deviceToken}
          </pre>
        ) : (
          <p className="text-xs text-amber-200">
            Token not stored yet. Click Regenerate, or reconnect the agent once to backfill it.
          </p>
        )}
      </div>

      <div className="mt-4">
        <p className="text-xs uppercase tracking-wide text-[var(--muted)]">Active task</p>
        {active ? (
          <div className="mt-2 space-y-2">
            <PhaseBadge phase={taskStatusToPhase(active.status)} />
            <p className="line-clamp-2 text-sm">{active.instruction}</p>
          </div>
        ) : (
          <p className="mt-2 text-sm text-[var(--muted)]">No active task</p>
        )}
      </div>

      <div className="mt-5 grid grid-cols-1 gap-2 sm:flex sm:flex-wrap">
        <Link href={`/chat?deviceId=${device.id}`} className="sm:contents">
          <Button size="sm" className="w-full sm:w-auto">
            <MessageSquare className="h-4 w-4" />
            Open Chat
          </Button>
        </Link>
        <Button
          size="sm"
          variant="outline"
          className="w-full sm:w-auto"
          disabled={!online || screenshotBusy || !!lockBusy}
          onClick={() => onScreenshot?.(device.id)}
        >
          <Camera className="h-4 w-4" />
          Screenshot
        </Button>
      </div>

      {onLock && onUnlock ? (
        <div className="mt-2">
          <LockControls
            disabled={!online || screenshotBusy}
            busy={lockBusy}
            onLock={() => onLock(device.id)}
            onUnlock={() => onUnlock(device.id)}
          />
        </div>
      ) : null}
    </article>
  );
}
