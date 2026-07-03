import { queryOptions } from "@tanstack/react-query";

import { pb } from "@/pb";
import {
  Collections,
  LeaderboardResponse,
  UsersResponse,
} from "@/pocketbase-types";

export const getLeaderboardQuery = (tournamentId: string) =>
  queryOptions({
    queryKey: [Collections.Leaderboard, tournamentId],
    queryFn: () =>
      pb
        .collection(Collections.Leaderboard)
        .getFullList<LeaderboardResponse<{ user_id: UsersResponse }>>({
          filter: `tournament_id = '${tournamentId}'`,
          expand: "user_id",
          sort: "-points",
        }),
  });
