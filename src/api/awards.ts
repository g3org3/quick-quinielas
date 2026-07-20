import { queryOptions } from "@tanstack/react-query";

import { pb } from "@/pb";
import { AwardsResponse, Collections, UsersResponse } from "@/pocketbase-types";

export type NumericAwardsResponse = AwardsResponse<
  number,
  number,
  number,
  number,
  number,
  { user_id: UsersResponse }
>;

export const awardsKeys = {
  all: [Collections.Awards] as const,
  lists: () => [...awardsKeys.all, "list"] as const,
  list: (tournamentId: string) =>
    [...awardsKeys.lists(), tournamentId] as const,
};

export const getAwardsQuery = (tournamentId: string) =>
  queryOptions({
    queryKey: awardsKeys.list(tournamentId),
    queryFn: () =>
      pb.collection(Collections.Awards).getFullList<NumericAwardsResponse>({
        filter: `tournament='${tournamentId}'`,
        expand: "user_id",
      }),
  });
