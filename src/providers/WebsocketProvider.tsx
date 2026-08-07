"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useEffect, type ReactNode } from "react";
import { agentSocket } from "@/lib/ws/client";
import type { TaskStatus } from "@/lib/types";
import { useAuthStore } from "@/stores/authStore";
import { useChatStore } from "@/stores/chatStore";

export function WebsocketProvider({ children }: { children: ReactNode }) {
  const token = useAuthStore((s) => s.token);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!token) {
      agentSocket.disconnect();
      useChatStore.getState().setWsConnected(false);
      return;
    }

    const store = useChatStore.getState();

    agentSocket.connect(token, {
      onConnect: () => useChatStore.getState().setWsConnected(true),
      onDisconnect: () => useChatStore.getState().setWsConnected(false),
      onDeviceStatus: () => {
        void queryClient.invalidateQueries({ queryKey: ["devices"] });
      },
      onTaskStart: (payload) => {
        const s = useChatStore.getState();
        s.setActiveTask(payload.taskId, "RUNNING");
        s.resetProgress();
        s.pushProgress("Planning...");
        s.setPhase("thinking");
        void queryClient.invalidateQueries({ queryKey: ["tasks"] });
      },
      onTaskUpdate: (payload) => {
        const s = useChatStore.getState();
        if (!s.activeTaskId) s.setActiveTask(payload.taskId, payload.status as TaskStatus);
        else if (s.activeTaskId === payload.taskId) {
          s.setTaskStatus(payload.status, payload.message);
        }
        if (payload.status === "WAITING_FOR_USER") {
          const latestAssistant = [...s.messages]
            .reverse()
            .find((m) => m.role === "ASSISTANT" && m.taskId === payload.taskId);
          s.setPendingConfirmation({
            taskId: payload.taskId,
            message:
              payload.message ||
              latestAssistant?.content ||
              "The AI is waiting for your approval before continuing.",
            iteration: payload.iteration,
          });
        }
        void queryClient.invalidateQueries({ queryKey: ["tasks"] });
      },
      onTaskCompleted: (payload) => {
        const s = useChatStore.getState();
        s.setActiveTask(payload.taskId, "COMPLETED");
        s.setTaskStatus("COMPLETED", payload.message);
        if (payload.message) {
          s.appendLocalAssistantMessage(payload.message, payload.taskId);
        }
        void queryClient.invalidateQueries({ queryKey: ["tasks"] });
      },
      onTaskFailed: (payload) => {
        const s = useChatStore.getState();
        s.setActiveTask(payload.taskId, "FAILED");
        s.failActiveProgress();
        s.setTaskStatus("FAILED", payload.message);
        s.setLastError(payload.message);
        if (payload.message) {
          s.appendLocalAssistantMessage(payload.message, payload.taskId);
        }
        void queryClient.invalidateQueries({ queryKey: ["tasks"] });
      },
      onAiResponse: (payload) => {
        const s = useChatStore.getState();
        s.setActiveTask(payload.taskId, s.activeTaskStatus);
        s.appendLocalAssistantMessage(payload.content, payload.taskId);
        if (payload.actions?.length) {
          s.pushProgress(
            `Queued ${payload.actions.length} action${payload.actions.length > 1 ? "s" : ""}...`,
          );
          s.setPhase("executing");
        }
      },
      onActionResult: (payload) => {
        const s = useChatStore.getState();
        if (payload.success) {
          s.pushProgress("Verifying...");
          s.setPhase("verifying");
        } else {
          s.pushProgress(payload.error || "Action failed", "error");
          s.setPhase("failed");
        }
      },
      onScreenResult: (payload) => {
        store.setScreenshot({
          requestId: payload.requestId,
          taskId: payload.taskId,
          width: payload.width,
          height: payload.height,
          image: payload.image,
          mimeType: payload.mimeType || "image/png",
          receivedAt: new Date().toISOString(),
        });
        if (payload.taskId) {
          useChatStore.getState().pushProgress("Screenshot received");
        }
      },
      onError: (payload) => {
        useChatStore.getState().setLastError(payload.message);
      },
    });

    return () => {
      agentSocket.disconnect();
      useChatStore.getState().setWsConnected(false);
    };
  }, [token, queryClient]);

  return children;
}
