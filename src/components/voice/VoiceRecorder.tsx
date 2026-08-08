"use client";

import { useEffect, useRef, useState } from "react";
import { Mic, Square } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { MicrophoneRecorder } from "@/lib/voice/recorder";
import { transcribeAudio } from "@/lib/api/voice";
import { cn } from "@/lib/utils/cn";

export function VoiceRecorderButton({
  onTranscript,
  disabled,
}: {
  onTranscript: (text: string) => void;
  disabled?: boolean;
}) {
  const recorderRef = useRef<MicrophoneRecorder | null>(null);
  const [recording, setRecording] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    recorderRef.current = new MicrophoneRecorder();
    return () => recorderRef.current?.cancel();
  }, []);

  async function toggle() {
    setError(null);
    const recorder = recorderRef.current;
    if (!recorder) return;

    if (!recording) {
      try {
        await recorder.start();
        setRecording(true);
      } catch {
        setError("Microphone permission denied or unavailable.");
      }
      return;
    }

    try {
      setBusy(true);
      setRecording(false);
      const blob = await recorder.stop();
      const { text } = await transcribeAudio(blob);
      if (text?.trim()) onTranscript(text.trim());
      else setError("No speech detected.");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Voice transcription failed. Ensure backend STT is available.",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="relative">
      <Button
        type="button"
        variant={recording ? "danger" : "outline"}
        size="sm"
        disabled={disabled || busy}
        onClick={() => void toggle()}
        aria-pressed={recording}
        className={cn(recording && "animate-pulse")}
      >
        {recording ? <Square className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
        {busy ? "Transcribing…" : recording ? "Stop" : "Voice"}
      </Button>
      {error ? (
        <p className="absolute left-0 top-full z-10 mt-1 w-56 rounded-lg border border-[color-mix(in_srgb,var(--danger)_35%,transparent)] bg-[var(--danger-soft)] px-2 py-1 text-xs text-[var(--danger)]">
          {error}
        </p>
      ) : null}
    </div>
  );
}
