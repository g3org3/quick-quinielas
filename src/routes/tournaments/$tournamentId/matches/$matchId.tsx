import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useSuspenseQuery } from "@tanstack/react-query";
import {
  Table,
  Thead,
  Tr,
  Td,
  Th,
  Tbody,
  Button,
  Spacer,
  Text,
  Img,
  Badge,
} from "@chakra-ui/react";
import { Flex, useColorModeValue } from "@chakra-ui/react";
import { DateTime } from "luxon";
import toaster from "react-hot-toast";

import {
  Collections,
  PredictionsFirstGoalFromOptions,
  PredictionsFirstGoalOptions,
} from "@/pocketbase-types";
import { pb } from "@/pb";
import {
  getMatchQuery,
  getMatchResultsQuery,
  getTournamentQuery,
  usersQuery,
} from "@/api";
import TournamentLoading from "@/components/TournamentLoading";
import BottomNav from "@/components/BottomNav";
import FeatFlagComponent from "@/components/FeatFlagComponent";
import SimpleMatch from "@/components/SimpleMatch";
import { queryClient } from "@/queryClient";
import Flag from "@/components/Flag";

export const Route = createFileRoute(
  "/tournaments/$tournamentId/matches/$matchId",
)({
  component: SingleMatch,
  pendingComponent: TournamentLoading,
  loader: async ({ params }) => {
    await queryClient.ensureQueryData(getTournamentQuery(params.tournamentId));
    await queryClient.ensureQueryData(getMatchQuery(params.matchId));
    await queryClient.ensureQueryData(usersQuery);
    await queryClient.ensureQueryData(getMatchResultsQuery(params.matchId));
  },
});

const isAdmin = false;

