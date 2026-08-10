"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  Cpu,
  HardDrive,
  Info,
  MemoryStick,
  Monitor,
  RefreshCw,
  Shield,
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { ErrorBanner } from "@/components/ui/ErrorBanner";
import { Skeleton } from "@/components/ui/Skeleton";
import { StatusDot } from "@/components/ui/StatusDot";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { useToast } from "@/components/ui/Toast";
import { CopyValue } from "@/components/devices/CopyValue";
import { DeviceLocationMap } from "@/components/devices/DeviceLocationMap";
import {
  EmptyHint,
  InfoSection,
  MetaField,
  StatCard,
} from "@/components/devices/InfoPrimitives";
import { getDevice, regenerateDeviceToken, revokeDevice } from "@/lib/api/devices";
import {
  formatBytes,
  formatLatency,
  formatOs,
  formatRelativeTime,
  formatTimestamp,
  formatUptime,
} from "@/lib/utils/format";
import { Suspense, useState } from "react";
import { FeatureGate } from "@/components/billing/FeatureGate";
import { useEntitlement } from "@/hooks/useAccount";
import { Spinner } from "@/components/ui/Spinner";

function DeviceDetailSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-24 w-full" />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-24" />
        ))}
      </div>
      <Skeleton className="h-64 w-full" />
    </div>
  );
}

