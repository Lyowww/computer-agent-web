import { io, type Socket } from "socket.io-client";
import type {
  ActionResultPayload,
  AiResponsePayload,
  AppsResultPayload,
  DeviceStatusPayload,
  ErrorPayload,
  NotifyResultPayload,
  ProcessesResultPayload,
  ScreenResultPayload,
  TaskStartPayload,
  TaskTerminalPayload,
  TaskUpdatePayload,
} from "@/lib/types";

export type WsHandlers = {
  onConnect?: () => void;
  onDisconnect?: (reason: string) => void;
  onDeviceStatus?: (payload: DeviceStatusPayload) => void;
  onScreenResult?: (payload: ScreenResultPayload) => void;
  onTaskStart?: (payload: TaskStartPayload) => void;
  onTaskUpdate?: (payload: TaskUpdatePayload) => void;
  onTaskCompleted?: (payload: TaskTerminalPayload) => void;
  onTaskFailed?: (payload: TaskTerminalPayload) => void;
  onAiResponse?: (payload: AiResponsePayload) => void;
  onActionResult?: (payload: ActionResultPayload) => void;
  onProcessesResult?: (payload: ProcessesResultPayload) => void;
  onAppsResult?: (payload: AppsResultPayload) => void;
  onNotifyResult?: (payload: NotifyResultPayload) => void;
  onError?: (payload: ErrorPayload) => void;
};

function wsUrl(): string {
  const raw =
    process.env.NEXT_PUBLIC_WS_URL?.trim().replace(/\/$/, "") ||
    "http://localhost:3000/ws";

  try {
    const withProtocol = /^(ws|wss|http|https):\/\//i.test(raw)
      ? raw
      : `https://${raw}`;
    const url = new URL(withProtocol);
    if (url.protocol === "ws:") url.protocol = "http:";
    if (url.protocol === "wss:") url.protocol = "https:";
    // Nest gateway is mounted at /ws — a bare host connects to the wrong namespace.
    if (!url.pathname || url.pathname === "/") {
      url.pathname = "/ws";
    }
    return url.toString().replace(/\/$/, "");
  } catch {
    return "http://localhost:3000/ws";
  }
}

export class AgentSocket {
  private socket: Socket | null = null;

