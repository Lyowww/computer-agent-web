"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, type ReactNode } from "react";
import { AuthHydrator } from "@/providers/AuthHydrator";
import { WebsocketProvider } from "@/providers/WebsocketProvider";

export function AppProviders({ children }: { children: ReactNode }) {
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 15_000,
            retry: 1,
            refetchOnWindowFocus: true,
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={client}>
      <AuthHydrator>
        <WebsocketProvider>{children}</WebsocketProvider>
      </AuthHydrator>
    </QueryClientProvider>
  );
}
