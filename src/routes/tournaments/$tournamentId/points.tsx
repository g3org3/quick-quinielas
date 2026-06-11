import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  Flex,
  Heading,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  Img,
  Text,
  keyframes,
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

const rise = keyframes`
  from { opacity: 0; transform: translateY(14px); }
  to { opacity: 1; transform: translateY(0); }
`;

const medals = ["🥇", "🥈", "🥉"];

function Points() {
  const { tournamentId } = Route.useParams();
  const highlight = useColorModeValue("green.100", "green.800");
  const cardBg = useColorModeValue("white", "gray.800");
  const cardBorder = useColorModeValue("blackAlpha.100", "whiteAlpha.200");
  const cardShadow = useColorModeValue(
    "0 12px 30px -14px rgba(26, 70, 50, 0.25)",
    "0 12px 30px -14px rgba(0, 0, 0, 0.6)"
  );
  const mutedText = useColorModeValue("gray.500", "gray.400");

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
      <Heading size="md" letterSpacing="tight" textAlign="center">
        {tournament?.name}
      </Heading>
      <Flex flex="1" flexDir="column" overflow="auto">
        <Flex
          flexDir="column"
          bg={cardBg}
          borderRadius="2xl"
          border="1px solid"
          borderColor={cardBorder}
          boxShadow={cardShadow}
          overflow="hidden"
          animation={`${rise} 0.5s ease-out`}
        >
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
                  bg={pb.authStore.model?.id === row.user ? highlight : undefined}
                >
                  <Td display="flex" alignItems="center" gap="3">
                    <Text
                      color={mutedText}
                      fontFamily="monospace"
                      minW="6"
                      textAlign="center"
                    >
                      {medals[i] ?? `${i + 1}.`}
                    </Text>
                    <Img
                      rounded="full"
                      w="40px"
                      h="40px"
                      src={
                        row.expand?.user.img
                          ? row.expand?.user.img + "&thumb=40x40"
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
                  <Td>
                    <Text fontWeight="semibold">{row.points}</Text>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Flex>
      </Flex>
      <BottomNav tournamentId={tournamentId} state="puntos" />
    </>
  );
}
