import { queryOptions } from "@tanstack/react-query";

import { pb } from "@/pb";
import { Collections, MatchBetsResponse } from "@/pocketbase-types";

export const matchBetsQuery = queryOptions({
  queryKey: [Collections.MatchBets],
  queryFn: () =>
    pb
      .collection(Collections.MatchBets)
      .getFullList<MatchBetsResponse<number, number, number>>(),
});
