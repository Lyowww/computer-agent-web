import { create } from "zustand";
import type {
  ChatMessage,
  PendingUserConfirmation,
  ScreenFrame,
  TaskProgressStep,
  TaskStatus,
  UiPhase,
} from "@/lib/types";
import { createRequestId, taskStatusToPhase } from "@/lib/utils/format";

interface ChatState {
  selectedDeviceId: string | null;
  activeTaskId: string | null;
  activeTaskStatus: TaskStatus | null;
  phase: UiPhase;
  messages: ChatMessage[];
  progressSteps: TaskProgressStep[];
  latestScreenshot: ScreenFrame | null;
  screenshots: ScreenFrame[];
  pendingConfirmation: PendingUserConfirmation | null;
  lastError: string | null;
  wsConnected: boolean;
  setSelectedDeviceId: (id: string | null) => void;
  setWsConnected: (connected: boolean) => void;
  setActiveTask: (taskId: string | null, status?: TaskStatus | null) => void;
  setPhase: (phase: UiPhase) => void;
  setTaskStatus: (status: TaskStatus | string, message?: string) => void;
  addMessage: (message: ChatMessage) => void;
  prependHistory: (messages: ChatMessage[]) => void;
  clearMessages: () => void;
  pushProgress: (label: string, status?: TaskProgressStep["status"]) => void;
  completeActiveProgress: () => void;
  failActiveProgress: () => void;
  resetProgress: () => void;
  setScreenshot: (frame: ScreenFrame) => void;
  setPendingConfirmation: (value: PendingUserConfirmation | null) => void;
  setLastError: (error: string | null) => void;
  appendLocalUserMessage: (content: string, taskId?: string | null) => ChatMessage;
  appendLocalAssistantMessage: (content: string, taskId?: string | null) => ChatMessage;
}

function stepFromStatus(status: TaskStatus | string): string {
  switch (status) {
    case "CREATED":
    case "RUNNING":
      return "Planning...";
    case "WAITING_FOR_SCREEN":
      return "Taking screenshot...";
    case "WAITING_FOR_ACTION":
      return "Executing action...";
    case "WAITING_FOR_USER":
      return "Waiting for your confirmation...";
    case "COMPLETED":
      return "Completed.";
    case "FAILED":
      return "Failed.";
    case "CANCELLED":
      return "Cancelled.";
    default:
      return String(status);
  }
}

export const useChatStore = create<ChatState>((set, get) => ({
  selectedDeviceId: null,
  activeTaskId: null,
  activeTaskStatus: null,
  phase: "idle",
  messages: [],
  progressSteps: [],
  latestScreenshot: null,
  screenshots: [],
  pendingConfirmation: null,
  lastError: null,
  wsConnected: false,

  setSelectedDeviceId: (id) => set({ selectedDeviceId: id }),
  setWsConnected: (connected) => set({ wsConnected: connected }),

  setActiveTask: (taskId, status = null) =>
    set({
      activeTaskId: taskId,
      activeTaskStatus: status,
      phase: status ? taskStatusToPhase(status) : "idle",
    }),

  setPhase: (phase) => set({ phase }),

  setTaskStatus: (status, message) => {
    const typed = status as TaskStatus;
    const phase = taskStatusToPhase(typed);
    get().completeActiveProgress();
    get().pushProgress(stepFromStatus(typed), phase === "failed" ? "error" : phase === "completed" ? "done" : "active");

    if (typed === "WAITING_FOR_USER") {
      set({
        activeTaskStatus: typed,
        phase,
        pendingConfirmation: {
          taskId: get().activeTaskId ?? "",
          message: message || "The AI needs your approval to continue.",
          iteration: undefined,
        },
      });
      return;
    }

    if (typed === "COMPLETED" || typed === "FAILED" || typed === "CANCELLED") {
      set({
        activeTaskStatus: typed,
        phase,
        pendingConfirmation: null,
      });
      return;
    }

    set({ activeTaskStatus: typed, phase });
  },

  addMessage: (message) =>
    set((state) => {
      if (state.messages.some((m) => m.id === message.id)) return state;
      return { messages: [...state.messages, message] };
    }),

  prependHistory: (messages) =>
    set((state) => {
      const existing = new Set(state.messages.map((m) => m.id));
      const incoming = messages.filter((m) => !existing.has(m.id));
      return { messages: [...incoming, ...state.messages] };
    }),

  clearMessages: () => set({ messages: [], progressSteps: [] }),

  pushProgress: (label, status = "active") =>
    set((state) => {
      const steps = state.progressSteps.map((s) =>
        s.status === "active" ? { ...s, status: "done" as const } : s,
      );
      return {
        progressSteps: [
          ...steps,
          {
            id: createRequestId("step"),
            label,
            status,
            at: new Date().toISOString(),
          },
        ],
      };
    }),

  completeActiveProgress: () =>
    set((state) => ({
      progressSteps: state.progressSteps.map((s) =>
        s.status === "active" ? { ...s, status: "done" as const } : s,
      ),
    })),

  failActiveProgress: () =>
    set((state) => ({
      progressSteps: state.progressSteps.map((s) =>
        s.status === "active" ? { ...s, status: "error" as const } : s,
      ),
    })),

  resetProgress: () => set({ progressSteps: [] }),

  setScreenshot: (frame) =>
    set((state) => ({
      latestScreenshot: frame,
      screenshots: [frame, ...state.screenshots].slice(0, 20),
    })),

  setPendingConfirmation: (value) => set({ pendingConfirmation: value }),
  setLastError: (error) => set({ lastError: error }),

  appendLocalUserMessage: (content, taskId = null) => {
    const message: ChatMessage = {
      id: createRequestId("msg"),
      taskId,
      role: "USER",
      content,
      createdAt: new Date().toISOString(),
    };
    get().addMessage(message);
    return message;
  },

  appendLocalAssistantMessage: (content, taskId = null) => {
    const message: ChatMessage = {
      id: createRequestId("msg"),
      taskId,
      role: "ASSISTANT",
      content,
      createdAt: new Date().toISOString(),
    };
    get().addMessage(message);
    return message;
  },
}));
