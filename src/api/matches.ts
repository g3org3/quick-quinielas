import { queryOptions } from "@tanstack/react-query";
import { DateTime } from "luxon";

import { pb } from "@/pb";
import { Collections, MatchesResponse } from "@/pocketbase-types";

export const getMatchesQuery = (tournamentId: string, tab?: string | null) => {
  const today = DateTime.now().setZone("UTC-6");
  const nextDayUtc = today.plus({ days: 1 }).startOf("day").toUTC().toSQL();
  const todayUtc = today.startOf("day").toUTC().toSQL();

  let filter = `tournament = '${tournamentId}'`;
  let sort = "startAtUtc";
  if (tab === "todos") {
    const startat = today.minus({ days: 1 }).startOf("day").toUTC().toSQL();
    filter += ` && startAtUtc < '${startat}'`;
    sort = "-startAtUtc";
  } else if (tab === "ayer") {
    const startat = today.minus({ days: 1 }).startOf("day").toUTC().toSQL();
    const endat = todayUtc;
    filter += ` && startAtUtc >= '${startat}' && startAtUtc < '${endat}'`;
    sort = "-startAtUtc";
  } else if (tab === "proximos") {
    const startat = nextDayUtc;
    const endat = today.plus({ day: 4 }).endOf("day").toUTC().toSQL();
    filter += ` && startAtUtc >= '${startat}' && startAtUtc < '${endat}'`;
  } else {
    filter += ` && startAtUtc >= '${todayUtc}' && startAtUtc < '${nextDayUtc}'`;
  }
  return queryOptions({
    queryKey: [Collections.Matches, tournamentId, sort, filter],
    queryFn: () =>
      pb.collection(Collections.Matches).getFullList<MatchesResponse>({
        filter,
        sort,
      }),
  });
};

export const matchesQuery = (tournamentId: string, countryName: string) => {
  const filter = `tournament = '${tournamentId}' && (home = "${countryName}" || away = "${countryName}") && startAtUtc < @now`;
  return queryOptions({
    queryKey: [Collections.Matches, "history", filter],
    queryFn: () =>
      pb.collection(Collections.Matches).getFullList<MatchesResponse>({
        filter,
        sort: "-startAtUtc",
      }),
  });
};

export const getMatchQuery = (matchId: string) =>
  queryOptions({
    queryKey: [Collections.Matches, matchId],
    queryFn: () =>
      pb.collection(Collections.Matches).getOne<MatchesResponse>(matchId),
  });
