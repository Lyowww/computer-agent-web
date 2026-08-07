import { apiFetch } from "@/lib/api/client";

export function getHealth(): Promise<{
  status: string;
  database?: string;
  redis?: string;
  timestamp: string;
}> {
  return apiFetch("/health", {}, null);
}
