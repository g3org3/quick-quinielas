import { queryOptions } from "@tanstack/react-query";

import { pb } from "@/pb";
import { Collections, TournamentsResponse } from "@/pocketbase-types";

export const tournamentsKeys = {
  all: [Collections.Tournaments] as const,
  lists: () => [...tournamentsKeys.all, "list"] as const,
  details: () => [...tournamentsKeys.all, "detail"] as const,
  detail: (tournamentId: string) =>
    [...tournamentsKeys.details(), tournamentId] as const,
};

export const tournamentsQuery = queryOptions({
  queryKey: tournamentsKeys.lists(),
  queryFn: () =>
    pb
      .collection(Collections.Tournaments)
      .getFullList<TournamentsResponse>({ sort: "-created" }),
});

export const getTournamentQuery = (tournamentId: string) =>
  queryOptions({
    queryKey: tournamentsKeys.detail(tournamentId),
    queryFn: () =>
      pb
        .collection(Collections.Tournaments)
        .getOne<TournamentsResponse>(tournamentId),
  });
