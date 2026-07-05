import type { FeatFlagResponse } from "@/featureFlags";
import { pb } from "@/pb";
import { Collections } from "@/pocketbase-types";
import { queryClient } from "@/queryClient";
import { queryOptions, useMutation } from "@tanstack/react-query";

export const flagsKeys = {
  all: [Collections.Flags] as const,
  lists: () => [...flagsKeys.all, "list"] as const,
  details: () => [...flagsKeys.all, "detail"] as const,
  detail: (id: string) => [...flagsKeys.details(), id] as const,
};

export const getFlagsQuery = queryOptions({
  queryKey: flagsKeys.lists(),
  queryFn() {
    return pb.collection(Collections.Flags).getFullList<FeatFlagResponse>();
  },
});

export const useToggleFeatFlags = () => {
  return useMutation({
    mutationFn({ isActive, id }: { isActive: boolean; id: string }) {
      return pb.collection(Collections.Flags).update(id, { isActive });
    },
    onSuccess() {
      queryClient.invalidateQueries({ queryKey: flagsKeys.all });
    },
  });
};
