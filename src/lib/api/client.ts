import type { ApiErrorBody } from "@/lib/types";
import { clearAccessToken, getAccessToken } from "@/lib/auth/token";

export class ApiError extends Error {
  readonly status: number;
  readonly code: string;
  readonly details?: unknown;
  readonly feature?: string;
  readonly requiredPlan?: string;

  constructor(
    status: number,
    code: string,
    message: string,
    details?: unknown,
    extra?: { feature?: string; requiredPlan?: string },
  ) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.details = details;
    this.feature = extra?.feature;
    this.requiredPlan = extra?.requiredPlan;
  }
}

function apiBaseUrl(): string {
  return (
    process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ||
    "http://localhost:3000/api"
  );
}

function messageFromBody(body: ApiErrorBody | null, fallback: string): string {
  if (!body?.error?.message) return fallback;
  return Array.isArray(body.error.message)
    ? body.error.message.join(", ")
    : body.error.message;
}

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
  tokenOverride?: string | null,
): Promise<T> {
  const token = tokenOverride === undefined ? getAccessToken() : tokenOverride;
  const headers = new Headers(options.headers);

  if (!headers.has("Content-Type") && options.body && !(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${apiBaseUrl()}${path}`, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    clearAccessToken();
  }

  if (response.status === 204) {
    return undefined as T;
  }

  const text = await response.text();
  let data: unknown = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }
  }

  if (!response.ok) {
    const body = data as ApiErrorBody | null;
    const errObj = body?.error as
      | (ApiErrorBody["error"] & {
          feature?: string;
          requiredPlan?: string;
        })
      | undefined;
    throw new ApiError(
      response.status,
      errObj?.code ?? "HTTP_ERROR",
      messageFromBody(body, response.statusText || "Request failed"),
      errObj?.details,
      {
        feature: errObj?.feature,
        requiredPlan: errObj?.requiredPlan,
      },
    );
  }

  return data as T;
}

export function getApiBaseUrl(): string {
  return apiBaseUrl();
}