  connect(token: string, handlers: WsHandlers): Socket {
    this.disconnect();

    const socket = io(wsUrl(), {
      transports: ["websocket", "polling"],
      query: { channel: "web-client" },
      auth: { token },
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 800,
      reconnectionDelayMax: 8000,
    });

    socket.on("connect", () => handlers.onConnect?.());
    socket.on("disconnect", (reason) => handlers.onDisconnect?.(String(reason)));

    const bind = <T,>(event: string, handler?: (payload: T) => void) => {
      if (!handler) return;
      socket.on(event, handler);
    };

    bind("DEVICE_STATUS", handlers.onDeviceStatus);
    bind("SCREEN_RESULT", handlers.onScreenResult);
    bind("TASK_START", handlers.onTaskStart);
    bind("TASK_UPDATE", handlers.onTaskUpdate);
    bind("TASK_COMPLETED", handlers.onTaskCompleted);
    bind("TASK_FAILED", handlers.onTaskFailed);
    bind("AI_RESPONSE", handlers.onAiResponse);
    bind("ACTION_RESULT", handlers.onActionResult);
    bind("PROCESSES_RESULT", handlers.onProcessesResult);
    bind("APPS_RESULT", handlers.onAppsResult);
    bind("NOTIFY_RESULT", handlers.onNotifyResult);
    bind("ERROR", handlers.onError);

    socket.on("message", (envelope: { event?: string; payload?: unknown }) => {
      if (!envelope?.event) return;
      const { event, payload } = envelope;
      switch (event) {
        case "DEVICE_STATUS":
          handlers.onDeviceStatus?.(payload as DeviceStatusPayload);
          break;
        case "SCREEN_RESULT":
          handlers.onScreenResult?.(payload as ScreenResultPayload);
          break;
        case "TASK_START":
          handlers.onTaskStart?.(payload as TaskStartPayload);
          break;
        case "TASK_UPDATE":
          handlers.onTaskUpdate?.(payload as TaskUpdatePayload);
          break;
        case "TASK_COMPLETED":
          handlers.onTaskCompleted?.(payload as TaskTerminalPayload);
          break;
        case "TASK_FAILED":
          handlers.onTaskFailed?.(payload as TaskTerminalPayload);
          break;
        case "AI_RESPONSE":
          handlers.onAiResponse?.(payload as AiResponsePayload);
          break;
        case "ACTION_RESULT":
          handlers.onActionResult?.(payload as ActionResultPayload);
          break;
        case "PROCESSES_RESULT":
          handlers.onProcessesResult?.(payload as ProcessesResultPayload);
          break;
        case "APPS_RESULT":
          handlers.onAppsResult?.(payload as AppsResultPayload);
          break;
        case "NOTIFY_RESULT":
          handlers.onNotifyResult?.(payload as NotifyResultPayload);
          break;
        case "ERROR":
          handlers.onError?.(payload as ErrorPayload);
          break;
        default:
          break;
      }
    });

    this.socket = socket;
    return socket;
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.removeAllListeners();
      this.socket.disconnect();
      this.socket = null;
    }
  }

  get instance(): Socket | null {
    return this.socket;
  }

  emitUserMessage(payload: {
    requestId?: string;
    taskId?: string;
    content: string;
    deviceId?: string;
    useAi?: boolean;
  }): Promise<unknown> {
    return this.emitAck("USER_MESSAGE", payload);
  }

  emitCaptureScreen(payload: {
    requestId: string;
    quality?: number;
    taskId?: string;
    deviceId?: string;
  }): Promise<unknown> {
    return this.emitAndWaitForResult("CAPTURE_SCREEN", payload, "SCREEN_RESULT", 25000);
  }

  emitNotify(payload: {
    requestId: string;
    body: string;
    title?: string;
    deviceId?: string;
  }): Promise<unknown> {
    return this.emitAndWaitForResult("NOTIFY", payload, "NOTIFY_RESULT", 15000);
  }

  emitListProcesses(payload: {
    requestId: string;
    deviceId?: string;
    limit?: number;
  }): Promise<unknown> {
    return this.emitAndWaitForResult("LIST_PROCESSES", payload, "PROCESSES_RESULT", 15000);
  }

  emitListApps(payload: {
    requestId: string;
    deviceId?: string;
    limit?: number;
  }): Promise<unknown> {
    return this.emitAndWaitForResult("LIST_APPS", payload, "APPS_RESULT", 15000);
  }

  /**
   * Fire the command, accept Nest/REQUEST_ACK if present, but resolve only when
   * the matching result event arrives (or reject on timeout / ERROR).
   */
  private emitAndWaitForResult(
    event: string,
    payload: { requestId: string },
    resultEvent: string,
    timeoutMs: number,
  ): Promise<unknown> {
    const socket = this.socket;
    if (!socket?.connected) {
      return Promise.reject(new Error("WebSocket is not connected"));
    }

    return new Promise((resolve, reject) => {
      let settled = false;
      const finish = (err: Error | null, response?: unknown) => {
        if (settled) return;
        settled = true;
        cleanup();
        if (err) reject(err);
        else resolve(response);
      };

      const onResult = (data: { requestId?: string; error?: string }) => {
        if (data?.requestId && data.requestId !== payload.requestId) return;
        if (data?.error) {
          finish(new Error(data.error));
          return;
        }
        finish(null, data);
      };

      const onEnvelope = (envelope: { event?: string; payload?: unknown }) => {
        if (envelope?.event !== resultEvent) return;
        onResult((envelope.payload ?? {}) as { requestId?: string; error?: string });
      };

      const onAck = (data: { event?: string; requestId?: string; ok?: boolean; message?: string }) => {
        if (data?.event && data.event !== event) return;
        if (data?.requestId && data.requestId !== payload.requestId) return;
        if (data?.ok === false) {
          finish(new Error(data.message || `${event} failed`));
        }
        // ok ACK alone is not enough — wait for device result.
      };

      const onError = (data: { requestId?: string; message?: string; code?: string }) => {
        if (data?.requestId && data.requestId !== payload.requestId) return;
        if (data?.requestId === payload.requestId) {
          finish(new Error(data.message || data.code || `${event} failed`));
        }
      };

      const timer = setTimeout(() => {
        finish(
          new Error(
            `${event} timed out after ${Math.round(timeoutMs / 1000)}s — device did not respond. Check the desktop agent Logs for CAPTURE_SCREEN / NOTIFY.`,
          ),
        );
      }, timeoutMs);

      const cleanup = () => {
        clearTimeout(timer);
        socket.off(resultEvent, onResult);
        socket.off("message", onEnvelope);
        socket.off("REQUEST_ACK", onAck);
        socket.off("ERROR", onError);
      };

      socket.on(resultEvent, onResult);
      socket.on("message", onEnvelope);
      socket.on("REQUEST_ACK", onAck);
      socket.on("ERROR", onError);

      // Emit without requiring Nest ACK (ACK has been unreliable); wait for result event.
      socket.emit(event, payload);
    });
  }

  private emitAck(event: string, payload: unknown): Promise<unknown> {
    const socket = this.socket;
    if (!socket?.connected) {
      return Promise.reject(new Error("WebSocket is not connected"));
    }

    const requestId =
      payload && typeof payload === "object" && "requestId" in payload
        ? String((payload as { requestId?: string }).requestId ?? "")
        : "";

    return new Promise((resolve, reject) => {
      let settled = false;
      const finish = (err: Error | null, response?: unknown) => {
        if (settled) return;
        settled = true;
        cleanup();
        if (err) reject(err);
        else resolve(response ?? { ok: true });
      };

      const onAck = (data: {
        event?: string;
        requestId?: string;
        ok?: boolean;
        message?: string;
      }) => {
        if (data?.event && data.event !== event) return;
        if (requestId && data?.requestId && data.requestId !== requestId) return;
        if (data?.ok === false) {
          finish(new Error(data.message || `${event} failed`));
          return;
        }
        finish(null, data);
      };

      const onError = (data: { requestId?: string; message?: string; code?: string }) => {
        if (requestId && data?.requestId && data.requestId !== requestId) return;
        if (requestId && data?.requestId === requestId) {
          finish(new Error(data.message || data.code || `${event} failed`));
        }
      };

      const timer = setTimeout(() => {
        finish(
          new Error(
            `${event} was not acknowledged by the backend within 10s. Redeploy backend or check Render logs.`,
          ),
        );
      }, 10000);

      const cleanup = () => {
        clearTimeout(timer);
        socket.off("REQUEST_ACK", onAck);
        socket.off("ERROR", onError);
      };

      socket.on("REQUEST_ACK", onAck);
      socket.on("ERROR", onError);
      // Never pass a Socket.IO ack callback — Nest often fails to run handlers when one is present.
      socket.emit(event, payload);
    });
  }
}

export const agentSocket = new AgentSocket();
