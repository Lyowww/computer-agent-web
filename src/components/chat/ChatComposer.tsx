"use client";

import { useState } from "react";
import { Camera, Send, StopCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { VoiceRecorderButton } from "@/components/voice/VoiceRecorder";

export function ChatComposer({
  disabled,
  canCancel,
  onSend,
  onCancel,
  onScreenshot,
  screenshotBusy,
}: {
  disabled?: boolean;
  canCancel?: boolean;
  onSend: (text: string) => Promise<void> | void;
  onCancel?: () => void;
  onScreenshot?: () => void;
  screenshotBusy?: boolean;
}) {
  const [value, setValue] = useState("");
  const [sending, setSending] = useState(false);

  async function submit(e?: React.FormEvent) {
    e?.preventDefault();
    const text = value.trim();
    if (!text || sending || disabled) return;
    setSending(true);
    try {
      await onSend(text);
      setValue("");
    } finally {
      setSending(false);
    }
  }

  return (
    <form
      onSubmit={(e) => void submit(e)}
      className="border-t border-[var(--border)] bg-[var(--panel)]/90 p-3 backdrop-blur"
    >
      <div className="flex flex-wrap items-center gap-2 pb-2">
        <VoiceRecorderButton
          disabled={disabled || sending}
          onTranscript={(text) => setValue((prev) => (prev ? `${prev} ${text}` : text))}
        />
        <Button
          type="button"
          size="sm"
          variant="outline"
          disabled={disabled || screenshotBusy}
          onClick={onScreenshot}
        >
          <Camera className="h-4 w-4" />
          Screenshot
        </Button>
        {canCancel ? (
          <Button type="button" size="sm" variant="danger" onClick={onCancel}>
            <StopCircle className="h-4 w-4" />
            Cancel task
          </Button>
        ) : null}
      </div>
      <div className="flex items-end gap-2">
        <textarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          rows={2}
          placeholder="Tell the AI what to do… e.g. Open Chrome"
          disabled={disabled || sending}
          className="min-h-[52px] flex-1 resize-none rounded-xl border border-[var(--border)] bg-white px-3 py-2.5 text-sm outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/20"
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              void submit();
            }
          }}
        />
        <Button type="submit" disabled={disabled || sending || !value.trim()} className="h-[52px]">
          <Send className="h-4 w-4" />
          Send
        </Button>
      </div>
    </form>
  );
}
