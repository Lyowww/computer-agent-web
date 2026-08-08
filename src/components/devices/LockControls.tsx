"use client";

import { Lock, Unlock } from "lucide-react";
import { Button } from "@/components/ui/Button";

export function LockControls({
  disabled,
  busy,
  onLock,
  onUnlock,
  className,
}: {
  disabled?: boolean;
  busy?: "lock" | "unlock" | string | null;
  onLock: () => void;
  onUnlock: () => void;
  className?: string;
}) {
  return (
    <div className={className ?? "grid grid-cols-2 gap-2"}>
      <Button
        type="button"
        size="sm"
        variant="outline"
        className="w-full justify-center"
        disabled={disabled || !!busy}
        onClick={onLock}
      >
        <Lock className={`h-3.5 w-3.5 ${busy === "lock" ? "animate-pulse" : ""}`} />
        Lock
      </Button>
      <Button
        type="button"
        size="sm"
        variant="outline"
        className="w-full justify-center"
        disabled={disabled || !!busy}
        onClick={onUnlock}
      >
        <Unlock className={`h-3.5 w-3.5 ${busy === "unlock" ? "animate-pulse" : ""}`} />
        Unlock
      </Button>
    </div>
  );
}
