import { DateTime } from "luxon";
import { ResultsResponseWithUserAndPrediction } from "./api";
import { UsersResponse } from "./pocketbase-types";

const _predictionUpdatedAt = (
  results: ResultsResponseWithUserAndPrediction[],
  userId: string
) => {
  const result = results.find((p) => p.expand?.user_id?.id === userId);
  const updated = result?.expand?.prediction_id?.updated ?? result?.updated;
  return updated ? DateTime.fromSQL(updated).toMillis() : null;
};

export function sortUsers(
  users: UsersResponse[],
  results: ResultsResponseWithUserAndPrediction[]
) {
  return [...users].sort((a, b) => {
    const ta = _predictionUpdatedAt(results, a.id);
    const tb = _predictionUpdatedAt(results, b.id);
    // users without a prediction go to the bottom
    if (ta === null && tb === null) return 0;
    if (ta === null) return 1;
    if (tb === null) return -1;
    // both have a prediction: newest updated first
    return tb - ta;
  });
}
