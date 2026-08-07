import { apiFetch, getApiBaseUrl } from "@/lib/api/client";
import { getAccessToken } from "@/lib/auth/token";

/**
 * Voice endpoints are backend-owned. No AI/API keys live in the frontend.
 * Expected backend routes:
 *   POST /api/voice/stt  (multipart: audio)
 *   POST /api/voice/tts  (json: { text })
 */
export async function transcribeAudio(blob: Blob): Promise<{ text: string }> {
  const form = new FormData();
  form.append("audio", blob, `recording-${Date.now()}.webm`);
  return apiFetch<{ text: string }>("/voice/stt", {
    method: "POST",
    body: form,
  });
}

export async function synthesizeSpeech(text: string): Promise<Blob> {
  const token = getAccessToken();
  const response = await fetch(`${getApiBaseUrl()}/voice/tts`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ text }),
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || "TTS request failed");
  }

  return response.blob();
}
