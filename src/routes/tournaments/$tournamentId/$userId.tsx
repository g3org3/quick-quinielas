import { useSuspenseQuery } from "@tanstack/react-query";
import {
  Flex,
  Image,
  Table,
  Th,
  Td,
  Tr,
  Tbody,
  Thead,
  Button,
} from "@chakra-ui/react";
import { Link, createFileRoute } from "@tanstack/react-router";

import { getUserResultsQuery } from "@/api/results";
import { getUserQuery } from "@/api/users";
import { queryClient } from "@/queryClient";
import TournamentLoading from "@/components/TournamentLoading";
import BottomNav from "@/components/BottomNav";
import Flag from "@/components/Flag";
import FavoriteTeam from "@/components/FavoriteTeam";
import { useGetRowStyle } from "@/useGetRowStyle";

export const Route = createFileRoute("/tournaments/$tournamentId/$userId")({
  component: UserPredictions,
  pendingComponent: TournamentLoading,
  loader: async ({ params }) => {
    await queryClient.ensureQueryData(getUserQuery(params.userId));
    await queryClient.ensureQueryData(
      getUserResultsQuery(params.tournamentId, params.userId)
    );
  },
});

function UserPredictions() {
  const { tournamentId, userId } = Route.useParams();
  const { data: user } = useSuspenseQuery(getUserQuery(userId));
  const { data: results } = useSuspenseQuery(
    getUserResultsQuery(tournamentId, userId)
  );
  const getRowStyle = useGetRowStyle();

  const total = results.reduce((sum, p) => sum + (p.points || 0), 0);
  const perfect_count = ""
  const acertados_count = ""

  return (
    <>
      <Flex flexDir="column" flex="1" overflow="auto">
        <Flex justifyContent="center" alignItems="center" gap="3" p="3">
          <Image
            rounded="full"
            w="120px"
            h="120px"
            src={
              user.img
                ? user.img + "&thumb=100x100&cache=default"
                : `https://api.dicebear.com/9.x/initials/svg?seed=${user.username}`
            }
          />
          <Flex flexDir="column">
            <Flex fontSize="x-large" fontWeight="bold" letterSpacing="2px">
              {user.name}
            </Flex>
            <Flex fontSize="large">❗️ {total} puntos</Flex>
            <Flex>✅ {acertados_count} - partidos acertados</Flex>
            <Flex>🙌 {perfect_count} - partidos perfectos</Flex>
            <FavoriteTeam userId={userId} favoriteTeam={user.favorite_team} />
          </Flex>
        </Flex>
        <hr />
        <Flex
          flexDir="column"
          flex="1"
          overflow="auto"
          overscrollBehavior="contain"
        >
          <Table>
            <Thead>
              <Tr>
                <Th></Th>
                <Th>L</Th>
                <Th>-</Th>
                <Th>-</Th>
                <Th>V</Th>
                <Th>pts</Th>
              </Tr>
            </Thead>
            <Tbody>
              {results.map((result) => {
                const prediction = result.expand?.prediction_id;
                return (
                  <Tr {...getRowStyle({ result, prediction })} key={result.id}>
                    <Td>
                      <Link
                        to="/tournaments/$tournamentId/matches/$matchId"
                        params={{ tournamentId, matchId: result.match_id }}
                      >
                        <Button size="xs" colorScheme="blue">
                          ver
                        </Button>
                      </Link>
                    </Td>
                    <Td>
                      <Flag
                        height="20px"
                        country={result.expand?.match_id.home}
                      />
                    </Td>
                    <Td>{prediction?.homeScore ?? "-"}</Td>
                    <Td>{prediction?.awayScore ?? "-"}</Td>
                    <Td>
                      <Flag
                        height="20px"
                        country={result.expand?.match_id.away}
                      />
                    </Td>
                    <Td>{result?.points ?? "-"}</Td>
                  </Tr>
                );
              })}
            </Tbody>
          </Table>
        </Flex>
      </Flex>
      <BottomNav tournamentId={tournamentId} state="perfil" />
    </>
  );
}
