"use client";

import Link from "next/link";
import { Camera, MessageSquare } from "lucide-react";
import type { Device } from "@/lib/types";
import { formatOs, formatRelativeTime, taskStatusToPhase } from "@/lib/utils/format";
import { StatusDot } from "@/components/ui/StatusDot";
import { Button } from "@/components/ui/Button";
import { PhaseBadge } from "@/components/ui/PhaseBadge";

export function DeviceCard({
  device,
  onScreenshot,
  screenshotBusy,
}: {
  device: Device;
  onScreenshot?: (deviceId: string) => void;
  screenshotBusy?: boolean;
}) {
  const active = device.activeTask;

  return (
    <article className="rounded-2xl border border-[var(--border)] bg-[var(--panel)]/90 p-5 shadow-sm backdrop-blur">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-[family-name:var(--font-display)] text-xl tracking-tight">
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

      <div className="mt-5 flex flex-wrap gap-2">
        <Link href={`/chat?deviceId=${device.id}`}>
          <Button size="sm">
            <MessageSquare className="h-4 w-4" />
            Open Chat
          </Button>
        </Link>
        <Button
          size="sm"
          variant="outline"
          disabled={device.connectionStatus !== "ONLINE" || screenshotBusy}
          onClick={() => onScreenshot?.(device.id)}
        >
          <Camera className="h-4 w-4" />
          Take Screenshot
        </Button>
      </div>
    </article>
  );
}
