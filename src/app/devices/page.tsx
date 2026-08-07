"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { DeviceCard } from "@/components/devices/DeviceCard";
import { CreateDeviceModal } from "@/components/devices/CreateDeviceModal";
import { Button } from "@/components/ui/Button";
import { ErrorBanner } from "@/components/ui/ErrorBanner";
import { Spinner } from "@/components/ui/Spinner";
import { listDevices, regenerateDeviceToken, revokeDevice } from "@/lib/api/devices";
import { listTasks } from "@/lib/api/tasks";
import { formatTimestamp } from "@/lib/utils/format";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";

export default function DevicesPage() {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [revokeId, setRevokeId] = useState<string | null>(null);
  const [regenId, setRegenId] = useState<string | null>(null);

  const devicesQuery = useQuery({ queryKey: ["devices"], queryFn: listDevices });
  const tasksQuery = useQuery({ queryKey: ["tasks"], queryFn: listTasks });

  const revokeMutation = useMutation({
    mutationFn: revokeDevice,
    onSuccess: () => {
      setRevokeId(null);
      void queryClient.invalidateQueries({ queryKey: ["devices"] });
    },
  });

  const regenMutation = useMutation({
    mutationFn: regenerateDeviceToken,
    onSuccess: () => {
      setRegenId(null);
      void queryClient.invalidateQueries({ queryKey: ["devices"] });
    },
  });

  const devices = (devicesQuery.data ?? []).map((device) => ({
    ...device,
    activeTask:
      tasksQuery.data?.find(
        (task) =>
          task.deviceId === device.id &&
          !["COMPLETED", "FAILED", "CANCELLED"].includes(task.status),
      ) ?? null,
  }));

  return (
    <AppShell>
      <div className="space-y-6">
        <header className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
          <div>
            <h1 className="font-[family-name:var(--font-display)] text-2xl tracking-tight sm:text-3xl">
              Devices
            </h1>
            <p className="mt-1 text-sm text-[var(--muted)]">
              Manage desktop agents linked to your account. Device tokens stay visible here.
            </p>
          </div>
          <Button onClick={() => setOpen(true)} className="w-full sm:w-auto">
            <Plus className="h-4 w-4" />
            Add device
          </Button>
        </header>

        {devicesQuery.isLoading ? (
          <div className="flex items-center gap-2 text-[var(--muted)]">
            <Spinner /> Loading…
          </div>
        ) : devicesQuery.isError ? (
          <ErrorBanner
            message={
              devicesQuery.error instanceof Error
                ? devicesQuery.error.message
                : "Failed to load devices"
            }
          />
        ) : (
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              {devices.map((device) => (
                <div key={device.id} className="space-y-2">
                  <DeviceCard
                    device={device}
                    onRegenerateToken={(id) => setRegenId(id)}
                    regenerateBusy={regenMutation.isPending && regenId === device.id}
                  />
                  <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-[var(--border)] bg-white/60 px-3 py-2 text-xs text-[var(--muted)]">
                    <span>Created {formatTimestamp(device.createdAt)}</span>
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() => setRevokeId(device.id)}
                      disabled={device.connectionStatus === "REVOKED"}
                    >
                      Revoke
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            {!devices.length ? (
              <div className="rounded-2xl border border-dashed border-[var(--border)] bg-white/60 p-8 text-center text-sm text-[var(--muted)]">
                No devices registered yet.
              </div>
            ) : null}
          </div>
        )}
      </div>

      <CreateDeviceModal open={open} onClose={() => setOpen(false)} />
      <ConfirmDialog
        open={!!revokeId}
        title="Revoke device?"
        message="This invalidates the desktop agent token. The agent will need a new registration."
        confirmLabel="Revoke"
        cancelLabel="Keep"
        busy={revokeMutation.isPending}
        onCancel={() => setRevokeId(null)}
        onConfirm={() => {
          if (revokeId) revokeMutation.mutate(revokeId);
        }}
      />
      <ConfirmDialog
        open={!!regenId}
        title="Regenerate device token?"
        message="The current token stops working. Paste the new token into the desktop agent Settings."
        confirmLabel="Regenerate"
        cancelLabel="Cancel"
        busy={regenMutation.isPending}
        onCancel={() => setRegenId(null)}
        onConfirm={() => {
          if (regenId) regenMutation.mutate(regenId);
        }}
      />
    </AppShell>
  );
}
