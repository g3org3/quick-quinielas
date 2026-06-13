import { MutationCache, QueryCache, QueryClient } from "@tanstack/react-query";

import { posthog } from "@/posthog";

export const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError(err, query) {
      posthog.captureException(err, { queryKey: query.queryKey });
    },
  }),
  mutationCache: new MutationCache({
    onError(err, variables) {
      posthog.captureException(err, { variables });
    },
  }),
  defaultOptions: {
    queries: {
      gcTime: 1000 * 60 * 60 * 1 // 1 hours
    }
  }
})