function SingleMatch() {
  const { matchId, tournamentId } = Route.useParams();
  const green = useColorModeValue("green.100", "green.800");
  const yellow = useColorModeValue("yellow.100", "yellow.800");
  const blue = useColorModeValue("blue.100", "blue.800");
  const red = useColorModeValue("red.50", "red.800");

  const { data: tournament } = useSuspenseQuery(
    getTournamentQuery(tournamentId),
  );
  const { data: match } = useSuspenseQuery(getMatchQuery(matchId));
  const { data: users } = useSuspenseQuery(usersQuery);
  const { data: results } = useSuspenseQuery(getMatchResultsQuery(matchId));

  const { mutate: onDelete } = useMutation({
    mutationFn: (id: string) =>
      pb.collection(Collections.Predictions).delete(id),
    onError(e) {
      toaster.error(e.message);
    },
    onSuccess() {
      toaster.success("deleted");
      queryClient.invalidateQueries({
        queryKey: ["get-all", Collections.Results, matchId],
      });
    },
  });

  const total = users.length;
  const homeper = Math.floor(
    (100 * results.filter((p) => p.p_home > p.p_away).length) / total,
  );
  const awayper = Math.floor(
    (100 * results.filter((p) => p.p_home < p.p_away).length) / total,
  );
  const tieper = Math.floor(
    (100 * results.filter((p) => p.p_home === p.p_away).length) / total,
  );

  const predictionUpdatedAt = (userId: string) => {
    const result = results.find((p) => p.expand?.user.id === userId);
    const updated = result?.expand?.prediction_id?.updated ?? result?.updated;
    return updated ? DateTime.fromSQL(updated).toMillis() : null;
  };

  const sortedUsers = [...users].sort((a, b) => {
    const ta = predictionUpdatedAt(a.id);
    const tb = predictionUpdatedAt(b.id);
    // users without a prediction go to the bottom
    if (ta === null && tb === null) return 0;
    if (ta === null) return 1;
    if (tb === null) return -1;
    // both have a prediction: newest updated first
    return tb - ta;
  });

  const getRowStyle = (result?: (typeof results)[number]) => {
    if (result?.isBonusActive) {
      return {
        bgGradient: "linear(to-br, red.600, red.900, orange.500)",
        color: "white",
        bg: undefined,
      };
    }

    let bg = red;
    if (result?.exact_score === 1) {
      bg = green;
    } else if (result?.correct_result === 1) {
      bg = yellow;
    } else if ((result?.points ?? 0) > 0) {
      bg = blue;
    }

    return { bgGradient: undefined, color: undefined, bg };
  };

  if (!match) return <div>something went wrong</div>;

  return (
    <>
      <Flex
        flexDir="column"
        flex="1"
        overflow="auto"
        overscrollBehavior="contain"
      >
        <h1
          style={{
            fontWeight: "bold",
            letterSpacing: "2px",
            fontSize: "20px",
            textAlign: "center",
          }}
        >
          {tournament?.name}
        </h1>
        <FeatFlagComponent
          feature="show_new_matchcard"
          fallback={
            <Flex flexDir="column">
              <Flex alignItems="center" gap="3" mb="3">
                <Flex flex="1" gap="3" alignItems="center">
                  <Flex
                    flexDir="column"
                    flex="1"
                    alignItems="center"
                    justifyContent="flex-end"
                  >
                    <Flag height="50px" country={match.home} />
                    {match.home}
                    <Flex fontFamily="monospace" color="gray.600">
                      {homeper}%
                    </Flex>
                  </Flex>
                </Flex>
                <Flex flexDir="column" alignSelf="flex-end">
                  <Flex alignItems="center" gap={2}>
                    <Flex fontSize="xxx-large" fontWeight="bold" p="1">
                      {match.homeScore}
                    </Flex>
                    <Flex fontSize="xx-large">-</Flex>
                    <Flex fontSize="xxx-large" fontWeight="bold" p="1">
                      {match.awayScore}
                    </Flex>
                  </Flex>
                  <br />
                  <Flex
                    color="gray.600"
                    fontFamily="monospace"
                    display="box"
                    textAlign="center"
                  >
                    {tieper}%
                  </Flex>
                </Flex>
                <Flex flex="1" gap="3" alignItems="center">
                  <Flex flexDir="column" flex="1" alignItems="center">
                    <Flag height="40px" country={match.away} />
                    {match.away}
                    <Flex fontFamily="monospace" color="gray.600">
                      {awayper}%
                    </Flex>
                  </Flex>
                </Flex>
              </Flex>
              <hr />
              <Flex
                color="gray.500"
                display="box"
                pt="1"
                fontSize="16px"
                textAlign="center"
              >
                {DateTime.fromSQL(match.startAtUtc).toFormat("EEE MMM dd")}
                {" - "}
                {DateTime.fromSQL(match.startAtUtc).toFormat("h:mm a")}
              </Flex>
              <Flex
                color="gray.500"
                display="box"
                fontSize="14px"
                textAlign="center"
                mb="2"
              >
                {match.location} -{" "}
                {DateTime.fromSQL(match.startAtUtc).toRelative()}
              </Flex>
              <hr />
            </Flex>
          }
        >
          <SimpleMatch
            match={match}
            homeScore={match.homeScore}
            awayScore={match.awayScore}
            firstGoal={match.first_goal}
            firstGoalFrom={match.first_goal_from}
            tournamentId={tournamentId}
            predictionsQueryKey={["get-all", Collections.Results, matchId]}
            getMatchesQueryKey={["get-one", Collections.Matches, matchId]}
          />
        </FeatFlagComponent>
        <Flex flexDir="column" flex="1">
          <Table boxShadow="md" borderRadius="sm">
            <Thead>
              <Tr>
                <Th>Participante</Th>
                <Th>-</Th>
                <Th>-</Th>
                <Th>pts</Th>
              </Tr>
            </Thead>
            <Tbody>
              {sortedUsers.map((user) => {
                const result = results.find(
                  (p) => p.expand?.user.id === user.id,
                );

                return (
                  <Tr {...getRowStyle(result)} key={user.id}>
                    <Td>
                      <Flex gap={2} alignItems="center">
                        <Img
                          rounded="full"
                          w="40px"
                          h="40px"
                          src={
                            user.img
                              ? user.img + "&thumb=100x100&cache=default"
                              : `https://api.dicebear.com/9.x/initials/svg?seed=${user.username}`
                          }
                        />
                        <Flex flexDir="column">
                          <Link
                            to="/tournaments/$tournamentId/$userId"
                            params={{ tournamentId, userId: user.id }}
                          >
                            {user.name}
                          </Link>
                          <Text fontFamily="monospace">
                            {result?.expand?.prediction_id?.created
                              ? DateTime.fromSQL(
                                  result.expand.prediction_id.updated,
                                ).toFormat("MMM dd h:mm a")
                              : null}
                          </Text>
                        </Flex>
                        {user.favorite_team ? (
                          <Flag height="24px" country={user.favorite_team} />
                        ) : null}
                        {result?.p_first_goal ? (
                          <Badge alignSelf="center" colorScheme="purple">
                            {result.p_first_goal ===
                            PredictionsFirstGoalOptions.primer_tiempo
                              ? "T1"
                              : "T2"}
                          </Badge>
                        ) : null}
                        {result?.p_first_goal_from ? (
                          <Badge alignSelf="center" colorScheme="purple">
                            {result.p_first_goal_from ===
                            PredictionsFirstGoalFromOptions.home
                              ? "H"
                              : "A"}
                          </Badge>
                        ) : null}
                        {result?.isBonusActive ? (
                          <Badge alignSelf="center" colorScheme="red">
                            x2
                          </Badge>
                        ) : null}
                      </Flex>
                    </Td>
                    <Td>{result?.p_home ?? "-"}</Td>
                    <Td>{result?.p_away ?? "-"}</Td>
                    <Td>{result?.points ?? "-"}</Td>
                  </Tr>
                );
              })}
            </Tbody>
          </Table>
        </Flex>
        {isAdmin ? (
          <Flex flexDir="column">
            {results.map((p) => (
              <Flex
                key={p.id}
                gap="3"
                p="1"
                borderTop="1px solid"
                borderColor="gray.100"
              >
                {p.prediction_id} -{p.expand?.user.name} - {p.p_home} {p.p_away}
                <Spacer />
                <Button
                  onClick={() => onDelete(p.prediction_id)}
                  colorScheme="red"
                  size="sm"
                >
                  delete
                </Button>
              </Flex>
            ))}
          </Flex>
        ) : null}
      </Flex>
      <BottomNav tournamentId={tournamentId} />
    </>
  );
}
