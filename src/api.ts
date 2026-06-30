import toaster from "react-hot-toast";
import {
  QueryKey,
  queryOptions,
  useMutation,
  useQuery,
} from "@tanstack/react-query";
import { usePostHog } from "@posthog/react";
import { FeatFlagResponse } from "./featureFlags";
import { pb } from "./pb";
import { queryClient } from "./queryClient";
import {
  Collections,
  LeaderboardResponse,
  MatchBetsResponse,
  MatchesResponse,
  PredictionsRecord,
  PredictionsResponse,
  ResultsResponse,
  TournamentsResponse,
  UsersRecord,
  UsersResponse,
} from "./pocketbase-types";
import { DateTime } from "luxon";

export const tournamentsQuery = queryOptions({
  queryKey: [Collections.Tournaments, "-sort"],
  queryFn: () =>
    pb
      .collection(Collections.Tournaments)
      .getFullList<TournamentsResponse>({ sort: "-created" }),
});

export const getFlagsQuery = queryOptions({
  queryKey: ["flags"],
  async queryFn() {
    return await pb.collection("flags").getFullList<FeatFlagResponse>();
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

export const getPredictionsQuery = (
  tournamentId: string,
  tab?: string | null,
) => {
  const today = DateTime.now().setZone("UTC-6");
  const nextDayUtc = today.plus({ days: 1 }).startOf("day").toUTC().toSQL();
  const todayUtc = today.startOf("day").toUTC().toSQL();
  const user = pb.authStore.model as UsersResponse;

  let filter = `user='${user.id}' && match.tournament = '${tournamentId}'`;

  if (tab === "todos") {
    const startat = today.minus({ days: 1 }).startOf("day").toUTC().toSQL();
    filter += ` && match.startAtUtc < '${startat}'`;
  } else if (tab === "ayer") {
    const startat = today.minus({ days: 1 }).startOf("day").toUTC().toSQL();
    const endat = todayUtc;
    filter += ` && match.startAtUtc >= '${startat}' && match.startAtUtc < '${endat}'`;
  } else if (tab === "proximos") {
    const startat = nextDayUtc;
    const endat = today.plus({ day: 4 }).endOf("day").toUTC().toSQL();
    filter += ` && match.startAtUtc >= '${startat}' && match.startAtUtc < '${endat}'`;
  } else {
    filter += ` && match.startAtUtc >= '${todayUtc}' && match.startAtUtc < '${nextDayUtc}'`;
  }
  return queryOptions({
    queryKey: [Collections.Predictions, filter],
    queryFn: () =>
      pb.collection(Collections.Predictions).getFullList<PredictionsResponse>({
        filter,
      }),
  });
};

export const getTournamentQuery = (tournamentId: string) =>
  queryOptions({
    queryKey: [Collections.Tournaments, tournamentId],
    queryFn: () =>
      pb
        .collection(Collections.Tournaments)
        .getOne<TournamentsResponse>(tournamentId),
  });

export const getLeaderboardQuery = (tournamentId: string) =>
  queryOptions({
    queryKey: [Collections.Leaderboard, tournamentId],
    queryFn: () =>
      pb
        .collection(Collections.Leaderboard)
        .getFullList<LeaderboardResponse<number, { user: UsersRecord }>>({
          filter: `tournament_id = '${tournamentId}'`,
          expand: "user",
          sort: "-points",
        }),
  });

export const getUserQuery = (userId: string) =>
  queryOptions({
    queryKey: [Collections.Users, userId],
    queryFn: () =>
      pb.collection(Collections.Users).getOne<UsersResponse>(userId),
  });

export const useUserQuery = (userId?: string) =>
  useQuery({
    ...getUserQuery(userId ?? ""),
    enabled: !!userId,
  });

export const useSetFavoriteTeam = (userId: string) => {
  return useMutation({
    mutationFn(favorite_team: string) {
      return pb
        .collection(Collections.Users)
        .update<UsersResponse>(userId, { favorite_team });
    },
    onSuccess() {
      queryClient.invalidateQueries({
        queryKey: [Collections.Users, userId],
      });
    },
  });
};

export const getUserResultsQuery = (tournamentId: string, userId: string) =>
  queryOptions({
    queryKey: [Collections.Results, tournamentId, userId],
    queryFn: () =>
      pb
        .collection(Collections.Results)
        .getFullList<
          ResultsResponse<
            number,
            number,
            number,
            number,
            number,
            number,
            { match_id: MatchesResponse }
          >
        >({
          filter: `tournament_id = '${tournamentId}' && user = '${userId}' && points > 0`,
          expand: "match_id",
        }),
  });

export const getMatchQuery = (matchId: string) =>
  queryOptions({
    queryKey: ["get-one", Collections.Matches, matchId],
    queryFn: () =>
      pb.collection(Collections.Matches).getOne<MatchesResponse>(matchId),
  });

export const usersQuery = queryOptions({
  queryKey: ["get-all", Collections.Users],
  queryFn: () =>
    pb.collection(Collections.Users).getFullList<UsersResponse>({
      filter: "ignore!=true",
    }),
});

export const getMatchResultsQuery = (matchId: string) =>
  queryOptions({
    queryKey: ["get-all", Collections.Results, matchId],
    queryFn: () =>
      pb
        .collection(Collections.Results)
        .getFullList<
          ResultsResponse<
            number,
            number,
            number,
            number,
            number,
            number,
            { user: UsersResponse; prediction_id: PredictionsResponse }
          >
        >({
          filter: `match_id = '${matchId}'`,
          expand: "user,prediction_id",
          sort: "-points",
        }),
  });

export const matchBetsQuery = queryOptions({
  queryKey: ["get-all", Collections.MatchBets],
  queryFn: () =>
    pb
      .collection(Collections.MatchBets)
      .getFullList<MatchBetsResponse<number, number, number>>(),
});

export const getMatchPredictionsQuery = (matchId: string) =>
  queryOptions({
    queryKey: ["get-all", Collections.Predictions, matchId],
    queryFn: () =>
      pb
        .collection(Collections.Predictions)
        .getFullList<PredictionsResponse<{ user: UsersResponse }>>({
          filter: `match = '${matchId}'`,
          expand: "user",
        }),
  });

export const useCreatePrediction = (predictionsQueryKey: QueryKey) => {
  const posthog = usePostHog();
  return useMutation({
    mutationFn(prediction: Partial<PredictionsRecord>) {
      return pb.collection(Collections.Predictions).create(prediction);
    },
    onSuccess() {
      queryClient.invalidateQueries({ queryKey: predictionsQueryKey });
      toaster.success("saved");
    },
    onError(err) {
      toaster.error("Something went wrong: " + err.message);
      posthog.captureException(err);
    },
  });
};

export const useUpdatePrediction = (predictionsQueryKey: QueryKey) => {
  const posthog = usePostHog();
  return useMutation({
    mutationFn: (params: {
      id: string;
      prediction: Partial<PredictionsRecord>;
    }) =>
      pb
        .collection(Collections.Predictions)
        .update(params.id, params.prediction),
    onSuccess() {
      toaster.success("saved");
      queryClient.invalidateQueries({ queryKey: predictionsQueryKey });
    },
    onError(err) {
      toaster.error("Something went wrong: " + err.message);
      posthog.captureException(err);
      if (
        confirm(
          "Hubo un problem al guardar. Quisieres refrescar la pagina para arreglarlo?"
        )
      ) {
        window.document.location.reload();
      }
    },
  });
};
