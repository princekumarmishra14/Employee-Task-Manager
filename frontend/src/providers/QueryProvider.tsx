/**
 * src/providers/QueryProvider.tsx
 * TanStack React Query provider for client-side data fetching, caching, and optimistic updates.
 */

"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

export default function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,        // 1 minute — data is considered fresh
            gcTime: 5 * 60 * 1000,       // 5 minutes — garbage collect unused queries
            retry: 1,                    // Retry failed requests once
            refetchOnWindowFocus: false, // Don't refetch every tab switch
          },
          mutations: {
            retry: 0, // Never retry mutations automatically
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
