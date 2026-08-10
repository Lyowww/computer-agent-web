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

    agentSocket.connect(token, {
      onConnect: () => useChatStore.getState().setWsConnected(true),
      onDisconnect: () => useChatStore.getState().setWsConnected(false),
      onDeviceStatus: () => {
        void queryClient.invalidateQueries({ queryKey: ["devices"] });
      },
      onDeviceInfoUpdated: (payload) => {
        void queryClient.invalidateQueries({ queryKey: ["devices"] });
        if (payload?.deviceId) {
          void queryClient.invalidateQueries({
            queryKey: ["devices", payload.deviceId],
          });
        }
      },
      onTaskStart: (payload) => {
        const s = useChatStore.getState();
        s.setActiveTask(payload.taskId, "RUNNING");
        s.resetProgress();
        s.setPlannedActions([]);
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
        // Prefer AI_RESPONSE for assistant text; only fall back if none was shown.
        if (payload.message) {
          const already = s.messages.some(
            (m) =>
              m.role === "ASSISTANT" &&
              m.taskId === payload.taskId &&
              m.content.trim() === payload.message.trim(),
          );
          if (!already) s.appendLocalAssistantMessage(payload.message, payload.taskId);
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
          const already = s.messages.some(
            (m) =>
              m.role === "ASSISTANT" &&
              m.taskId === payload.taskId &&
              m.content.trim() === payload.message.trim(),
          );
          if (!already) s.appendLocalAssistantMessage(payload.message, payload.taskId);
        }
        void queryClient.invalidateQueries({ queryKey: ["tasks"] });
      },
      onAiResponse: (payload) => {
        const s = useChatStore.getState();
        s.setActiveTask(payload.taskId, s.activeTaskStatus);
        s.appendLocalAssistantMessage(payload.content, payload.taskId);
        if (payload.actions?.length) {
          s.setPlannedActions(payload.actions);
          s.pushProgress(
            `Queued ${payload.actions.length} action${payload.actions.length > 1 ? "s" : ""}...`,
          );
          s.setPhase("executing");
        }
      },
      onActionResult: (payload) => {
        const s = useChatStore.getState();
        s.markActionResult({
          actionId: payload.actionId,
          success: payload.success,
          error: payload.error,
        });
        if (payload.success) {
          s.pushProgress("Executed");
          s.setPhase("executing");
        } else {
          s.pushProgress(payload.error || "Action failed", "error");
          s.setPhase("failed");
        }
      },
      onScreenResult: (payload) => {
        const s = useChatStore.getState();
        if (payload.error || !payload.image) {
          if (payload.error) s.setLastError(payload.error);
          return;
        }
        s.setScreenshot({
          requestId: payload.requestId,
          taskId: payload.taskId,
          width: payload.width ?? 0,
          height: payload.height ?? 0,
          image: payload.image,
          mimeType: payload.mimeType || "image/png",
          receivedAt: new Date().toISOString(),
        });
        if (payload.taskId) {
          s.pushProgress("Screenshot received");
        } else if (s.phase === "waiting_for_screenshot") {
          s.setPhase("idle");
        }
      },
      onCameraResult: (payload) => {
        const s = useChatStore.getState();
        if (payload.error || !payload.image) {
          s.setLastError(payload.error || "Camera capture failed");
          return;
        }
        s.setCameraShot({
          requestId: payload.requestId,
          taskId: payload.taskId,
          width: payload.width ?? 0,
          height: payload.height ?? 0,
          image: payload.image,
          mimeType: payload.mimeType || "image/jpeg",
          receivedAt: new Date().toISOString(),
          deviceName: "Front camera",
        });
      },
      onProcessesResult: (payload) => {
        const s = useChatStore.getState();
        s.setProcesses(payload.processes ?? []);
        if (payload.error) s.setLastError(payload.error);
        // Stay out of chat — Processes page owns this UI.
      },
      onAppsResult: (payload) => {
        const s = useChatStore.getState();
        s.setApps(payload.apps ?? []);
        if (payload.error) s.setLastError(payload.error);
        // Stay out of chat — Apps page owns this UI.
      },
      onNotifyResult: (payload) => {
        const s = useChatStore.getState();
        if (!payload.success) {
          s.setLastError(payload.error || "Notification failed");
        }
        // Delivery confirmation is handled by ChatPanel after emitNotify resolves.
      },
      onAppActionResult: (payload) => {
        const s = useChatStore.getState();
        if (!payload.success) {
          s.setLastError(payload.error || `Failed to ${payload.action} ${payload.app}`);
        }
      },
      onLockResult: (payload) => {
        const s = useChatStore.getState();
        if (!payload.success) {
          s.setLastError(payload.error || `Failed to ${payload.action} screen`);
        }
      },
      onError: (payload) => {
        if (!payload?.message) return;
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
