export type DeviceOs = "darwin" | "win32" | "linux";

export type ConnectionStatus = "ONLINE" | "OFFLINE" | "REVOKED";

export type TaskStatus =
  | "CREATED"
  | "RUNNING"
  | "WAITING_FOR_SCREEN"
  | "WAITING_FOR_ACTION"
  | "WAITING_FOR_USER"
  | "COMPLETED"
  | "FAILED"
  | "CANCELLED";

export type ChatRole = "USER" | "ASSISTANT" | "SYSTEM";

export type UiPhase =
  | "idle"
  | "thinking"
  | "waiting_for_screenshot"
  | "executing"
  | "verifying"
  | "waiting_for_user"
  | "completed"
  | "failed";

export interface User {
  id: string;
  email: string;
  name: string | null;
  createdAt: string;
  updatedAt?: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
}

export interface Device {
  id: string;
  userId: string;
  name: string;
  os: DeviceOs;
  connectionStatus: ConnectionStatus;
  lastSeenAt: string | null;
  revokedAt: string | null;
  createdAt: string;
  updatedAt: string;
  /** Always available for the device owner once stored / backfilled */
  deviceToken?: string | null;
  activeTask?: TaskSummary | null;
}

export interface CreateDeviceResponse {
  device: Device;
  deviceToken: string;
  warning: string;
}

export interface TaskSummary {
  id: string;
  instruction: string;
  status: TaskStatus;
  deviceId: string;
  iteration?: number;
  errorMessage?: string | null;
  resultSummary?: string | null;
  createdAt: string;
  updatedAt: string;
  completedAt?: string | null;
}

export interface Task extends TaskSummary {
  maxIterations: number;
  device?: Pick<Device, "id" | "name" | "os" | "connectionStatus">;
  actions?: TaskAction[];
  chatMessages?: ChatMessage[];
}

export interface TaskAction {
  id: string;
  type: string;
  params: Record<string, unknown>;
  success?: boolean;
  error?: string | null;
  createdAt?: string;
}

export interface ChatMessage {
  id: string;
  userId?: string;
  taskId: string | null;
  role: ChatRole;
  content: string;
  metadata?: Record<string, unknown> | null;
  createdAt: string;
}

export interface ApiErrorBody {
  success: false;
  error: {
    code: string;
    message: string | string[];
    details?: unknown;
  };
  timestamp: string;
}

export interface ScreenFrame {
  requestId: string;
  taskId?: string;
  width: number;
  height: number;
  image: string;
  mimeType: string;
  receivedAt: string;
  deviceName?: string;
}

export interface PendingUserConfirmation {
  taskId: string;
  message: string;
  iteration?: number;
}

export interface TaskProgressStep {
  id: string;
  label: string;
  status: "pending" | "active" | "done" | "error";
  at: string;
}

export type WsEventName =
  | "DEVICE_STATUS"
  | "SCREEN_RESULT"
  | "TASK_START"
  | "TASK_UPDATE"
  | "TASK_COMPLETED"
  | "TASK_FAILED"
  | "AI_RESPONSE"
  | "ACTION_RESULT"
  | "ERROR"
  | "PONG"
  | "USER_MESSAGE"
  | "CAPTURE_SCREEN"
  | "PING"
  | "NOTIFY"
  | "NOTIFY_RESULT"
  | "LIST_PROCESSES"
  | "PROCESSES_RESULT"
  | "LIST_APPS"
  | "APPS_RESULT"
  | "OPEN_APP"
  | "CLOSE_APP"
  | "APP_ACTION_RESULT"
  | "LOCK_SCREEN"
  | "UNLOCK_SCREEN"
  | "LOCK_RESULT"
  | "CAPTURE_CAMERA"
  | "CAMERA_RESULT";

export interface DeviceStatusPayload {
  deviceId: string;
  connectionStatus: ConnectionStatus | string;
  lastSeenAt: string | null;
  name?: string;
  os?: string;
}

export interface PlannedAction {
  type: string;
  params: Record<string, unknown>;
  reason?: string;
  actionId?: string;
  success?: boolean;
  error?: string;
}

export interface ProcessInfo {
  pid: number;
  name: string;
  cpu?: number;
}

export interface AppInfo {
  name: string;
  path?: string;
  running: boolean;
}

export interface ProcessesResultPayload {
  requestId: string;
  processes: ProcessInfo[];
  error?: string;
}

export interface AppsResultPayload {
  requestId: string;
  apps: AppInfo[];
  error?: string;
}

export interface NotifyResultPayload {
  requestId: string;
  success: boolean;
  delivered?: boolean;
  error?: string;
}

export interface AppActionResultPayload {
  requestId: string;
  action: "open" | "close";
  app: string;
  success: boolean;
  error?: string;
}

export interface LockResultPayload {
  requestId: string;
  action: "lock" | "unlock";
  success: boolean;
  alreadyUnlocked?: boolean;
  error?: string;
}


export interface TaskUpdatePayload {
  taskId: string;
  status: TaskStatus | string;
  iteration?: number;
  message?: string;
}

export interface TaskStartPayload {
  taskId: string;
  instruction: string;
  deviceId: string;
}

export interface TaskTerminalPayload {
  taskId: string;
  status: "COMPLETED" | "FAILED" | string;
  message: string;
}

export interface AiResponsePayload {
  taskId: string;
  content: string;
  actions?: PlannedAction[];
}

export interface ScreenResultPayload {
  requestId: string;
  taskId?: string;
  width?: number;
  height?: number;
  image?: string;
  mimeType?: string;
  error?: string;
}

export interface ErrorPayload {
  code: string;
  message: string;
  details?: unknown;
  requestId?: string;
  taskId?: string;
}

export interface ActionResultPayload {
  actionId: string;
  taskId: string;
  success: boolean;
  result?: Record<string, unknown>;
  error?: string;
}
