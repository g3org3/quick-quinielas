import { queryOptions } from "@tanstack/react-query";

import { pb } from "@/pb";
import {
  Collections,
  LeaderboardResponse,
  UsersResponse,
} from "@/pocketbase-types";

export const leaderboardKeys = {
  all: [Collections.Leaderboard] as const,
  lists: () => [...leaderboardKeys.all, "list"] as const,
  list: (tournamentId: string) =>
    [...leaderboardKeys.lists(), tournamentId] as const,
};

export const getLeaderboardQuery = (tournamentId: string) =>
  queryOptions({
    queryKey: leaderboardKeys.list(tournamentId),
    queryFn() {
      return pb
        .collection(Collections.Leaderboard)
        .getFullList<LeaderboardResponse<{ user_id: UsersResponse }>>({
          filter: `tournament_id='${tournamentId}'`,
          expand: "user_id",
          sort: "-points",
        });
    },
  });
