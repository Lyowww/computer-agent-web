export type RecorderState = "idle" | "recording" | "stopping";

export class MicrophoneRecorder {
  private mediaRecorder: MediaRecorder | null = null;
  private stream: MediaStream | null = null;
  private chunks: BlobPart[] = [];
  private state: RecorderState = "idle";

  get recording(): boolean {
    return this.state === "recording";
  }

  async start(): Promise<void> {
    if (this.state === "recording") return;

    this.stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
      },
    });

    const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
      ? "audio/webm;codecs=opus"
      : MediaRecorder.isTypeSupported("audio/webm")
        ? "audio/webm"
        : undefined;

    this.chunks = [];
    this.mediaRecorder = new MediaRecorder(
      this.stream,
      mimeType ? { mimeType } : undefined,
    );

    this.mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) this.chunks.push(event.data);
    };

    this.mediaRecorder.start(250);
    this.state = "recording";
  }

  async stop(): Promise<Blob> {
    if (!this.mediaRecorder || this.state !== "recording") {
      throw new Error("Recorder is not active");
    }

    this.state = "stopping";

    const blob = await new Promise<Blob>((resolve, reject) => {
      const recorder = this.mediaRecorder!;
      recorder.onerror = () => reject(new Error("Recording failed"));
      recorder.onstop = () => {
        resolve(
          new Blob(this.chunks, {
            type: recorder.mimeType || "audio/webm",
          }),
        );
      };
      recorder.stop();
    });

    this.cleanup();
    return blob;
  }

  cancel(): void {
    if (this.mediaRecorder && this.state === "recording") {
      try {
        this.mediaRecorder.stop();
      } catch {
        // ignore
      }
    }
    this.cleanup();
  }

  private cleanup(): void {
    this.mediaRecorder = null;
    this.chunks = [];
    this.state = "idle";
    if (this.stream) {
      for (const track of this.stream.getTracks()) track.stop();
      this.stream = null;
    }
  }
}

export async function playAudioBlob(blob: Blob): Promise<void> {
  const url = URL.createObjectURL(blob);
  try {
    const audio = new Audio(url);
    await audio.play();
    await new Promise<void>((resolve, reject) => {
      audio.onended = () => resolve();
      audio.onerror = () => reject(new Error("Audio playback failed"));
    });
  } finally {
    URL.revokeObjectURL(url);
  }
}
