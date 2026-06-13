import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  Table,
  Thead,
  Tr,
  Td,
  Th,
  Tbody,
  Button,
  Spacer,
  Text,
  Img,
  keyframes,
  Box,
  Badge,
} from "@chakra-ui/react";
import { Flex, Image, useColorModeValue } from "@chakra-ui/react";
import { DateTime } from "luxon";
import toaster from "react-hot-toast";

import {
  Collections,
  MatchesResponse,
  PredictionsResponse,
  ResultsResponse,
  TournamentsResponse,
  UsersResponse,
} from "@/pocketbase-types";
import { pb } from "@/pb";
import Loading from "@/components/Loading";
import { getCountryCode } from "@/countries";
import BottomNav from "@/components/BottomNav";
import { queryClient } from "@/queryClient";

export const Route = createFileRoute(
  "/tournaments/$tournamentId/matches/$matchId",
)({
  component: SingleMatch,
});

const isAdmin = false;

const rise = keyframes`
  from { opacity: 0; transform: translateY(14px); }
  to { opacity: 1; transform: translateY(0); }
`;

const MEDALS = ["🥇", "🥈", "🥉"];

function SingleMatch() {
  const { matchId, tournamentId } = Route.useParams();
  const cardBg = useColorModeValue("white", "gray.800");
  const cardBorder = useColorModeValue("blackAlpha.100", "whiteAlpha.200");
  const cardShadow = useColorModeValue(
    "0 12px 30px -14px rgba(26, 70, 50, 0.25)",
    "0 12px 30px -14px rgba(0, 0, 0, 0.6)"
  );
  const mutedText = useColorModeValue("gray.500", "gray.400");
  const scoreBg = useColorModeValue("gray.50", "whiteAlpha.50");
  const dividerColor = useColorModeValue("blackAlpha.100", "whiteAlpha.100");
  const tableHeaderBg = useColorModeValue("gray.50", "whiteAlpha.50");
  const green = useColorModeValue("green.50", "rgba(56, 161, 105, 0.12)");
  const yellow = useColorModeValue("yellow.50", "rgba(214, 158, 46, 0.12)");
  const red = useColorModeValue("red.50", "rgba(229, 62, 62, 0.08)");

  const { data: tournament, isLoading } = useQuery({
    queryKey: ["get-one", Collections.Tournaments, tournamentId],
    queryFn: () =>
      pb
        .collection(Collections.Tournaments)
        .getOne<TournamentsResponse>(tournamentId),
  });

  const { data: match, isLoading: isLoadingM } = useQuery({
    queryKey: ["get-one", Collections.Matches, matchId],
    queryFn: () =>
      pb.collection(Collections.Matches).getOne<MatchesResponse>(matchId),
  });

  const { data: users = [], isLoading: isLoadingU } = useQuery({
    queryKey: ["get-all", Collections.Users],
    queryFn: () =>
      pb.collection(Collections.Users).getFullList<UsersResponse>({
        filter: 'ignore!=true'
      }),
  });

  const { data: results = [], isLoading: isLoadingP } = useQuery({
    queryKey: ["get-all", Collections.Results, matchId],
    queryFn: () =>
      pb
        .collection(Collections.Results)
        .getFullList<
          ResultsResponse<
            number,
            { user: UsersResponse; prediction_id: PredictionsResponse }
          >
        >({
          filter: `match_id = '${matchId}'`,
          expand: "user,prediction_id",
          sort: "-points",
        }),
  });

  const { mutate: onDelete } = useMutation({
    mutationFn: (id: string) =>
      pb.collection(Collections.Predictions).delete(id),
    onError(e) {
      toaster.error(e.message);
    },
    onSuccess() {
      toaster.success("deleted");
      queryClient.invalidateQueries({
        queryKey: ["get-all", Collections.Results, matchId],
      });
    },
  });

  const total = users.length;
  const homeper = Math.floor(
    (100 * results.filter((p) => p.p_home > p.p_away).length) / total,
  );
  const awayper = Math.floor(
    (100 * results.filter((p) => p.p_home < p.p_away).length) / total,
  );
  const tieper = Math.floor(
    (100 * results.filter((p) => p.p_home === p.p_away).length) / total,
  );

  if (isLoading || isLoadingM || isLoadingP || isLoadingU) return <Loading />;

  if (!match) return <Text>something went wrong</Text>;

  // Medal map: results are sorted by -points, first 3 with points > 0 get medals
  const medalMap = new Map<string, string>();
  results.slice(0, 3).forEach((result, i) => {
    if ((result.points ?? 0) > 0 && result.expand?.user?.id) {
      medalMap.set(result.expand.user.id, MEDALS[i]);
    }
  });

  return (
    <>
      <Text fontSize="sm" color={mutedText} fontWeight="medium" px="1">
        {tournament?.name}
      </Text>

      {/* Scoreboard card */}
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
        <Box h="3px" bgGradient="linear(to-r, green.400, green.500, green.400)" />

        <Flex flexDir="column" p="5" gap="4">
          {/* Teams + score */}
          <Flex alignItems="center" gap="3">
            {/* Home team */}
            <Flex flex="1" flexDir="column" alignItems="center" gap="2">
              <Image
                w="52px"
                h="52px"
                src={`https://flagsapi.com/${getCountryCode(match.home)}/flat/64.png`}
                filter="drop-shadow(0 4px 8px rgba(0,0,0,0.18))"
              />
              <Text fontWeight="semibold" fontSize="sm" textAlign="center" letterSpacing="tight" noOfLines={2}>
                {match.home}
              </Text>
              <Text fontSize="xs" color={mutedText} fontFamily="monospace">
                {homeper}%
              </Text>
            </Flex>

            {/* Score box */}
            <Flex flexDir="column" alignItems="center" gap="1" flexShrink={0}>
              <Flex
                alignItems="center"
                gap="1"
                bg={scoreBg}
                borderRadius="xl"
                px="4"
                py="2"
                border="1px solid"
                borderColor={dividerColor}
              >
                <Text fontWeight="bold" fontSize="2xl" fontFamily="monospace" minW="9" textAlign="center">
                  {match.homeScore ?? "—"}
                </Text>
                <Text fontSize="sm" color={mutedText} fontWeight="semibold">
                  :
                </Text>
                <Text fontWeight="bold" fontSize="2xl" fontFamily="monospace" minW="9" textAlign="center">
                  {match.awayScore ?? "—"}
                </Text>
              </Flex>
              <Text fontSize="xs" color={mutedText} fontFamily="monospace">
                {tieper}% empate
              </Text>
            </Flex>

            {/* Away team */}
            <Flex flex="1" flexDir="column" alignItems="center" gap="2">
              <Image
                w="52px"
                h="52px"
                src={`https://flagsapi.com/${getCountryCode(match.away)}/flat/64.png`}
                filter="drop-shadow(0 4px 8px rgba(0,0,0,0.18))"
              />
              <Text fontWeight="semibold" fontSize="sm" textAlign="center" letterSpacing="tight" noOfLines={2}>
                {match.away}
              </Text>
              <Text fontSize="xs" color={mutedText} fontFamily="monospace">
                {awayper}%
              </Text>
            </Flex>
          </Flex>

          {/* Date / location */}
          <Flex
            flexDir="column"
            alignItems="center"
            gap="0.5"
            pt="3"
            borderTop="1px solid"
            borderColor={dividerColor}
          >
            <Text color={mutedText} fontSize="sm" fontWeight="medium">
              {DateTime.fromSQL(match.startAtUtc).toFormat("EEE, MMM dd · h:mm a")}
            </Text>
            <Text color={mutedText} fontSize="xs">
              {match.location} · {DateTime.fromSQL(match.startAtUtc).toRelative()}
            </Text>
          </Flex>
        </Flex>
      </Flex>

      {/* Results table */}
      <Flex flexDir="column" flex="1" overflow="auto">
        <Flex
          flexDir="column"
          bg={cardBg}
          borderRadius="2xl"
          border="1px solid"
          borderColor={cardBorder}
          boxShadow={cardShadow}
          animation={`${rise} 0.5s ease-out 0.08s backwards`}
        >
          <Box px="4" py="3" borderBottom="1px solid" borderColor={dividerColor}>
            <Text fontWeight="semibold" fontSize="sm" letterSpacing="tight">
              Predicciones
            </Text>
          </Box>
          <Box overflowX="auto">
            <Table size="sm">
              <Thead>
                <Tr bg={tableHeaderBg}>
                  <Th py="3" fontSize="xs" color={mutedText} fontWeight="semibold">
                    Participante
                  </Th>
                  <Th py="3" fontSize="xs" color={mutedText} fontWeight="semibold" textAlign="center">
                    Pred
                  </Th>
                  <Th py="3" fontSize="xs" color={mutedText} fontWeight="semibold" textAlign="center">
                    Pts
                  </Th>
                </Tr>
              </Thead>
              <Tbody>
                {users.map((user) => {
                  const result = results.find((p) => p.expand?.user.id === user.id);
                  const medal = medalMap.get(user.id);
                  const pts = result?.points;
                  const rowBg = pts === 3 ? green : pts === 1 ? yellow : red;

                  return (
                    <Tr bg={rowBg} key={user.id} transition="background 0.15s ease">
                      <Td py="2.5">
                        <Flex gap="2.5" alignItems="center">
                          <Img
                            rounded="full"
                            w="36px"
                            h="36px"
                            flexShrink={0}
                            src={
                              user.img
                                ? user.img + "&thumb=40x40"
                                : `https://api.dicebear.com/9.x/initials/svg?seed=${user.username}`
                            }
                          />
                          <Flex flexDir="column" gap="0">
                            <Flex alignItems="center" gap="1">
                              {medal && (
                                <Text fontSize="sm" lineHeight="1">
                                  {medal}
                                </Text>
                              )}
                              <Link
                                to="/tournaments/$tournamentId/$userId"
                                params={{ tournamentId, userId: user.id }}
                              >
                                <Text
                                  fontSize="sm"
                                  fontWeight="medium"
                                  letterSpacing="tight"
                                  _hover={{ color: "green.500" }}
                                  transition="color 0.15s ease"
                                >
                                  {user.name}
                                </Text>
                              </Link>
                            </Flex>
                            {result?.expand?.prediction_id?.created && (
                              <Text fontSize="xs" color={mutedText}>
                                {DateTime.fromSQL(
                                  result.expand.prediction_id.created,
                                ).toFormat("MMM dd, h:mm a")}
                              </Text>
                            )}
                          </Flex>
                        </Flex>
                      </Td>
                      <Td py="2.5" textAlign="center">
                        <Text fontFamily="monospace" fontSize="sm" fontWeight="semibold">
                          {result ? `${result.p_home} - ${result.p_away}` : "—"}
                        </Text>
                      </Td>
                      <Td py="2.5" textAlign="center">
                        {pts != null ? (
                          <Badge
                            borderRadius="full"
                            px="2"
                            py="0.5"
                            fontSize="xs"
                            fontWeight="bold"
                            colorScheme={pts === 3 ? "green" : pts === 1 ? "yellow" : "red"}
                          >
                            {pts}
                          </Badge>
                        ) : (
                          <Text fontSize="sm" color={mutedText}>
                            —
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

      {isAdmin ? (
        <Flex flexDir="column">
          {results.map((p) => (
            <Flex
              key={p.id}
              gap="3"
              p="1"
              borderTop="1px solid"
              borderColor="gray.100"
            >
              {p.prediction_id} -{p.expand?.user.name} - {p.p_home} {p.p_away}
              <Spacer />
              <Button
                onClick={() => onDelete(p.prediction_id)}
                colorScheme="red"
                size="sm"
              >
                delete
              </Button>
            </Flex>
          ))}
        </Flex>
      ) : null}
      <BottomNav tournamentId={tournamentId} />
    </>
  );
}
