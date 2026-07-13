import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import {
  Avatar,
  Box,
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
  loader: async ({ params }) => {
    await queryClient.ensureQueryData(getLeaderboardQuery(params.tournamentId));
  },
});

function Points() {
  const { tournamentId } = Route.useParams();
  const blue = useColorModeValue("blue.100", "blue.800");
  const secondPlaceBorder = useColorModeValue("gray.400", "gray.300");
  const thirdPlaceBorder = useColorModeValue("orange.400", "orange.300");

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
        {podium.length > 0 && (
          <Box px={{ base: 2, sm: 4 }} pt={3} pb={4}>
            <Text fontWeight="bold" mb={3}>
              Podio
            </Text>
            <Grid
              templateColumns={`repeat(${podium.length}, minmax(0, 1fr))`}
              alignItems="end"
              gap={{ base: 1, sm: 3 }}
            >
              {podiumDisplayOrder.map(({ row, position }) => {
                const isFirstPlace = position === 1;
                const isSecondPlace = position === 2;
                const borderColor = isFirstPlace
                  ? "brand.500"
                  : isSecondPlace
                    ? secondPlaceBorder
                    : thirdPlaceBorder;

                return (
                  <Link
                    key={row.id}
                    to="/tournaments/$tournamentId/$userId"
                    params={{ tournamentId, userId: row.user_id }}
                    style={{ display: "block", minWidth: 0 }}
                  >
                    <Flex
                      minW={0}
                      minH={{
                        base: isFirstPlace
                          ? "164px"
                          : isSecondPlace
                            ? "152px"
                            : "144px",
                        sm: isFirstPlace
                          ? "184px"
                          : isSecondPlace
                            ? "172px"
                            : "164px",
                      }}
                      px={{ base: 1, sm: 3 }}
                      py={{ base: 2, sm: 3 }}
                      flexDir="column"
                      alignItems="center"
                      justifyContent="space-between"
                      textAlign="center"
                      rounded="xl"
                      borderWidth={isFirstPlace ? "2px" : "1px"}
                      borderColor={borderColor}
                      bg={
                        pb.authStore.model?.id === row.user_id
                          ? blue
                          : "surface"
                      }
                      boxShadow={
                        isFirstPlace ? "md" : isSecondPlace ? "sm" : "none"
                      }
                    >
                      <Text
                        fontFamily="mono"
                        fontWeight="bold"
                        fontSize={{ base: "md", sm: "lg" }}
                        color={isFirstPlace ? "brand.600" : "text.secondary"}
                      >
                        #{position}
                      </Text>
                      <Avatar
                        size={{
                          base: isFirstPlace ? "md" : "sm",
                          sm: isFirstPlace ? "lg" : "md",
                        }}
                        name={row.expand?.user_id.name}
                        src={getAvatarUrl(
                          row.expand?.user_id.img,
                          row.expand?.user_id.username
                        )}
                      />
                      <Flex
                        minW={0}
                        maxW="100%"
                        alignItems="center"
                        gap={1}
                      >
                        <Text
                          minW={0}
                          fontSize={{ base: "xs", sm: "sm" }}
                          fontWeight="semibold"
                          noOfLines={1}
                        >
                          {row.expand?.user_id.name}
                        </Text>
                        {row.expand?.user_id.favorite_team && (
                          <Flag
                            height="16px"
                            country={row.expand.user_id.favorite_team}
                          />
                        )}
                      </Flex>
                      <Text
                        fontFamily="mono"
                        fontWeight="bold"
                        fontSize={{ base: "md", sm: "lg" }}
                      >
                        {row.points} puntos
                      </Text>
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

function getAvatarUrl(image: string | undefined, username: string | undefined) {
  return image
    ? image + "&thumb=100x100&cache=default"
    : `https://api.dicebear.com/9.x/initials/svg?seed=${username}`;
}
