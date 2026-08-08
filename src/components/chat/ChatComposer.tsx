"use client";

import { useState } from "react";
import { Camera, Send, StopCircle, Bell, Bot, Lock, Unlock, Video } from "lucide-react";
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
  onCamera,
  cameraBusy,
  onLock,
  onUnlock,
  lockBusy,
}: {
  disabled?: boolean;
  canCancel?: boolean;
  aiEnabled: boolean;
  onAiEnabledChange: (value: boolean) => void;
  onSend: (text: string) => Promise<void> | void;
  onCancel?: () => void;
  onScreenshot?: () => void;
  screenshotBusy?: boolean;
  onCamera?: () => void;
  cameraBusy?: boolean;
  onLock?: () => void;
  onUnlock?: () => void;
  lockBusy?: "lock" | "unlock" | null;
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

  const mediaBusy = screenshotBusy || cameraBusy || !!lockBusy;

  return (
    <form
      onSubmit={(e) => void submit(e)}
      className="shrink-0 border-t border-[var(--border)] bg-[var(--panel)]/95 p-2.5 backdrop-blur sm:p-3"
    >
      <div className="flex flex-wrap items-center gap-1.5 pb-2 sm:gap-2">
        <label className="inline-flex items-center gap-1.5 rounded-xl border border-[var(--border)] bg-white px-2.5 py-1.5 text-[11px] font-medium sm:gap-2 sm:px-3 sm:text-xs">
          <Bot className="h-3.5 w-3.5" />
          <input
            type="checkbox"
            checked={aiEnabled}
            onChange={(e) => onAiEnabledChange(e.target.checked)}
          />
          AI
        </label>
        <VoiceRecorderButton
          disabled={disabled || sending}
          onTranscript={(text) => setValue((prev) => (prev ? `${prev} ${text}` : text))}
        />
        <Button
          type="button"
          size="sm"
          variant="outline"
          disabled={disabled || mediaBusy}
          onClick={onScreenshot}
          className="px-2.5 sm:px-3"
          aria-label="Screenshot"
        >
          <Camera className="h-4 w-4" />
          <span className="hidden sm:inline">Screen</span>
        </Button>
        <Button
          type="button"
          size="sm"
          variant="outline"
          disabled={disabled || mediaBusy}
          onClick={onCamera}
          className="px-2.5 sm:px-3"
          aria-label="Front camera"
        >
          <Video className={`h-4 w-4 ${cameraBusy ? "animate-pulse" : ""}`} />
          <span className="hidden sm:inline">Camera</span>
        </Button>
        <Button
          type="button"
          size="sm"
          variant="outline"
          disabled={disabled || mediaBusy}
          onClick={onLock}
          className="px-2.5 sm:px-3"
          aria-label="Lock screen"
        >
          <Lock className={`h-4 w-4 ${lockBusy === "lock" ? "animate-pulse" : ""}`} />
          <span className="hidden sm:inline">Lock</span>
        </Button>
        <Button
          type="button"
          size="sm"
          variant="outline"
          disabled={disabled || mediaBusy}
          onClick={onUnlock}
          className="px-2.5 sm:px-3"
          aria-label="Unlock screen"
        >
          <Unlock className={`h-4 w-4 ${lockBusy === "unlock" ? "animate-pulse" : ""}`} />
          <span className="hidden sm:inline">Unlock</span>
        </Button>
        {canCancel ? (
          <Button type="button" size="sm" variant="danger" onClick={onCancel}>
            <StopCircle className="h-4 w-4" />
            <span className="hidden sm:inline">Cancel</span>
          </Button>
        ) : null}
      </div>
      <div className="flex items-end gap-2">
        <textarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          rows={2}
          placeholder={aiEnabled ? "Tell the AI what to do…" : "Notify the desktop…"}
          disabled={disabled || sending}
          className="min-h-[48px] flex-1 resize-none rounded-xl border border-[var(--border)] bg-white px-3 py-2.5 text-base outline-none focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/20 sm:min-h-[52px] sm:text-sm"
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              void submit();
            }
          }}
        />
        <Button
          type="submit"
          disabled={disabled || sending || !value.trim()}
          className="h-12 w-12 shrink-0 px-0 sm:h-[52px] sm:w-auto sm:px-4"
          aria-label={aiEnabled ? "Send" : "Notify"}
        >
          {aiEnabled ? <Send className="h-4 w-4" /> : <Bell className="h-4 w-4" />}
          <span className="hidden sm:inline">{aiEnabled ? "Send" : "Notify"}</span>
        </Button>
      </div>
      <p className="mt-2 hidden text-xs text-[var(--muted)] sm:block">
        {aiEnabled
          ? "AI on: messages create tasks and can execute actions on the device."
          : "AI off: messages are delivered as desktop notifications only. Screen and camera still work."}
      </p>
    </form>
  );
}
