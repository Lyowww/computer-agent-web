import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { PhaseBadge } from "@/components/ui/PhaseBadge";
import { StatusDot } from "@/components/ui/StatusDot";
import { MessageBubble } from "@/components/chat/MessageBubble";
import { TaskProgress } from "@/components/chat/TaskProgress";

describe("UI components", () => {
  it("renders phase badge labels", () => {
    render(<PhaseBadge phase="thinking" />);
    expect(screen.getByText("Thinking")).toBeInTheDocument();
  });

  it("renders connection status", () => {
    render(<StatusDot status="ONLINE" />);
    expect(screen.getByText("Online")).toBeInTheDocument();
  });

  it("renders chat bubbles by role", () => {
    render(
      <MessageBubble
        message={{
          id: "1",
          taskId: null,
          role: "USER",
          content: "Open Chrome",
          createdAt: new Date().toISOString(),
        }}
      />,
    );
    expect(screen.getByText("Open Chrome")).toBeInTheDocument();
    expect(screen.getByText("You")).toBeInTheDocument();
  });

  it("renders task progress steps", () => {
    render(
      <TaskProgress
        phase="executing"
        steps={[
          {
            id: "a",
            label: "Planning...",
            status: "done",
            at: new Date().toISOString(),
          },
          {
            id: "b",
            label: "Opening Chrome...",
            status: "active",
            at: new Date().toISOString(),
          },
        ]}
      />,
    );
    expect(screen.getByText("Planning...")).toBeInTheDocument();
    expect(screen.getByText("Opening Chrome...")).toBeInTheDocument();
    expect(screen.getByText("Executing action")).toBeInTheDocument();
  });
});
