import toaster from "react-hot-toast";
import { usePostHog } from "@posthog/react";
import { queryOptions, useMutation } from "@tanstack/react-query";
import { DateTime } from "luxon";

import { pb } from "@/pb";
import {
  Collections,
  PredictionsFirstGoalOptions,
  PredictionsRecord,
  PredictionsResponse,
  UsersResponse,
} from "@/pocketbase-types";
import { queryClient } from "@/queryClient";

export const predictionsKeys = {
  all: [Collections.Predictions] as const,
  lists: () => [...predictionsKeys.all, "list"] as const,
  list: (tournamentId: string, userId: string, tab?: string | null) =>
    [...predictionsKeys.lists(), tournamentId, userId, tab ?? "today"] as const,
  byMatch: (matchId: string) =>
    [...predictionsKeys.all, "byMatch", matchId] as const,
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
    filter += ` && match.startAtUtc >= '${nextDayUtc}'`;
  } else {
    filter += ` && match.startAtUtc >= '${todayUtc}' && match.startAtUtc < '${nextDayUtc}'`;
  }
  return queryOptions({
    queryKey: predictionsKeys.list(tournamentId, user.id, tab),
    queryFn: () =>
      pb.collection(Collections.Predictions).getFullList<PredictionsResponse>({
        filter,
      }),
  });
};

export const getMatchPredictionsQuery = (matchId: string) =>
  queryOptions({
    queryKey: predictionsKeys.byMatch(matchId),
    queryFn: () =>
      pb
        .collection(Collections.Predictions)
        .getFullList<PredictionsResponse<{ user: UsersResponse }>>({
          filter: `match = '${matchId}'`,
          expand: "user",
        }),
  });

export const useCreatePrediction = () => {
  const posthog = usePostHog();
  return useMutation({
    mutationFn(prediction: Partial<PredictionsRecord>) {
      return pb.collection(Collections.Predictions).create(prediction);
    },
    onSuccess() {
      queryClient.invalidateQueries({ queryKey: predictionsKeys.all });
      toaster.success("saved");
    },
    onError(err) {
      toaster.error("Something went wrong: " + err.message);
      posthog.captureException(err);
    },
  });
};

export const useUpdatePrediction = () => {
  const posthog = usePostHog();
  return useMutation({
    mutationFn(params: { id: string; prediction: Partial<PredictionsRecord> }) {
      return pb
        .collection(Collections.Predictions)
        .update(params.id, params.prediction);
    },
    onSuccess() {
      toaster.success("saved");
      queryClient.invalidateQueries({ queryKey: predictionsKeys.all });
    },
    onError(err) {
      toaster.error("Something went wrong: " + err.message);
      posthog.captureException(err);
      if (
        confirm(
          "Hubo un problem al guardar. Quisieres refrescar la pagina para arreglarlo?",
        )
      ) {
        window.document.location.reload();
      }
    },
  });
};

export const firstGoalLabel = (firstGoal: PredictionsFirstGoalOptions) => {
  if (firstGoal === PredictionsFirstGoalOptions.primer_tiempo) {
    return "T1";
  }

  if (firstGoal === PredictionsFirstGoalOptions.segundo_tiempo) {
    return "T2";
  }

  return "TE";
};
