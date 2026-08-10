"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Camera,
  ChevronDown,
  Copy,
  KeyRound,
  MessageSquareCode,
  RefreshCw,
  Video,
} from "lucide-react";
import type { Device } from "@/lib/types";
import { formatOs, formatRelativeTime, taskStatusToPhase } from "@/lib/utils/format";
import { StatusDot } from "@/components/ui/StatusDot";
import { Button } from "@/components/ui/Button";
import { PhaseBadge } from "@/components/ui/PhaseBadge";
import { Card } from "@/components/ui/Card";
import { LockControls } from "@/components/devices/LockControls";
import { useToast } from "@/components/ui/Toast";
import { cn } from "@/lib/utils/cn";

export function DeviceCard({
  device,
  onScreenshot,
  screenshotBusy,
  onCamera,
  cameraBusy,
  onRegenerateToken,
  regenerateBusy,
  onLock,
  onUnlock,
  lockBusy,
  showSetup = false,
}: {
  device: Device;
  onScreenshot?: (deviceId: string) => void;
  screenshotBusy?: boolean;
  onCamera?: (deviceId: string) => void;
  cameraBusy?: boolean;
  onRegenerateToken?: (deviceId: string) => void;
  regenerateBusy?: boolean;
  onLock?: (deviceId: string) => void;
  onUnlock?: (deviceId: string) => void;
  lockBusy?: "lock" | "unlock" | null;
  showSetup?: boolean;
}) {
  const active = device.activeTask;
  const [copied, setCopied] = useState(false);
  const [tokenOpen, setTokenOpen] = useState(false);
  const { toast } = useToast();
  const online = device.connectionStatus === "ONLINE";
  const mediaBusy = screenshotBusy || cameraBusy || !!lockBusy;

  async function copyToken() {
    if (!device.deviceToken) return;
    await navigator.clipboard.writeText(device.deviceToken);
    setCopied(true);
    toast("Token copied", "success");
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <Card className="h-full">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <Link
            href={`/devices/${device.id}`}
            className="group block min-w-0 rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
          >
            <h3 className="truncate font-display text-lg tracking-tight group-hover:text-[var(--accent-strong)] sm:text-xl">
              {device.name}
            </h3>
          </Link>
          <p className="mt-1 text-sm text-[var(--muted)]">{formatOs(device.os)}</p>
        </div>
        <StatusDot status={device.connectionStatus} />
      </div>

      <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
        <div className="rounded-xl border border-[var(--border)] bg-[var(--panel-elevated)]/60 px-3 py-2">
          <dt className="text-[11px] uppercase tracking-wide text-[var(--muted)]">
            Last seen
          </dt>
          <dd className="mt-0.5 font-medium">{formatRelativeTime(device.lastSeenAt)}</dd>
        </div>
        <div className="rounded-xl border border-[var(--border)] bg-[var(--panel-elevated)]/60 px-3 py-2">
          <dt className="text-[11px] uppercase tracking-wide text-[var(--muted)]">
            Active task
          </dt>
          <dd className="mt-1">
            {active ? (
              <PhaseBadge phase={taskStatusToPhase(active.status)} />
            ) : (
              <span className="text-[var(--muted)]">Idle</span>
            )}
          </dd>
        </div>
      </dl>

      {active ? (
        <p className="mt-3 line-clamp-2 text-sm text-[var(--muted)]">
          {active.instruction}
        </p>
      ) : null}

      <div className="mt-4 grid grid-cols-2 gap-2">
        <Link href={`/devices/${device.id}`} className="col-span-2">
          <Button size="sm" variant="outline" className="w-full">
            Device details
          </Button>
        </Link>
        <Link href={`/chat/?deviceId=${device.id}`} className="col-span-2">
          <Button size="sm" className="w-full">
            <MessageSquareCode className="h-4 w-4" />
            Open Chat
          </Button>
        </Link>
        {onScreenshot ? (
          <Button
            size="sm"
            variant="outline"
            className="w-full"
            disabled={!online || mediaBusy}
            loading={screenshotBusy}
            onClick={() => onScreenshot(device.id)}
          >
            <Camera className="h-4 w-4" />
            Screen
          </Button>
        ) : null}
        {onCamera ? (
          <Button
            size="sm"
            variant="outline"
            className="w-full"
            disabled={!online || mediaBusy}
            loading={cameraBusy}
            onClick={() => onCamera(device.id)}
          >
            <Video className="h-4 w-4" />
            Camera
          </Button>
        ) : null}
      </div>

      {onLock && onUnlock ? (
        <div className="mt-2">
          <LockControls
            disabled={!online || mediaBusy}
            busy={lockBusy}
            onLock={() => {
              onLock(device.id);
              toast("Lock command sent", "info");
            }}
            onUnlock={() => {
              onUnlock(device.id);
              toast("Unlock command sent", "info");
            }}
          />
        </div>
      ) : null}

      {(showSetup || onRegenerateToken) ? (
        <div className="mt-4 border-t border-[var(--border)] pt-3">
          <button
            type="button"
            onClick={() => setTokenOpen((v) => !v)}
            className="flex w-full min-h-[44px] items-center justify-between gap-2 rounded-xl px-1 text-left text-sm font-medium text-[var(--muted)] hover:text-[var(--fg)]"
          >
            <span className="inline-flex items-center gap-2">
              <KeyRound className="h-4 w-4" />
              Show Agent Key
            </span>
            <ChevronDown
              className={cn(
                "h-4 w-4 transition-transform",
                tokenOpen && "rotate-180",
              )}
            />
          </button>
          {tokenOpen ? (
            <div className="mt-2 rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)] p-3">
              <div className="mb-2 flex flex-wrap gap-1">
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
                    loading={regenerateBusy}
                    onClick={() => onRegenerateToken(device.id)}
                  >
                    <RefreshCw className="h-3.5 w-3.5" />
                    Regenerate
                  </Button>
                ) : null}
              </div>
              {device.deviceToken ? (
                <pre className="overflow-x-auto whitespace-pre-wrap break-all font-[family-name:var(--font-mono)] text-[11px] text-[var(--accent-strong)]/90">
                  {device.deviceToken}
                </pre>
              ) : (
                <p className="text-xs text-amber-300/90">
                  Token not stored yet. Regenerate, or reconnect the agent once to
                  backfill it.
                </p>
              )}
            </div>
          ) : null}
        </div>
      ) : null}
    </Card>
  );
}
