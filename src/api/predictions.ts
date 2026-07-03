import toaster from "react-hot-toast";
import { usePostHog } from "@posthog/react";
import { QueryKey, queryOptions, useMutation } from "@tanstack/react-query";
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
    const endat = today.plus({ day: 3 }).endOf("day").toUTC().toSQL();
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

export const getMatchPredictionsQuery = (matchId: string) =>
  queryOptions({
    queryKey: [Collections.Predictions, matchId],
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
    mutationFn(params: { id: string; prediction: Partial<PredictionsRecord> }) {
      return pb
        .collection(Collections.Predictions)
        .update(params.id, params.prediction);
    },
    onSuccess() {
      toaster.success("saved");
      queryClient.invalidateQueries({ queryKey: predictionsQueryKey });
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
