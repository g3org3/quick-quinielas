import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
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
import {
  Collections,
  LeaderboardResponse,
  TournamentsResponse,
  UsersRecord,
} from "@/pocketbase-types";
import { pb } from "@/pb";
import TournamentLoading from "@/components/TournamentLoading";
import BottomNav from "@/components/BottomNav";

export const Route = createFileRoute("/tournaments/$tournamentId/points")({
  component: Points,
});

function Points() {
  const { tournamentId } = Route.useParams();
  const blue = useColorModeValue("blue.100", "blue.800");

  const { data: tournament, isLoading } = useQuery({
    queryKey: ["get-one", Collections.Tournaments, tournamentId],
    queryFn: () =>
      pb
        .collection(Collections.Tournaments)
        .getOne<TournamentsResponse>(tournamentId),
  });

  const { data: leaderboard = [], isLoading: lisLoading } = useQuery({
    queryKey: ["get-all", Collections.Leaderboard, tournamentId],
    queryFn: () =>
      pb
        .collection(Collections.Leaderboard)
        .getFullList<LeaderboardResponse<number, { user: UsersRecord }>>({
          filter: `tournament_id = '${tournamentId}'`,
          expand: "user",
          sort: "-points",
        }),
  });

  if (isLoading || lisLoading) return <TournamentLoading />;

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
            {leaderboard.map((row, i) => (
              <Tr
                key={row.id}
                bg={pb.authStore.model?.id === row.user ? blue : undefined}
              >
                <Td>
                  <Link
                    to="/tournaments/$tournamentId/$userId"
                    params={{ tournamentId, userId: row.user }}
                  >
                    <Flex alignItems="center" gap={3}>
                      <Text fontFamily="monospace" fontSize={i + 1 <= 3 ? "xx-large" : "large"}>
                        {displayPoints(i + 1)}
                      </Text>
                      <Img
                        rounded="full"
                        w="40px"
                        h="40px"
                        src={
                          row.expand?.user.img
                            ? row.expand?.user.img +
                              "&thumb=100x100&cache=default"
                            : // @ts-expect-error we dont care
                              `https://api.dicebear.com/9.x/initials/svg?seed=${row.expand?.user.username}`
                        }
                      />
                      {row.expand?.user.name}
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
