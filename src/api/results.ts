import { queryOptions } from "@tanstack/react-query";

import { pb } from "@/pb";
import {
  Collections,
  MatchesResponse,
  PredictionsResponse,
  ResultsResponse,
  UsersResponse,
} from "@/pocketbase-types";

type ResultsResponseWithMatchAndPrediction = ResultsResponse<{
  match_id: MatchesResponse;
  prediction_id: PredictionsResponse;
}>;

export const getUserResultsQuery = (tournamentId: string, userId: string) =>
  queryOptions({
    queryKey: [Collections.Results, tournamentId, userId],
    queryFn() {
      return pb
        .collection(Collections.Results)
        .getFullList<ResultsResponseWithMatchAndPrediction>({
          filter: `tournament_id = '${tournamentId}' && user_id = '${userId}' && points > 0`,
          expand: "match_id,prediction_id",
        });
    },
  });

export type ResultsResponseWithUserAndPrediction = ResultsResponse<{
  user_id?: UsersResponse;
  prediction_id?: PredictionsResponse;
}>;

export const getMatchResultsQuery = (matchId: string) =>
  queryOptions({
    queryKey: [Collections.Results, matchId],
    queryFn() {
      return pb
        .collection(Collections.Results)
        .getFullList<ResultsResponseWithUserAndPrediction>({
          filter: `match_id='${matchId}'`,
          expand: "user_id,prediction_id",
          sort: "-points",
        });
    },
  });
