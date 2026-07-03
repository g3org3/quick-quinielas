import { FeatFlagResponse } from "@/featureFlags";
import { pb } from "@/pb";
import { Collections } from "@/pocketbase-types";
import { queryClient } from "@/queryClient";
import { queryOptions, useMutation } from "@tanstack/react-query";

export const getFlagsQuery = queryOptions({
  queryKey: [Collections.Flags],
  queryFn() {
    return pb.collection(Collections.Flags).getFullList<FeatFlagResponse>();
  },
});

export const useToggleFeatFlags = () => {
  return useMutation({
    mutationFn({ isActive, id }: { isActive: boolean; id: string }) {
      return pb.collection("flags").update(id, { isActive });
    },
    onSuccess() {
      queryClient.invalidateQueries({ queryKey: ["flags"] });
    },
  });
};
