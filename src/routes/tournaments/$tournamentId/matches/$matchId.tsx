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
  Collections,
  PredictionsFirstGoalFromOptions,
} from "@/pocketbase-types";
import {
  firstGoalLabel,
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
import { useGetRowStyle } from "@/useGetRowStyle";
import { sortUsers } from "@/sortUsers";

export const Route = createFileRoute(
  "/tournaments/$tournamentId/matches/$matchId"
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

function SingleMatch() {
  const { matchId, tournamentId } = Route.useParams();

  const { data: tournament } = useSuspenseQuery(
    getTournamentQuery(tournamentId)
  );
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
        <h1
          style={{
            fontWeight: "bold",
            letterSpacing: "2px",
            fontSize: "20px",
            textAlign: "center",
          }}
        >
          {tournament.name}
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
            predictionsQueryKey={[Collections.Results, matchId]}
            getMatchesQueryKey={[Collections.Matches, matchId]}
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
                                  result.expand.prediction_id.updated
                                ).toFormat("MMM dd h:mm a")
                              : null}
                          </Text>
                        </Flex>
                        {user.favorite_team ? (
                          <Flag height="24px" country={user.favorite_team} />
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
                              ? "H"
                              : "A"}
                          </Badge>
                        ) : null}
                        {prediction?.isBonusActive ? (
                          <Badge alignSelf="center" colorScheme="red">
                            x2
                          </Badge>
                        ) : null}
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
