import { queryOptions } from "@tanstack/react-query";

import { pb } from "@/pb";
import { Collections, MatchBetsResponse } from "@/pocketbase-types";

export const matchBetsKeys = {
  all: [Collections.MatchBets] as const,
  lists: () => [...matchBetsKeys.all, "list"] as const,
};

export const matchBetsQuery = queryOptions({
  queryKey: matchBetsKeys.lists(),
  queryFn() {
    return pb
      .collection(Collections.MatchBets)
      .getFullList<MatchBetsResponse<number, number, number>>();
  },
});