function DeviceDetailInner() {
  const searchParams = useSearchParams();
  const deviceId = searchParams.get("deviceId") || "";
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [revokeOpen, setRevokeOpen] = useState(false);
  const [regenOpen, setRegenOpen] = useState(false);

  const detailQuery = useQuery({
    queryKey: ["devices", deviceId],
    queryFn: () => getDevice(deviceId),
    enabled: Boolean(deviceId),
    refetchInterval: 60_000,
  });

  const revokeMutation = useMutation({
    mutationFn: () => revokeDevice(deviceId),
    onSuccess: () => {
      setRevokeOpen(false);
      toast("Device revoked", "success");
      void queryClient.invalidateQueries({ queryKey: ["devices"] });
    },
  });

  const regenMutation = useMutation({
    mutationFn: () => regenerateDeviceToken(deviceId),
    onSuccess: () => {
      setRegenOpen(false);
      toast("Token regenerated", "success");
      void queryClient.invalidateQueries({ queryKey: ["devices", deviceId] });
      void queryClient.invalidateQueries({ queryKey: ["devices"] });
    },
  });

  if (!deviceId) {
    return (
      <AppShell>
        <div className="space-y-4">
          <Link href="/devices/">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4" />
              Devices
            </Button>
          </Link>
          <EmptyHint>Select a device to view details.</EmptyHint>
        </div>
      </AppShell>
    );
  }

  const device = detailQuery.data;
  const networkAllowed = useEntitlement("networkInformation");
  const locationAllowed = useEntitlement("locationInformation");
  const system = device?.system ?? null;
  const network =
    device?.network &&
    typeof device.network === "object" &&
    "locked" in (device.network as object)
      ? null
      : (device?.network ?? null);
  const location =
    device?.location &&
    typeof device.location === "object" &&
    "locked" in (device.location as object)
      ? null
      : (device?.location ?? null);
  const connection = device?.connection ?? null;
  const online = device?.connectionStatus === "ONLINE";
  const primaryDisplay =
    system?.displays?.find((d) => d.primary) ?? system?.displays?.[0] ?? null;
  const primaryStorage = system?.storage?.[0] ?? null;

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex flex-wrap items-center gap-3">
          <Link href="/devices/">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4" />
              Devices
            </Button>
          </Link>
        </div>

        {detailQuery.isLoading ? (
          <DeviceDetailSkeleton />
        ) : detailQuery.isError ? (
          <ErrorBanner
            message={
              detailQuery.error instanceof Error
                ? detailQuery.error.message
                : "Failed to load device"
            }
          />
        ) : !device ? (
          <EmptyHint>Device not found</EmptyHint>
        ) : (
          <>
            <header className="rounded-2xl border border-[var(--border)] bg-[var(--panel)]/90 p-4 sm:p-5">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-3">
                    <h1 className="font-display text-2xl tracking-tight sm:text-3xl">
                      {device.name}
                    </h1>
                    <StatusDot status={device.connectionStatus} />
                    <Badge tone="neutral">{formatOs(device.os)}</Badge>
                    {system?.architecture ? (
                      <Badge tone="info">{system.architecture}</Badge>
                    ) : null}
                  </div>
                  <p className="mt-2 text-sm text-[var(--muted)]">
                    Last seen {formatRelativeTime(device.lastSeenAt)}
                    {system?.hostname ? ` · ${system.hostname}` : ""}
                  </p>
                  <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-[var(--muted)]">
                    <span>Device ID</span>
                    <CopyValue value={device.id} label="Device ID" />
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Link href={`/chat/?deviceId=${device.id}`}>
                    <Button size="sm">Open Chat</Button>
                  </Link>
                  <Button
                    size="sm"
                    variant="outline"
                    loading={regenMutation.isPending}
                    onClick={() => setRegenOpen(true)}
                  >
                    <RefreshCw className="h-4 w-4" />
                    Regenerate key
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-[var(--danger)]"
                    onClick={() => setRevokeOpen(true)}
                  >
                    Revoke
                  </Button>
                </div>
              </div>
            </header>

            <div className="flex items-start gap-2 rounded-xl border border-[var(--border)] bg-[var(--panel-elevated)]/70 px-3 py-2.5 text-xs text-[var(--muted)]">
              <Shield className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[var(--accent-strong)]" />
              <p>
                Device information is collected from your connected PetAI agent
                to provide device management and remote-control functionality.
              </p>
            </div>

            {!online ? (
              <div className="rounded-xl border border-[var(--warning)]/35 bg-[var(--warning-soft)] px-3 py-2 text-sm">
                Device is offline. Showing last known telemetry
                {system?.updatedAt
                  ? ` (updated ${formatRelativeTime(system.updatedAt)})`
                  : ""}
                .
              </div>
            ) : null}

            <section>
              <h2 className="mb-3 font-display text-lg tracking-tight">Overview</h2>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                <StatCard
                  label="CPU"
                  value={
                    system?.cpu?.cores != null
                      ? `${system.cpu.cores} cores`
                      : "Unavailable"
                  }
                  detail={system?.cpu?.model || "CPU model unavailable"}
                />
                <StatCard
                  label="RAM"
                  value={formatBytes(system?.memory?.totalBytes)}
                  detail={
                    system?.memory?.availableBytes != null
                      ? `${formatBytes(system.memory.availableBytes)} available`
                      : "Usage unavailable"
                  }
                />
                <StatCard
                  label="Storage"
                  value={
                    primaryStorage?.availableBytes != null
                      ? formatBytes(primaryStorage.availableBytes)
                      : "Unavailable"
                  }
                  detail={
                    primaryStorage
                      ? `${primaryStorage.name ?? "Volume"} · ${formatBytes(primaryStorage.totalBytes)} total`
                      : "Storage information unavailable"
                  }
                />
                <StatCard
                  label="OS"
                  value={formatOs(device.os)}
                  detail={
                    system?.platformVersion
                      ? `Version ${system.platformVersion}`
                      : "Version unavailable"
                  }
                />
                <StatCard
                  label="Agent"
                  value={system?.agentVersion || "Unavailable"}
                  detail={system?.username ? `User ${system.username}` : undefined}
                />
                <StatCard
                  label="Uptime"
                  value={formatUptime(system?.uptimeSeconds)}
                  detail={
                    <span className="inline-flex items-center gap-1">
                      <Cpu className="h-3 w-3" />
                      System snapshot
                    </span>
                  }
                />
              </div>
            </section>

            <div className="grid gap-4 lg:grid-cols-2">
              {networkAllowed ? (
              <InfoSection title="Network">
                <dl className="grid gap-3 sm:grid-cols-2">
                  <MetaField
                    label="Public IP"
                    value={<CopyValue value={network?.publicIp} label="Public IP" />}
                    hint="Determined server-side from the authenticated connection"
                  />
                  <MetaField
                    label="Local IP"
                    value={<CopyValue value={network?.localIp} label="Local IP" />}
                  />
                  <MetaField
                    label="IPv6"
                    value={<CopyValue value={network?.ipv6} label="IPv6" />}
                  />
                  <MetaField
                    label="Interface"
                    value={network?.interfaceName || "Unavailable"}
                  />
                  <MetaField
                    label="Connection type"
                    value={network?.connectionType || "Unavailable"}
                  />
                  <MetaField
                    label="Latency"
                    value={formatLatency(network?.latencyMs)}
                  />
                  <MetaField
                    label="Quality"
                    value={network?.connectionQuality || "Unavailable"}
                  />
                  <MetaField
                    label="ISP"
                    value={location?.isp || "Unavailable"}
                  />
                  <MetaField
                    label="ASN"
                    value={location?.asn || "Unavailable"}
                  />
                  <MetaField
                    label="Last network update"
                    value={
                      network?.updatedAt
                        ? formatTimestamp(network.updatedAt)
                        : "Unavailable"
                    }
                  />
                </dl>
                {!network ? (
                  <div className="mt-3">
                    <EmptyHint>Network information unavailable</EmptyHint>
                  </div>
                ) : null}
              </InfoSection>
              ) : (
                <FeatureGate
                  feature="networkInformation"
                  description="Unlock network telemetry for connected devices."
                />
              )}

              <InfoSection title="Connection">
                <dl className="grid gap-3 sm:grid-cols-2">
                  <MetaField
                    label="Connected since"
                    value={
                      connection?.connectedSince
                        ? formatTimestamp(connection.connectedSince)
                        : online
                          ? "Session active"
                          : "Not connected"
                    }
                  />
                  <MetaField
                    label="Last heartbeat"
                    value={formatTimestamp(device.lastSeenAt)}
                  />
                  <MetaField
                    label="Connection latency"
                    value={formatLatency(network?.latencyMs)}
                  />
                  <MetaField
                    label="Socket status"
                    value={
                      connection?.socketActive
                        ? "Active"
                        : online
                          ? "Online"
                          : "Disconnected"
                    }
                  />
                  <MetaField
                    label="First connected"
                    value={formatTimestamp(
                      device.firstConnectedAt ?? device.createdAt,
                    )}
                  />
                  <MetaField
                    label="Session IP"
                    value={
                      <CopyValue
                        value={connection?.sessionIp}
                        label="Session IP"
                      />
                    }
                  />
                </dl>
              </InfoSection>
            </div>

            {locationAllowed ? (
              <DeviceLocationMap location={location} />
            ) : (
              <FeatureGate
                feature="locationInformation"
                description="Unlock approximate location derived from the device connection IP."
              />
            )}

            <div className="grid gap-4 lg:grid-cols-2">
              <InfoSection title="Displays">
                {!system?.displays?.length ? (
                  <EmptyHint>Display information unavailable</EmptyHint>
                ) : (
                  <div className="space-y-3">
                    <dl className="grid gap-3 sm:grid-cols-3">
                      <MetaField
                        label="Display count"
                        value={String(system.displays.length)}
                      />
                      <MetaField
                        label="Primary resolution"
                        value={
                          primaryDisplay?.width && primaryDisplay?.height
                            ? `${primaryDisplay.width}×${primaryDisplay.height}`
                            : "Unavailable"
                        }
                      />
                      <MetaField
                        label="Scale"
                        value={
                          primaryDisplay?.scaleFactor != null
                            ? `${primaryDisplay.scaleFactor}×`
                            : "Unavailable"
                        }
                      />
                    </dl>
                    <ul className="space-y-2">
                      {system.displays.map((display, index) => (
                        <li
                          key={`${display.width}x${display.height}-${index}`}
                          className="flex items-center gap-3 rounded-xl border border-[var(--border)] bg-[var(--panel-elevated)]/60 px-3 py-2 text-sm"
                        >
                          <Monitor className="h-4 w-4 text-[var(--accent-strong)]" />
                          <span>
                            {display.width && display.height
                              ? `${display.width}×${display.height}`
                              : "Unknown resolution"}
                            {display.scaleFactor
                              ? ` @ ${display.scaleFactor}×`
                              : ""}
                            {display.primary ? " · Primary" : ""}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </InfoSection>

              <InfoSection title="Hardware">
                <dl className="grid gap-3 sm:grid-cols-2">
                  <MetaField
                    label="Hostname"
                    value={system?.hostname || "Unavailable"}
                  />
                  <MetaField
                    label="Username"
                    value={system?.username || "Unavailable"}
                  />
                  <MetaField
                    label="CPU"
                    value={system?.cpu?.model || "Unavailable"}
                  />
                  <MetaField
                    label="GPU"
                    value={
                      system?.gpu?.name ||
                      "GPU information unavailable"
                    }
                  />
                </dl>
                {system?.storage?.length ? (
                  <ul className="mt-4 space-y-2">
                    {system.storage.map((vol) => (
                      <li
                        key={vol.name ?? `${vol.totalBytes}`}
                        className="flex items-start gap-3 rounded-xl border border-[var(--border)] bg-[var(--panel-elevated)]/60 px-3 py-2 text-sm"
                      >
                        <HardDrive className="mt-0.5 h-4 w-4 text-[var(--accent-strong)]" />
                        <div>
                          <p className="font-medium">{vol.name || "Volume"}</p>
                          <p className="text-xs text-[var(--muted)]">
                            {formatBytes(vol.availableBytes)} free of{" "}
                            {formatBytes(vol.totalBytes)}
                          </p>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="mt-3">
                    <EmptyHint>Storage information unavailable</EmptyHint>
                  </div>
                )}
                <p className="mt-3 inline-flex items-center gap-1.5 text-xs text-[var(--muted)]">
                  <MemoryStick className="h-3.5 w-3.5" />
                  Memory / storage snapshots update when the agent reports
                  telemetry.
                </p>
              </InfoSection>
            </div>

            <p className="inline-flex items-start gap-2 text-xs text-[var(--muted)]">
              <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              Partial telemetry is normal — unavailable fields never block device
              management.
            </p>
          </>
        )}
      </div>

      <ConfirmDialog
        open={revokeOpen}
        title="Revoke device?"
        message="The agent key will stop working immediately. You can add the device again later."
        confirmLabel="Revoke"
        busy={revokeMutation.isPending}
        onCancel={() => setRevokeOpen(false)}
        onConfirm={() => revokeMutation.mutate()}
      />
      <ConfirmDialog
        open={regenOpen}
        title="Regenerate agent key?"
        message="The current key stops working. Paste the new key into the desktop agent."
        confirmLabel="Regenerate"
        busy={regenMutation.isPending}
        onCancel={() => setRegenOpen(false)}
        onConfirm={() => regenMutation.mutate()}
      />
    </AppShell>
  );
}

export default function DeviceDetailPage() {
  return (
    <Suspense
      fallback={
        <AppShell>
          <div className="flex items-center gap-2 text-[var(--muted)]">
            <Spinner /> Loading device…
          </div>
        </AppShell>
      }
    >
      <DeviceDetailInner />
    </Suspense>
  );
}
