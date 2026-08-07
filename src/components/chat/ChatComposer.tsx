"use client";

import { useState } from "react";
import { Camera, Send, StopCircle, Bell, Bot } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { VoiceRecorderButton } from "@/components/voice/VoiceRecorder";

export function ChatComposer({
  disabled,
  canCancel,
  aiEnabled,
  onAiEnabledChange,
  onSend,
  onCancel,
  onScreenshot,
  screenshotBusy,
}: {
  disabled?: boolean;
  canCancel?: boolean;
  aiEnabled: boolean;
  onAiEnabledChange: (value: boolean) => void;
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
      className="shrink-0 border-t border-[var(--border)] bg-[var(--panel)]/90 p-3 backdrop-blur"
    >
      <div className="flex flex-wrap items-center gap-2 pb-2">
        <label className="inline-flex items-center gap-2 rounded-xl border border-[var(--border)] bg-white px-3 py-1.5 text-xs font-medium">
          <Bot className="h-3.5 w-3.5" />
          <input
            type="checkbox"
            checked={aiEnabled}
            onChange={(e) => onAiEnabledChange(e.target.checked)}
          />
          AI actions
        </label>
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
          placeholder={
            aiEnabled
              ? "Tell the AI what to do… e.g. Open Chrome"
              : "Send a notification to the desktop… (AI off)"
          }
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
          {aiEnabled ? <Send className="h-4 w-4" /> : <Bell className="h-4 w-4" />}
          {aiEnabled ? "Send" : "Notify"}
        </Button>
      </div>
      <p className="mt-2 text-xs text-[var(--muted)]">
        {aiEnabled
          ? "AI on: messages create tasks and can execute actions on the device."
          : "AI off: messages are delivered as desktop notifications only. Screenshots still work."}
      </p>
    </form>
  );
}
