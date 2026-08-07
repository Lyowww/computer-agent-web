"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { ChatPanel } from "@/components/chat/ChatPanel";
import { Spinner } from "@/components/ui/Spinner";

function ChatPageInner() {
  const params = useSearchParams();
  const deviceId = params.get("deviceId") || undefined;
  return <ChatPanel initialDeviceId={deviceId} />;
}

export default function ChatPage() {
  return (
    <AppShell>
      <Suspense
        fallback={
          <div className="flex items-center gap-2 text-[var(--muted)]">
            <Spinner /> Loading chat…
          </div>
        }
      >
        <ChatPageInner />
      </Suspense>
    </AppShell>
  );
}
