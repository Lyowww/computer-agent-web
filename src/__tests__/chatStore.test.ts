import { describe, expect, it, beforeEach } from "vitest";
import { useChatStore } from "@/stores/chatStore";

describe("chatStore", () => {
  beforeEach(() => {
    useChatStore.setState({
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
    });
  });

  it("appends local user and assistant messages", () => {
    const user = useChatStore.getState().appendLocalUserMessage("Open Chrome");
    const ai = useChatStore
      .getState()
      .appendLocalAssistantMessage("Opening Chrome.");
    const messages = useChatStore.getState().messages;
    expect(messages).toHaveLength(2);
    expect(user.role).toBe("USER");
    expect(ai.role).toBe("ASSISTANT");
  });

  it("opens confirmation when waiting for user", () => {
    useChatStore.getState().setActiveTask("task-1", "RUNNING");
    useChatStore.getState().setTaskStatus("WAITING_FOR_USER", 'Send "Hello John"');
    const state = useChatStore.getState();
    expect(state.phase).toBe("waiting_for_user");
    expect(state.pendingConfirmation?.message).toContain("Hello John");
  });

  it("tracks progress steps for task lifecycle", () => {
    useChatStore.getState().pushProgress("Planning...");
    useChatStore.getState().setTaskStatus("WAITING_FOR_SCREEN");
    useChatStore.getState().setTaskStatus("WAITING_FOR_ACTION");
    useChatStore.getState().setTaskStatus("COMPLETED");
    const steps = useChatStore.getState().progressSteps;
    expect(steps.length).toBeGreaterThanOrEqual(3);
    expect(useChatStore.getState().phase).toBe("completed");
  });
});
