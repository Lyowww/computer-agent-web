"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createDevice } from "@/lib/api/devices";
import { createDeviceSchema } from "@/lib/validators/schemas";
import type { DeviceOs } from "@/lib/types";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { ErrorBanner } from "@/components/ui/ErrorBanner";
import { Sheet } from "@/components/ui/Sheet";
import { useToast } from "@/components/ui/Toast";
import { ApiError } from "@/lib/api/client";

export function CreateDeviceModal({
  open,
  onClose,
  onCreated,
}: {
  open: boolean;
  onClose: () => void;
  onCreated?: () => void;
}) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [os, setOs] = useState<DeviceOs>("darwin");
  const [tokenOnce, setTokenOnce] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: createDevice,
    onSuccess: (data) => {
      setTokenOnce(data.deviceToken);
      toast("Device created", "success");
      void queryClient.invalidateQueries({ queryKey: ["devices"] });
      onCreated?.();
    },
    onError: (err: Error) => {
      if (err instanceof ApiError && err.code === "DEVICE_LIMIT_REACHED") {
        setError(err.message);
        return;
      }
      setError(err.message);
    },
  });

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const parsed = createDeviceSchema.safeParse({ name, os });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message || "Invalid input");
      return;
    }
    mutation.mutate(parsed.data);
  }

  function close() {
    setName("");
    setOs("darwin");
    setTokenOnce(null);
    setError(null);
    onClose();
  }

  return (
    <Sheet open={open} onClose={close} title="Register device">
      <p className="mb-4 text-sm text-[var(--muted)]">
        Creates a device record and a device token for the desktop agent. The
        token stays available under Show Agent Key.
      </p>

      {tokenOnce ? (
        <div className="space-y-3">
          <p className="rounded-xl border border-[color-mix(in_srgb,var(--success)_35%,transparent)] bg-[var(--success-soft)] px-3 py-2 text-sm text-[var(--success)]">
            Token saved. You can always copy it again from the Devices page.
          </p>
          <pre className="overflow-x-auto rounded-xl bg-[var(--bg-elevated)] p-3 font-[family-name:var(--font-mono)] text-xs text-[var(--accent-strong)]">
            {tokenOnce}
          </pre>
          <Button onClick={close} className="w-full">
            Done
          </Button>
        </div>
      ) : (
        <form onSubmit={submit} className="space-y-4">
          {error ? <ErrorBanner message={error} onDismiss={() => setError(null)} /> : null}
          <Input
            label="Device name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="My MacBook Pro"
            required
          />
          <Select
            label="Operating system"
            value={os}
            onChange={(next) => setOs(next as DeviceOs)}
            options={[
              { value: "darwin", label: "macOS" },
              { value: "win32", label: "Windows" },
              { value: "linux", label: "Linux" },
            ]}
          />
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button type="button" variant="outline" onClick={close}>
              Cancel
            </Button>
            <Button type="submit" loading={mutation.isPending}>
              {mutation.isPending ? "Creating…" : "Create device"}
            </Button>
          </div>
        </form>
      )}
    </Sheet>
  );
}
