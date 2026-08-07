import { io, type Socket } from "socket.io-client";
import type {
  ActionResultPayload,
  AiResponsePayload,
  DeviceStatusPayload,
  ErrorPayload,
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

    socket.on("DEVICE_STATUS", (payload: DeviceStatusPayload) =>
      handlers.onDeviceStatus?.(payload),
    );
    socket.on("SCREEN_RESULT", (payload: ScreenResultPayload) =>
      handlers.onScreenResult?.(payload),
    );
    socket.on("TASK_START", (payload: TaskStartPayload) =>
      handlers.onTaskStart?.(payload),
    );
    socket.on("TASK_UPDATE", (payload: TaskUpdatePayload) =>
      handlers.onTaskUpdate?.(payload),
    );
    socket.on("TASK_COMPLETED", (payload: TaskTerminalPayload) =>
      handlers.onTaskCompleted?.(payload),
    );
    socket.on("TASK_FAILED", (payload: TaskTerminalPayload) =>
      handlers.onTaskFailed?.(payload),
    );
    socket.on("AI_RESPONSE", (payload: AiResponsePayload) =>
      handlers.onAiResponse?.(payload),
    );
    socket.on("ACTION_RESULT", (payload: ActionResultPayload) =>
      handlers.onActionResult?.(payload),
    );
    socket.on("ERROR", (payload: ErrorPayload) => handlers.onError?.(payload));

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
  }): Promise<unknown> {
    return this.emitAck("USER_MESSAGE", payload);
  }

  emitCaptureScreen(payload: {
    requestId: string;
    quality?: number;
    taskId?: string;
  }): Promise<unknown> {
    return this.emitAck("CAPTURE_SCREEN", payload);
  }

  private emitAck(event: string, payload: unknown): Promise<unknown> {
    const socket = this.socket;
    if (!socket?.connected) {
      return Promise.reject(new Error("WebSocket is not connected"));
    }

    return new Promise((resolve, reject) => {
      socket
        .timeout(15000)
        .emit(event, payload, (err: Error | null, response: unknown) => {
          if (err) reject(err);
          else resolve(response);
        });
    });
  }
}

export const agentSocket = new AgentSocket();
