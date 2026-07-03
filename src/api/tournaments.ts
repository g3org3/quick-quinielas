import { queryOptions } from "@tanstack/react-query";

import { pb } from "@/pb";
import { Collections, TournamentsResponse } from "@/pocketbase-types";

export const tournamentsQuery = queryOptions({
  queryKey: [Collections.Tournaments, "-sort"],
  queryFn: () =>
    pb
      .collection(Collections.Tournaments)
      .getFullList<TournamentsResponse>({ sort: "-created" }),
});

export const getTournamentQuery = (tournamentId: string) =>
  queryOptions({
    queryKey: [Collections.Tournaments, tournamentId],
    queryFn: () =>
      pb
        .collection(Collections.Tournaments)
        .getOne<TournamentsResponse>(tournamentId),
  });
