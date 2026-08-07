"use client";

import { cn } from "@/lib/utils/cn";
import type { ChatMessage } from "@/lib/types";
import { format } from "date-fns";

export function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === "USER";
  const isSystem = message.role === "SYSTEM";

  return (
    <div className={cn("flex", isUser ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "max-w-[92%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm sm:max-w-[80%]",
          isUser && "bg-[var(--accent)] text-white",
          !isUser && !isSystem && "bg-white text-[var(--fg)] border border-[var(--border)]",
          isSystem && "bg-amber-50 text-amber-900 border border-amber-200",
        )}
      >
        <p className="mb-1 text-[10px] uppercase tracking-wide opacity-70">
          {isUser ? "You" : isSystem ? "System" : "AI"}
        </p>
        <p className="whitespace-pre-wrap">{message.content}</p>
        <p className="mt-2 text-[10px] opacity-60">
          {format(new Date(message.createdAt), "HH:mm:ss")}
        </p>
      </div>
    </div>
  );
}
