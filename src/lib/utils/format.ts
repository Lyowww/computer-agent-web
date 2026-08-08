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

function paramStr(params: Record<string, unknown>, key: string): string | null {
  const value = params[key];
  if (value === undefined || value === null || value === "") return null;
  return String(value);
}

/** Human-readable action chip label — never raw JSON dumps. */
export function formatActionChip(
  type: string,
  params: Record<string, unknown> = {},
): string {
  const t = type.toLowerCase().replace(/[-\s]/g, "_");
  const app = paramStr(params, "app") || paramStr(params, "name") || paramStr(params, "application");
  const x = paramStr(params, "x") ?? paramStr(params, "clientX");
  const y = paramStr(params, "y") ?? paramStr(params, "clientY");
  const text = paramStr(params, "text") || paramStr(params, "content") || paramStr(params, "keys");
  const path = paramStr(params, "path") || paramStr(params, "url");
  const pid = paramStr(params, "pid");

  if (t.includes("open_app") || t === "open" || t.includes("launch")) {
    return `Open App: ${app || "Unknown"}`;
  }
  if (t.includes("close_app") || t.includes("quit") || t === "close") {
    return `Quit App: ${app || "Unknown"}`;
  }
  if (t.includes("click") || t.includes("tap")) {
    if (x !== null && y !== null) return `Click: (X: ${x}, Y: ${y})`;
    return "Click";
  }
  if (t.includes("type") || t.includes("key") || t.includes("hotkey")) {
    return text ? `Type: ${text}` : "Keyboard input";
  }
  if (t.includes("scroll")) {
    const direction =
      paramStr(params, "direction") ||
      (Number(paramStr(params, "deltaY") ?? 0) < 0 ? "up" : null);
    const amount =
      paramStr(params, "amount") ||
      paramStr(params, "deltaY") ||
      paramStr(params, "dy");
    if (direction && amount) return `Scroll ${direction}: ${amount}`;
    if (direction) return `Scroll ${direction}`;
    const dx = paramStr(params, "dx") || paramStr(params, "deltaX") || "0";
    const dy = paramStr(params, "dy") || paramStr(params, "deltaY") || "0";
    return `Scroll: (${dx}, ${dy})`;
  }
  if (t.includes("screenshot") || t.includes("capture_screen")) {
    return "Capture screen";
  }
  if (t.includes("camera")) return "Capture camera";
  if (t.includes("lock")) return "Lock screen";
  if (t.includes("unlock")) return "Unlock screen";
  if (t.includes("wait") || t.includes("sleep")) {
    const ms = paramStr(params, "ms") || paramStr(params, "duration") || paramStr(params, "seconds");
    return ms ? `Wait: ${ms}` : "Wait";
  }
  if (path) return `${type}: ${path}`;
  if (app) return `${type}: ${app}`;
  if (pid) return `${type}: PID ${pid}`;
  if (text) return `${type}: ${text}`;

  const keys = Object.keys(params).filter((k) => params[k] !== undefined && params[k] !== null);
  if (!keys.length) return type;
  const summary = keys
    .slice(0, 3)
    .map((k) => `${k}=${String(params[k])}`)
    .join(", ");
  return `${type}: ${summary}`;
}
