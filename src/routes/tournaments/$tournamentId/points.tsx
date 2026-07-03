import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import {
  Text,
  Flex,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  Img,
  useColorModeValue,
} from "@chakra-ui/react";
import { getLeaderboardQuery } from "@/api/leaderboard";
import { getTournamentQuery } from "@/api/tournaments";
import { pb } from "@/pb";
import { queryClient } from "@/queryClient";
import TournamentLoading from "@/components/TournamentLoading";
import BottomNav from "@/components/BottomNav";
import Flag from "@/components/Flag";

export const Route = createFileRoute("/tournaments/$tournamentId/points")({
  component: Points,
  pendingComponent: TournamentLoading,
  loader: async ({ params }) => {
    await queryClient.ensureQueryData(getTournamentQuery(params.tournamentId));
    await queryClient.ensureQueryData(getLeaderboardQuery(params.tournamentId));
  },
});

function Points() {
  const { tournamentId } = Route.useParams();
  const blue = useColorModeValue("blue.100", "blue.800");

  const { data: tournament } = useSuspenseQuery(
    getTournamentQuery(tournamentId),
  );
  const { data: leaderboard } = useSuspenseQuery(
    getLeaderboardQuery(tournamentId),
  );

  let position = 0;
  let previousPoints: number | null = null;
  const rankedLeaderboard = leaderboard.map((row) => {
    if (row.points !== previousPoints) {
      position += 1;
      previousPoints = row.points;
    }
    return { row, position };
  });

  return (
    <>
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
      <Flex flex="1" flexDir="column" overflow="auto" overscrollBehavior="contain">
        <Table variant="simple">
          <Thead>
            <Tr>
              <Th>Participante</Th>
              <Th>Puntos</Th>
            </Tr>
          </Thead>
          <Tbody>
            {rankedLeaderboard.map(({ row, position }) => (
              <Tr
                key={row.id}
                bg={pb.authStore.model?.id === row.user_id ? blue : undefined}
              >
                <Td>
                  <Link
                    to="/tournaments/$tournamentId/$userId"
                    params={{ tournamentId, userId: row.user_id }}
                  >
                    <Flex alignItems="center" gap={3}>
                      <Text fontFamily="monospace" fontSize={position <= 3 ? "xx-large" : "large"}>
                        {displayPoints(position)}
                      </Text>
                      <Img
                        rounded="full"
                        w="40px"
                        h="40px"
                        src={
                          row.expand?.user_id.img
                            ? row.expand?.user_id.img +
                              "&thumb=100x100&cache=default"
                            : `https://api.dicebear.com/9.x/initials/svg?seed=${row.expand?.user_id.username}`
                        }
                      />
                      {row.expand?.user_id.name}
                      {row.expand?.user_id.favorite_team && (
                        <Flag
                          height="24px"
                          country={row.expand.user_id.favorite_team}
                        />
                      )}
                    </Flex>
                  </Link>
                </Td>
                <Td fontWeight="bold">{row.points}</Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </Flex>
      <BottomNav tournamentId={tournamentId} state="puntos" />
    </>
  );
}

function displayPoints(points: number) {
  if (points === 1) {
    return "🏆";
  }
  if (points === 2) {
    return "🥈";
  }
  if (points === 3) {
    return "🥉";
  }
  return points + ".";
}
