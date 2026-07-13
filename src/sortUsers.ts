import type { ResultsResponseWithUserAndPrediction } from "./api/results";
import type { UsersResponse } from "./pocketbase-types";

export function sortUsers(
  users: UsersResponse[],
  results: ResultsResponseWithUserAndPrediction[],
  currentUserId?: string
) {
  const resultsByUserId = new Map(
    results.map((result) => [result.expand?.user_id?.id, result])
  );

  return [...users].sort((a, b) => {
    const aIsCurrentUser = a.id === currentUserId;
    const bIsCurrentUser = b.id === currentUserId;
    if (aIsCurrentUser !== bIsCurrentUser) return aIsCurrentUser ? -1 : 1;

    const aResult = resultsByUserId.get(a.id);
    const bResult = resultsByUserId.get(b.id);
    const aHasPrediction = !!aResult?.expand?.prediction_id;
    const bHasPrediction = !!bResult?.expand?.prediction_id;

    if (aHasPrediction !== bHasPrediction) return aHasPrediction ? -1 : 1;
    if (!aHasPrediction) return 0;

    return (bResult?.points ?? 0) - (aResult?.points ?? 0);
  });
}
