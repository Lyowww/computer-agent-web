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
  return (
    process.env.NEXT_PUBLIC_WS_URL?.replace(/\/$/, "") ||
    "http://localhost:3000/ws"
  );
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
    return this.emitAck("CAPTURE_SCREEN", payload);
  }

  emitNotify(payload: {
    requestId: string;
    body: string;
    title?: string;
    deviceId?: string;
  }): Promise<unknown> {
    return this.emitAck("NOTIFY", payload);
  }

  emitListProcesses(payload: {
    requestId: string;
    deviceId?: string;
    limit?: number;
  }): Promise<unknown> {
    return this.emitAck("LIST_PROCESSES", payload);
  }

  emitListApps(payload: {
    requestId: string;
    deviceId?: string;
    limit?: number;
  }): Promise<unknown> {
    return this.emitAck("LIST_APPS", payload);
  }

  private emitAck(event: string, payload: unknown): Promise<unknown> {
    const socket = this.socket;
    if (!socket?.connected) {
      return Promise.reject(new Error("WebSocket is not connected"));
    }

    return new Promise((resolve, reject) => {
      socket
        .timeout(30000)
        .emit(event, payload, (err: Error | null, response: unknown) => {
          if (err) {
            reject(
              new Error(
                err.message?.includes("timeout")
                  ? "Backend did not acknowledge within 30s (cold start / Redis / DB?). Try again."
                  : err.message || "Request failed",
              ),
            );
          } else resolve(response);
        });
    });
  }
}

export const agentSocket = new AgentSocket();
