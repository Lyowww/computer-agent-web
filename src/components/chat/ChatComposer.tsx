"use client";

import { useState } from "react";
import {
  Camera,
  Send,
  StopCircle,
  Bell,
  Bot,
  Lock,
  Unlock,
  Video,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Sheet } from "@/components/ui/Sheet";
import { VoiceRecorderButton } from "@/components/voice/VoiceRecorder";
import { cn } from "@/lib/utils/cn";

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
  const [toolsOpen, setToolsOpen] = useState(false);

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

  const toolButtons = (
    <>
      <Button
        type="button"
        size="sm"
        variant="outline"
        disabled={disabled || mediaBusy}
        loading={screenshotBusy}
        onClick={() => {
          onScreenshot?.();
          setToolsOpen(false);
        }}
        className="justify-start"
      >
        <Camera className="h-4 w-4" />
        Screen capture
      </Button>
      <Button
        type="button"
        size="sm"
        variant="outline"
        disabled={disabled || mediaBusy}
        loading={cameraBusy}
        onClick={() => {
          onCamera?.();
          setToolsOpen(false);
        }}
        className="justify-start"
      >
        <Video className="h-4 w-4" />
        Front camera
      </Button>
      <Button
        type="button"
        size="sm"
        variant="outline"
        disabled={disabled || mediaBusy}
        onClick={() => {
          onLock?.();
          setToolsOpen(false);
        }}
        className="justify-start"
      >
        <Lock className={cn("h-4 w-4", lockBusy === "lock" && "animate-pulse")} />
        Lock screen
      </Button>
      <Button
        type="button"
        size="sm"
        variant="outline"
        disabled={disabled || mediaBusy}
        onClick={() => {
          onUnlock?.();
          setToolsOpen(false);
        }}
        className="justify-start"
      >
        <Unlock className={cn("h-4 w-4", lockBusy === "unlock" && "animate-pulse")} />
        Unlock screen
      </Button>
    </>
  );

  return (
    <>
      <form
        onSubmit={(e) => void submit(e)}
        className="shrink-0 border-t border-[var(--border)] bg-[var(--panel)]/95 p-2.5 backdrop-blur sm:p-3"
      >
        <div className="mb-2 flex flex-wrap items-center gap-1.5 sm:gap-2">
          <label
            className={cn(
              "inline-flex min-h-[36px] items-center gap-1.5 rounded-xl border px-2.5 py-1.5 text-[11px] font-medium sm:gap-2 sm:px-3 sm:text-xs",
              aiEnabled
                ? "border-[color-mix(in_srgb,var(--accent)_40%,transparent)] bg-[var(--accent-soft)] text-[var(--accent)]"
                : "border-[var(--border)] bg-[var(--panel-elevated)]",
            )}
          >
            <Bot className="h-3.5 w-3.5" />
            <input
              type="checkbox"
              checked={aiEnabled}
              onChange={(e) => onAiEnabledChange(e.target.checked)}
              className="accent-[var(--accent)]"
            />
            AI
          </label>
          <VoiceRecorderButton
            disabled={disabled || sending}
            onTranscript={(text) => setValue((prev) => (prev ? `${prev} ${text}` : text))}
          />

          {/* Desktop / tablet: inline tools */}
          <div className="hidden items-center gap-1.5 sm:flex">
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={disabled || mediaBusy}
              loading={screenshotBusy}
              onClick={onScreenshot}
              aria-label="Screenshot"
            >
              <Camera className="h-4 w-4" />
              Screen
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={disabled || mediaBusy}
              loading={cameraBusy}
              onClick={onCamera}
              aria-label="Front camera"
            >
              <Video className="h-4 w-4" />
              Camera
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={disabled || mediaBusy}
              onClick={onLock}
              aria-label="Lock screen"
            >
              <Lock className={cn("h-4 w-4", lockBusy === "lock" && "animate-pulse")} />
              Lock
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={disabled || mediaBusy}
              onClick={onUnlock}
              aria-label="Unlock screen"
            >
              <Unlock className={cn("h-4 w-4", lockBusy === "unlock" && "animate-pulse")} />
              Unlock
            </Button>
          </div>

          {/* Mobile: + tools sheet */}
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="sm:hidden"
            onClick={() => setToolsOpen(true)}
            aria-label="More tools"
          >
            <Plus className="h-4 w-4" />
            Tools
          </Button>

          {canCancel ? (
            <Button type="button" size="sm" variant="danger" onClick={onCancel}>
              <StopCircle className="h-4 w-4" />
              <span className="hidden sm:inline">Cancel</span>
            </Button>
          ) : null}
        </div>

        <div className="flex items-end gap-2 rounded-2xl border border-[var(--border)] bg-[var(--panel-elevated)]/80 p-1.5 shadow-[0_0_0_1px_rgba(6,182,212,0.08)] focus-within:border-[var(--accent)] focus-within:shadow-[0_0_0_3px_var(--accent-soft)]">
          <textarea
            value={value}
            onChange={(e) => setValue(e.target.value)}
            rows={2}
            placeholder={aiEnabled ? "Tell the AI what to do…" : "Notify the desktop…"}
            disabled={disabled || sending}
            className="min-h-[48px] flex-1 resize-none rounded-xl bg-transparent px-3 py-2.5 text-base outline-none sm:min-h-[52px] sm:text-sm"
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
            loading={sending}
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
            : "AI off: messages are delivered as desktop notifications only."}
        </p>
      </form>

      <Sheet open={toolsOpen} onClose={() => setToolsOpen(false)} title="Quick actions">
        <div className="grid gap-2">{toolButtons}</div>
      </Sheet>
    </>
  );
}
