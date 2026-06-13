import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  Box,
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
  const highlight = useColorModeValue("green.50", "rgba(56, 161, 105, 0.12)");
  const cardBg = useColorModeValue("white", "gray.800");
  const cardBorder = useColorModeValue("blackAlpha.100", "whiteAlpha.200");
  const cardShadow = useColorModeValue(
    "0 12px 30px -14px rgba(26, 70, 50, 0.25)",
    "0 12px 30px -14px rgba(0, 0, 0, 0.6)"
  );
  const mutedText = useColorModeValue("gray.500", "gray.400");
  const tableHeaderBg = useColorModeValue("gray.50", "whiteAlpha.50");
  const dividerColor = useColorModeValue("blackAlpha.100", "whiteAlpha.100");
  const glassBg = useColorModeValue(
    "rgba(255,255,255,0.70)",
    "rgba(12,18,15,0.72)"
  );

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
      {/* Frosted glass header card */}
      <Flex
        alignItems="center"
        justifyContent="center"
        bg={glassBg}
        backdropFilter="blur(12px) saturate(160%)"
        borderRadius="2xl"
        border="1px solid"
        borderColor={cardBorder}
        boxShadow={cardShadow}
        px="5"
        py="4"
        position="relative"
        overflow="hidden"
        animation={`${rise} 0.4s ease-out`}
        flexShrink={0}
      >
        <Box
          position="absolute"
          top="0"
          left="0"
          right="0"
          h="3px"
          bgGradient="linear(to-r, green.400, green.500, green.400)"
        />
        <Heading size="md" letterSpacing="tight" textAlign="center">
          {tournament?.name}
        </Heading>
      </Flex>

      <Flex flex="1" flexDir="column" overflow="auto">
        <Flex
          flexDir="column"
          bg={cardBg}
          borderRadius="2xl"
          border="1px solid"
          borderColor={cardBorder}
          boxShadow={cardShadow}
          overflow="hidden"
          animation={`${rise} 0.5s ease-out 0.06s backwards`}
        >
          <Box overflowX="auto">
            <Table variant="simple" size="sm">
              <Thead>
                <Tr bg={tableHeaderBg}>
                  <Th
                    py="3"
                    fontSize="xs"
                    color={mutedText}
                    fontWeight="semibold"
                  >
                    Participante
                  </Th>
                  <Th
                    py="3"
                    fontSize="xs"
                    color={mutedText}
                    fontWeight="semibold"
                    textAlign="right"
                  >
                    Puntos
                  </Th>
                </Tr>
              </Thead>
              <Tbody>
                {leaderboard.map((row, i) => {
                  const isMe = pb.authStore.model?.id === row.user;
                  const animDelay = i < 3 ? `${i * 0.07}s` : "0.2s";

                  return (
                    <Tr
                      key={row.id}
                      bg={isMe ? highlight : undefined}
                      animation={`${rise} 0.45s ease-out ${animDelay} backwards`}
                      transition="background 0.15s ease"
                      borderTop="1px solid"
                      borderColor={dividerColor}
                    >
                      <Td py="3">
                        <Flex alignItems="center" gap="3">
                          <Text
                            color={mutedText}
                            fontFamily="monospace"
                            minW="6"
                            textAlign="center"
                            fontSize="sm"
                          >
                            {medals[i] ?? `${i + 1}.`}
                          </Text>
                          <Img
                            rounded="full"
                            w="38px"
                            h="38px"
                            flexShrink={0}
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
                            <Text
                              fontSize="sm"
                              fontWeight={isMe ? "semibold" : "medium"}
                              letterSpacing="tight"
                              _hover={{ color: "green.500" }}
                              transition="color 0.15s ease"
                            >
                              {row.expand?.user.name}
                            </Text>
                          </Link>
                        </Flex>
                      </Td>
                      <Td py="3" textAlign="right">
                        {i === 0 ? (
                          <Text
                            fontWeight="bold"
                            fontSize="lg"
                            fontFamily="monospace"
                            bgGradient="linear(to-r, green.400, yellow.400)"
                            bgClip="text"
                          >
                            {row.points}
                          </Text>
                        ) : (
                          <Text
                            fontWeight="semibold"
                            fontSize="sm"
                            fontFamily="monospace"
                            color={i < 3 ? "green.500" : undefined}
                          >
                            {row.points}
                          </Text>
                        )}
                      </Td>
                    </Tr>
                  );
                })}
              </Tbody>
            </Table>
          </Box>
        </Flex>
      </Flex>

      <BottomNav tournamentId={tournamentId} state="puntos" />
    </>
  );
}
