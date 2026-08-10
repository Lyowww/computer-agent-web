"use client";

import { FormEvent, useState } from "react";
import { CheckCircle2, Sparkles } from "lucide-react";
import { Sheet } from "@/components/ui/Sheet";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { joinWaitlist, waitlistErrorMessage } from "@/lib/api/waitlist";

function WaitlistForm({ onClose }: { onClose: () => void }) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [success, setSuccess] = useState(false);
  const [alreadyJoined, setAlreadyJoined] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    const trimmed = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setError("Enter a valid email address.");
      return;
    }
    setBusy(true);
    try {
      const result = await joinWaitlist(trimmed, "landing");
      setAlreadyJoined(result.alreadyJoined);
      setSuccess(true);
    } catch (err) {
      setError(waitlistErrorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  if (success) {
    return (
      <div className="space-y-4 py-2 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--success-soft)] text-[var(--success)]">
          <CheckCircle2 className="h-7 w-7" />
        </div>
        <div>
          <p className="font-display text-xl tracking-tight">
            {alreadyJoined
              ? "You're already on the list!"
              : "You're on the list!"}
          </p>
          <p className="mt-2 text-sm text-[var(--muted)]">
            {alreadyJoined
              ? "We already have your email. We'll notify you when slots open."
              : "We'll notify you when slots open."}
          </p>
        </div>
        <Button variant="outline" className="w-full" onClick={onClose}>
          Close
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={(e) => void onSubmit(e)} className="space-y-4">
      <div className="flex items-start gap-3 rounded-xl border border-[var(--border)] bg-[var(--accent-soft)] p-3">
        <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-[var(--accent)]" />
        <p className="text-sm text-[var(--muted)]">
          Public registration is coming soon. Leave your email and we&apos;ll
          invite you as capacity opens.
        </p>
      </div>
      <Input
        label="Email"
        type="email"
        autoComplete="email"
        placeholder="you@company.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        error={error ?? undefined}
        required
      />
      <Button type="submit" className="w-full" loading={busy}>
        {busy ? "Joining…" : "Get Early Access"}
      </Button>
    </form>
  );
}

export function WaitlistModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  return (
    <Sheet open={open} onClose={onClose} title="Join the waitlist">
      {open ? <WaitlistForm key={String(open)} onClose={onClose} /> : null}
    </Sheet>
  );
}
