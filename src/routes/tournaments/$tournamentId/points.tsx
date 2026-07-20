import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { z } from "zod";
import { useSuspenseQuery } from "@tanstack/react-query";
import { usePostHog } from "@posthog/react";
import {
  Avatar,
  Box,
  Button,
  Text,
  Flex,
  Grid,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  Img,
  useColorModeValue,
  VisuallyHidden,
} from "@chakra-ui/react";
import { getLeaderboardQuery } from "@/api/leaderboard";
import { pb } from "@/pb";
import { queryClient } from "@/queryClient";
import TournamentLoading from "@/components/TournamentLoading";
import BottomNav from "@/components/BottomNav";
import Flag from "@/components/Flag";

export const Route = createFileRoute("/tournaments/$tournamentId/points")({
  component: Points,
  pendingComponent: TournamentLoading,
  validateSearch: z.object({
    awards: z.literal("seen").optional(),
  }),
  beforeLoad: ({ params, search }) => {
    if (search.awards !== "seen") {
      throw redirect({
        to: "/tournaments/$tournamentId/awards",
        params,
        replace: true,
      });
    }
  },
  loader: async ({ params }) => {
    await queryClient.ensureQueryData(getLeaderboardQuery(params.tournamentId));
  },
});

function Points() {
  const { tournamentId } = Route.useParams();
  const posthog = usePostHog();
  const blue = useColorModeValue("blue.100", "blue.800");
  const currentUserInset = useColorModeValue(
    "inset 0 0 0 2px var(--chakra-colors-blue-100)",
    "inset 0 0 0 2px var(--chakra-colors-blue-800)"
  );
  const firstPlaceBase = useColorModeValue("gold.50", "gray.700");
  const firstPlaceAccent = useColorModeValue("gold.700", "gold.200");
  const secondPlaceRing = useColorModeValue("gray.300", "gray.400");
  const thirdPlaceRing = useColorModeValue("orange.200", "orange.500");

  const { data: leaderboard } = useSuspenseQuery(
    getLeaderboardQuery(tournamentId)
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
  const podium = rankedLeaderboard.slice(0, 3);
  const hasDistinctPodiumRanks = podium.every(
    (entry, index) => entry.position === index + 1
  );
  const podiumDisplayOrder =
    podium.length > 1 && hasDistinctPodiumRanks
      ? [podium[1], podium[0], ...podium.slice(2)]
      : podium;
  const remainingLeaderboard = rankedLeaderboard.slice(3);

  return (
    <>
      <Flex
        flex="1"
        flexDir="column"
        overflow="auto"
        overscrollBehavior="contain"
      >
        <Flex justifyContent="center" px={{ base: 2, sm: 4 }} pt={3}>
          <Button
            as={Link}
            to="/tournaments/$tournamentId/awards"
            params={{ tournamentId }}
            variant="secondary"
            onClick={() =>
              posthog.capture("click_view_awards", {
                tournament_id: tournamentId,
              })
            }
          >
            🏆 Ver premiación
          </Button>
        </Flex>
        {podium.length > 0 && (
          <Box px={{ base: 2, sm: 4 }} pt={3} pb={4}>
            <Grid
              templateColumns="repeat(3, minmax(0, 1fr))"
              alignItems="end"
              gap={{ base: 1, sm: 4 }}
              maxW="720px"
              mx="auto"
            >
              {podiumDisplayOrder.map(({ row, position }, index) => {
                const isFirstPlace = position === 1;
                const isSecondPlace = position === 2;
                const isCurrentUser = pb.authStore.model?.id === row.user_id;
                const ringColor = isFirstPlace
                  ? "gold.200"
                  : isSecondPlace
                    ? secondPlaceRing
                    : thirdPlaceRing;
                const badgeColor = isFirstPlace
                  ? "gold.700"
                  : isSecondPlace
                    ? "gray.500"
                    : "orange.600";
                const gridColumn = hasDistinctPodiumRanks
                  ? position === 1
                    ? 2
                    : position === 2
                      ? 1
                      : 3
                  : podium.length === 1
                    ? 2
                    : index + 1;

                return (
                  <Link
                    key={row.id}
                    to="/tournaments/$tournamentId/$userId"
                    params={{ tournamentId, userId: row.user_id }}
                    style={{
                      display: "block",
                      gridColumn,
                      minWidth: 0,
                    }}
                  >
                    <Flex
                      minW={0}
                      flexDir="column"
                      alignItems="center"
                      justifyContent="flex-end"
                      textAlign="center"
                    >
                      <Flex
                        minW={0}
                        w="100%"
                        flexDir="column"
                        alignItems="center"
                        pb={{ base: 2, sm: 3 }}
                      >
                        <Box
                          position="relative"
                          mb={{ base: 4, sm: 5 }}
                        >
                          <Avatar
                            boxSize={{
                              base: isFirstPlace ? "72px" : "62px",
                              sm: isFirstPlace ? "104px" : "84px",
                            }}
                            borderWidth={{ base: "4px", sm: "5px" }}
                            borderColor={ringColor}
                            name={row.expand?.user_id.name}
                            src={getAvatarUrl(
                              row.expand?.user_id.img,
                              row.expand?.user_id.username
                            )}
                          />
                          <Flex
                            position="absolute"
                            left="50%"
                            bottom={{ base: "-12px", sm: "-16px" }}
                            transform="translateX(-50%)"
                            boxSize={{ base: "28px", sm: "36px" }}
                            alignItems="center"
                            justifyContent="center"
                            rounded="full"
                            borderWidth="3px"
                            borderColor="surface"
                            bg={badgeColor}
                            color="white"
                            fontFamily="mono"
                            fontSize={{ base: "sm", sm: "lg" }}
                            fontWeight="bold"
                          >
                            <VisuallyHidden>Puesto {position}</VisuallyHidden>
                            <Text as="span" aria-hidden>
                              {position}
                            </Text>
                          </Flex>
                        </Box>
                        <Flex
                          minW={0}
                          maxW="100%"
                          alignItems="center"
                          justifyContent="center"
                          gap={{ base: 0.5, sm: 1 }}
                        >
                          <Text
                            minW={0}
                            fontSize={{ base: "sm", sm: "lg" }}
                            fontWeight="bold"
                            noOfLines={1}
                          >
                            {row.expand?.user_id.name}
                          </Text>
                          <Text
                            as="span"
                            aria-hidden
                            flexShrink={0}
                            fontSize={{ base: "sm", sm: "lg" }}
                          >
                            {displayPodiumEmoji(position)}
                          </Text>
                        </Flex>
                        <Flex
                          minW={0}
                          maxW="100%"
                          alignItems="center"
                          justifyContent="center"
                          gap={1}
                        >
                          <Text
                            minW={0}
                            color={
                              isFirstPlace
                                ? firstPlaceAccent
                                : "text.secondary"
                            }
                            fontFamily="mono"
                            fontWeight="bold"
                            fontSize={{ base: "sm", sm: "lg" }}
                            noOfLines={1}
                          >
                            {row.points} puntos
                          </Text>
                          {row.expand?.user_id.favorite_team && (
                            <Box flexShrink={0}>
                              <Flag
                                height="16px"
                                country={row.expand.user_id.favorite_team}
                              />
                            </Box>
                          )}
                        </Flex>
                      </Flex>
                      <Flex
                        w="100%"
                        h={{
                          base: isFirstPlace ? "88px" : "60px",
                          sm: isFirstPlace ? "120px" : "84px",
                        }}
                        alignItems="center"
                        justifyContent="center"
                        roundedTop="xl"
                        borderWidth={isFirstPlace ? "2px" : "1px"}
                        borderColor={
                          isFirstPlace ? "gold.200" : "border.subtle"
                        }
                        bg={isFirstPlace ? firstPlaceBase : "surface"}
                        boxShadow={isCurrentUser ? currentUserInset : "none"}
                      >
                        <Text
                          aria-hidden
                          color={
                            isFirstPlace ? firstPlaceAccent : "text.muted"
                          }
                          fontFamily="mono"
                          fontSize={{ base: "2xl", sm: "4xl" }}
                          fontWeight="bold"
                        >
                          {position}
                        </Text>
                      </Flex>
                    </Flex>
                  </Link>
                );
              })}
            </Grid>
          </Box>
        )}
        {remainingLeaderboard.length > 0 && (
          <Table variant="simple" size="sm">
            <Thead>
              <Tr>
                <Th>Participante</Th>
                <Th isNumeric>Puntos</Th>
              </Tr>
            </Thead>
            <Tbody>
              {remainingLeaderboard.map(({ row, position }) => (
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
                        <Text
                          fontFamily="mono"
                          fontSize="lg"
                          color="text.muted"
                        >
                          {displayPosition(position)}
                        </Text>
                        <Img
                          rounded="full"
                          w="50px"
                          h="50px"
                          src={getAvatarUrl(
                            row.expand?.user_id.img,
                            row.expand?.user_id.username
                          )}
                        />
                        <Text fontWeight="semibold" noOfLines={1}>
                          {row.expand?.user_id.name}
                        </Text>
                        {row.expand?.user_id.favorite_team && (
                          <Flag
                            height="24px"
                            country={row.expand.user_id.favorite_team}
                          />
                        )}
                      </Flex>
                    </Link>
                  </Td>
                  <Td
                    fontSize="lg"
                    color="text.muted"
                    isNumeric
                    fontWeight="bold"
                    fontFamily="mono"
                  >
                    {row.points}
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        )}
      </Flex>
      <BottomNav tournamentId={tournamentId} state="puntos" />
    </>
  );
}

function displayPosition(position: number) {
  return position.toString().padStart(2, "0") + ".";
}

function displayPodiumEmoji(position: number) {
  if (position === 1) {
    return "🏆";
  }
  if (position === 2) {
    return "🥈";
  }
  return "🥉";
}

function getAvatarUrl(image: string | undefined, username: string | undefined) {
  return image
    ? image + "&thumb=100x100&cache=default"
    : `https://api.dicebear.com/9.x/initials/svg?seed=${username}`;
}
