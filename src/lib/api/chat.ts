import { apiFetch } from "@/lib/api/client";
import type { ChatMessage } from "@/lib/types";

export function getChatHistory(params?: {
  taskId?: string;
  limit?: number;
}): Promise<ChatMessage[]> {
  const search = new URLSearchParams();
  if (params?.taskId) search.set("taskId", params.taskId);
  if (params?.limit) search.set("limit", String(params.limit));
  const qs = search.toString();
  return apiFetch<ChatMessage[]>(`/chat/history${qs ? `?${qs}` : ""}`);
}
