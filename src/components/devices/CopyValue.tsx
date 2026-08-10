"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { useToast } from "@/components/ui/Toast";

export function CopyValue({
  value,
  label,
  className,
}: {
  value: string | null | undefined;
  label?: string;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();
  const display = value?.trim() ? value : null;

  async function copy() {
    if (!display) return;
    await navigator.clipboard.writeText(display);
    setCopied(true);
    toast(label ? `${label} copied` : "Copied", "success");
    setTimeout(() => setCopied(false), 1200);
  }

  if (!display) {
    return <span className="text-[var(--muted)]">Unavailable</span>;
  }

  return (
    <button
      type="button"
      onClick={() => void copy()}
      title={label ? `Copy ${label}` : "Copy"}
      className={cn(
        "group inline-flex max-w-full items-center gap-1.5 rounded-lg px-1 py-0.5 text-left font-[family-name:var(--font-mono)] text-sm hover:bg-[var(--accent-soft)]/40",
        className,
      )}
    >
      <span className="truncate">{display}</span>
      {copied ? (
        <Check className="h-3.5 w-3.5 shrink-0 text-[var(--success)]" />
      ) : (
        <Copy className="h-3.5 w-3.5 shrink-0 opacity-50 group-hover:opacity-100" />
      )}
    </button>
  );
}
