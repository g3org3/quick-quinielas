import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import {
  Table,
  Thead,
  Tr,
  Td,
  Th,
  Tbody,
  Text,
  Img,
  Badge,
} from "@chakra-ui/react";
import { Flex } from "@chakra-ui/react";
import { DateTime } from "luxon";

import {
  MatchesPenaltyWinnerOptions,
  PredictionsFirstGoalFromOptions,
} from "@/pocketbase-types";
import { getMatchQuery } from "@/api/matches";
import { firstGoalLabel } from "@/api/predictions";
import { getMatchResultsQuery } from "@/api/results";
import { usersQuery } from "@/api/users";
import TournamentLoading from "@/components/TournamentLoading";
import BottomNav from "@/components/BottomNav";
import FeatFlagComponent from "@/components/FeatFlagComponent";
import SimpleMatch from "@/components/SimpleMatch";
import { queryClient } from "@/queryClient";
import Flag from "@/components/Flag";
import { countries } from "@/components/countries";
import { useGetRowStyle } from "@/useGetRowStyle";
import { sortUsers } from "@/sortUsers";

export const Route = createFileRoute(
  "/tournaments/$tournamentId/matches/$matchId"
)({
  component: SingleMatch,
  pendingComponent: TournamentLoading,
  loader: async ({ params }) => {
    await queryClient.ensureQueryData(getMatchQuery(params.matchId));
    await queryClient.ensureQueryData(usersQuery);
    await queryClient.ensureQueryData(getMatchResultsQuery(params.matchId));
  },
});

function SingleMatch() {
  const { matchId, tournamentId } = Route.useParams();

  const { data: match } = useSuspenseQuery(getMatchQuery(matchId));
  const { data: users } = useSuspenseQuery(usersQuery);
  const { data: results } = useSuspenseQuery(getMatchResultsQuery(matchId));
  const getRowStyle = useGetRowStyle();
  const sortedUsers = sortUsers(users, results);

  return (
    <>
      <Flex
        flexDir="column"
        flex="1"
        overflow="auto"
        overscrollBehavior="contain"
      >
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
                  </Flex>
                </Flex>
                <Flex flexDir="column" alignSelf="flex-end">
                  <Flex alignItems="center" gap={2}>
                    <Flex fontSize="5xl" fontWeight="extrabold" p="1">
                      {match.homeScore}
                    </Flex>
                    <Flex fontSize="2xl" color="text.muted">
                      -
                    </Flex>
                    <Flex fontSize="5xl" fontWeight="extrabold" p="1">
                      {match.awayScore}
                    </Flex>
                  </Flex>
                </Flex>
                <Flex flex="1" gap="3" alignItems="center">
                  <Flex flexDir="column" flex="1" alignItems="center">
                    <Flag height="40px" country={match.away} />
                    {match.away}
                  </Flex>
                </Flex>
              </Flex>
              <hr />
              <Flex
                color="text.muted"
                display="box"
                pt="1"
                fontSize="sm"
                textAlign="center"
              >
                {DateTime.fromSQL(match.startAtUtc).toRelative()}
                {" · "}
                {DateTime.fromSQL(match.startAtUtc).toFormat(
                  "EEE dd MMM, h:mm a"
                )}
              </Flex>
              <Flex
                color="text.muted"
                display="box"
                fontSize="xs"
                textAlign="center"
                mb="2"
              >
                {match.location}
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
          />
        </FeatFlagComponent>
        {match.penalty_winner ? (
          <Flex
            justifyContent="center"
            alignItems="center"
            gap={2}
            py={2}
            color="text.secondary"
          >
            <Flag
              height="20px"
              country={
                match.penalty_winner === MatchesPenaltyWinnerOptions.home
                  ? match.home
                  : match.away
              }
            />
            <Text fontSize="sm" fontWeight="semibold">
              Ganó{" "}
              {match.penalty_winner === MatchesPenaltyWinnerOptions.home
                ? match.home
                : match.away}{" "}
              en penales
            </Text>
          </Flex>
        ) : null}
        <Flex flexDir="column" flex="1">
          <Table size="sm" boxShadow="md" borderRadius="sm">
            <Thead>
              <Tr>
                <Th>Participante</Th>
                <Th>Local</Th>
                <Th>Visita</Th>
                <Th isNumeric>Pts</Th>
              </Tr>
            </Thead>
            <Tbody>
              {sortedUsers.map((user) => {
                const result = results.find(
                  (p) => p.expand?.user_id?.id === user.id
                );
                const prediction = result?.expand?.prediction_id;

                return (
                  <Tr
                    {...getRowStyle({
                      result,
                      prediction,
                    })}
                    key={user.id}
                  >
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
                        <Flex flexDir="column" gap={1}>
                          <Flex gap={2} alignItems="center">
                            <Link
                              to="/tournaments/$tournamentId/$userId"
                              params={{ tournamentId, userId: user.id }}
                            >
                              {user.name}
                            </Link>
                            {user.favorite_team ? (
                              <Flag
                                height="24px"
                                country={user.favorite_team}
                              />
                            ) : null}
                            {prediction?.first_goal ? (
                              <Badge alignSelf="center" colorScheme="purple">
                                {firstGoalLabel(prediction.first_goal)}
                              </Badge>
                            ) : null}
                            {prediction?.first_goal_from ? (
                              <Badge alignSelf="center" colorScheme="purple">
                                {prediction.first_goal_from ===
                                  PredictionsFirstGoalFromOptions.home
                                  ? (countries[match.home]?.iso3 ?? match.home)
                                  : (countries[match.away]?.iso3 ?? match.away)}
                              </Badge>
                            ) : null}
                          </Flex>
                          <Flex gap={2} alignItems="center">
                            {result?.expand?.prediction_id?.created ? (
                              <Text
                                fontSize="xs"
                                color="text.muted"
                                fontFamily="mono"
                              >
                                {DateTime.fromSQL(
                                  result.expand.prediction_id.updated
                                ).toFormat("MMM dd hh:mma")}
                              </Text>
                            ) : null}
                            {prediction?.isBonusActive ? (
                              <Badge
                                bg="gold.50"
                                borderWidth="1px"
                                borderColor="gold.200"
                                color="gold.700"
                                fontFamily="mono"
                                rounded="md"
                              >
                                ×2
                              </Badge>
                            ) : null}
                          </Flex>
                        </Flex>
                      </Flex>
                    </Td>
                    <Td>{prediction?.homeScore ?? "-"}</Td>
                    <Td>{prediction?.awayScore ?? "-"}</Td>
                    <Td>{result?.points ?? "-"}</Td>
                  </Tr>
                );
              })}
            </Tbody>
          </Table>
        </Flex>
      </Flex>
      <BottomNav tournamentId={tournamentId} />
    </>
  );
}
