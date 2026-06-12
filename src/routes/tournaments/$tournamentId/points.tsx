import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
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
import Loading from "@/components/Loading";
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

  if (isLoading || lisLoading) return <Loading />;

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
      <Flex flex="1" flexDir="column" overflow="auto">
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
                <Td display="flex" alignItems="center" gap="3">
                  <span>{i + 1}.</span>
                  <Img
                    rounded="full"
                    w="40px"
                    h="40px"
                    src={
                      row.expand?.user.img
                        ? row.expand?.user.img + "&thumb=100x100"
                        // @ts-expect-error we dont care
                        : `https://api.dicebear.com/9.x/initials/svg?seed=${row.expand?.user.username}`
                    }
                  />
                  <Link
                    to="/tournaments/$tournamentId/$userId"
                    params={{ tournamentId, userId: row.user }}
                  >
                    {row.expand?.user.name}
                  </Link>
                </Td>
                <Td>{row.points}</Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </Flex>
      <BottomNav tournamentId={tournamentId} state="puntos" />
    </>
  );
}
