import { describe, expect, it } from "vitest";
import {
  formatOs,
  phaseLabel,
  taskStatusToPhase,
  connectionLabel,
  isOnline,
  formatActionChip,
} from "@/lib/utils/format";

describe("format helpers", () => {
  it("maps OS codes to labels", () => {
    expect(formatOs("darwin")).toBe("macOS");
    expect(formatOs("win32")).toBe("Windows");
    expect(formatOs("linux")).toBe("Linux");
  });

  it("maps task statuses to UI phases", () => {
    expect(taskStatusToPhase("WAITING_FOR_SCREEN")).toBe("waiting_for_screenshot");
    expect(taskStatusToPhase("WAITING_FOR_ACTION")).toBe("executing");
    expect(taskStatusToPhase("WAITING_FOR_USER")).toBe("waiting_for_user");
    expect(taskStatusToPhase("COMPLETED")).toBe("completed");
    expect(taskStatusToPhase("FAILED")).toBe("failed");
  });

  it("exposes human-readable phase labels", () => {
    expect(phaseLabel("thinking")).toBe("Thinking");
    expect(phaseLabel("waiting_for_screenshot")).toBe("Waiting for screenshot");
    expect(phaseLabel("executing")).toBe("Executing action");
    expect(phaseLabel("verifying")).toBe("Verifying");
    expect(phaseLabel("waiting_for_user")).toBe("Waiting for user");
  });

  it("reports online status", () => {
    expect(isOnline("ONLINE")).toBe(true);
    expect(isOnline("OFFLINE")).toBe(false);
    expect(connectionLabel("ONLINE")).toBe("Online");
  });

  it("formats action chips without raw JSON", () => {
    expect(formatActionChip("open_app", { app: "Google Chrome" })).toBe(
      "Open App: Google Chrome",
    );
    expect(formatActionChip("click", { x: 450, y: 320 })).toBe(
      "Click: (X: 450, Y: 320)",
    );
    expect(formatActionChip("type", { text: "hello" })).toBe("Type: hello");
  });
});
