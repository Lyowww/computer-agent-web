"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createDevice } from "@/lib/api/devices";
import { createDeviceSchema } from "@/lib/validators/schemas";
import type { DeviceOs } from "@/lib/types";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { ErrorBanner } from "@/components/ui/ErrorBanner";

export function CreateDeviceModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const queryClient = useQueryClient();
  const [name, setName] = useState("");
  const [os, setOs] = useState<DeviceOs>("darwin");
  const [tokenOnce, setTokenOnce] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: createDevice,
    onSuccess: (data) => {
      setTokenOnce(data.deviceToken);
      void queryClient.invalidateQueries({ queryKey: ["devices"] });
    },
    onError: (err: Error) => setError(err.message),
  });

  if (!open) return null;

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
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/45 p-4 sm:items-center">
      <div className="w-full max-w-lg rounded-2xl border border-[var(--border)] bg-white p-5 shadow-xl">
        <h2 className="text-lg font-semibold">Register device</h2>
        <p className="mt-1 text-sm text-[var(--muted)]">
          Creates a device record and a one-time device token for the desktop agent.
        </p>

        {tokenOnce ? (
          <div className="mt-4 space-y-3">
            <ErrorBanner message="Copy this device token now. It will not be shown again." />
            <pre className="overflow-x-auto rounded-xl bg-slate-950 p-3 text-xs text-emerald-300">
              {tokenOnce}
            </pre>
            <Button onClick={close}>Done</Button>
          </div>
        ) : (
          <form onSubmit={submit} className="mt-4 space-y-4">
            {error ? <ErrorBanner message={error} onDismiss={() => setError(null)} /> : null}
            <Input
              label="Device name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="My MacBook Pro"
              required
            />
            <label className="block space-y-1.5">
              <span className="text-sm font-medium">Operating system</span>
              <select
                value={os}
                onChange={(e) => setOs(e.target.value as DeviceOs)}
                className="w-full rounded-xl border border-[var(--border)] bg-white px-3 py-2.5 text-sm"
              >
                <option value="darwin">macOS</option>
                <option value="win32">Windows</option>
                <option value="linux">Linux</option>
              </select>
            </label>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={close}>
                Cancel
              </Button>
              <Button type="submit" disabled={mutation.isPending}>
                {mutation.isPending ? "Creating…" : "Create device"}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
