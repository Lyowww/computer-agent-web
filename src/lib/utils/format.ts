import { formatDistanceToNow, format } from "date-fns";
import type { ConnectionStatus, DeviceOs, TaskStatus, UiPhase } from "@/lib/types";

export function formatOs(os: DeviceOs | string): string {
  switch (os) {
    case "darwin":
      return "macOS";
    case "win32":
      return "Windows";
    case "linux":
      return "Linux";
    default:
      return os;
  }
}

export function formatRelativeTime(value: string | null | undefined): string {
  if (!value) return "Never";
  try {
    return formatDistanceToNow(new Date(value), { addSuffix: true });
  } catch {
    return "Unknown";
  }
}

export function formatTimestamp(value: string | null | undefined): string {
  if (!value) return "—";
  try {
    return format(new Date(value), "MMM d, yyyy HH:mm:ss");
  } catch {
    return value;
  }
}

export function isOnline(status: ConnectionStatus | string): boolean {
  return status === "ONLINE";
}

export function taskStatusToPhase(status: TaskStatus | string): UiPhase {
  switch (status) {
    case "CREATED":
    case "RUNNING":
      return "thinking";
    case "WAITING_FOR_SCREEN":
      return "waiting_for_screenshot";
    case "WAITING_FOR_ACTION":
      return "executing";
    case "WAITING_FOR_USER":
      return "waiting_for_user";
    case "COMPLETED":
      return "completed";
    case "FAILED":
    case "CANCELLED":
      return "failed";
    default:
      return "idle";
  }
}

export function phaseLabel(phase: UiPhase): string {
  switch (phase) {
    case "thinking":
      return "Thinking";
    case "waiting_for_screenshot":
      return "Waiting for screenshot";
    case "executing":
      return "Executing action";
    case "verifying":
      return "Verifying";
    case "waiting_for_user":
      return "Waiting for user";
    case "completed":
      return "Completed";
    case "failed":
      return "Failed";
    default:
      return "Idle";
  }
}

export function connectionLabel(status: ConnectionStatus | string): string {
  switch (status) {
    case "ONLINE":
      return "Online";
    case "OFFLINE":
      return "Offline";
    case "REVOKED":
      return "Revoked";
    default:
      return String(status);
  }
}

export function createRequestId(prefix = "req"): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `${prefix}_${crypto.randomUUID()}`;
  }
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}
