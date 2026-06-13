import { useQuery } from "@tanstack/react-query";
import {
  Box,
  Badge,
  Flex,
  Heading,
  Image,
  Table,
  Th,
  Td,
  Tr,
  Tbody,
  Thead,
  Text,
  keyframes,
  useColorModeValue,
  Button,
} from "@chakra-ui/react";
import { Link, createFileRoute } from "@tanstack/react-router";

import { pb } from "@/pb";
import {
  Collections,
  MatchesResponse,
  ResultsResponse,
  UsersResponse,
} from "@/pocketbase-types";
import Loading from "@/components/Loading";
import BottomNav from "@/components/BottomNav";
import { getCountryCode } from "@/countries";

export const Route = createFileRoute("/tournaments/$tournamentId/$userId")({
  component: UserPredictions,
});

const rise = keyframes`
  from { opacity: 0; transform: translateY(14px); }
  to { opacity: 1; transform: translateY(0); }
`;

function UserPredictions() {
  const { tournamentId, userId } = Route.useParams();
  const { data: user, isLoading: isLoadingUser } = useQuery({
    queryKey: ["get-one", Collections.Users, userId],
    queryFn: () =>
      pb.collection(Collections.Users).getOne<UsersResponse>(userId),
  });
  const { data: results = [], isLoading } = useQuery({
    queryKey: ["get-all", Collections.Results, tournamentId, userId],
    queryFn: () =>
      pb
        .collection(Collections.Results)
        .getFullList<ResultsResponse<number, { match_id: MatchesResponse }>>({
          filter: `tournament_id = '${tournamentId}' && user = '${userId}' && points > 0`,
          expand: "match_id",
        }),
  });

  const cardBg = useColorModeValue("white", "gray.800");
  const cardBorder = useColorModeValue("blackAlpha.100", "whiteAlpha.200");
  const cardShadow = useColorModeValue(
    "0 12px 30px -14px rgba(26, 70, 50, 0.25)",
    "0 12px 30px -14px rgba(0, 0, 0, 0.6)"
  );
  const mutedText = useColorModeValue("gray.500", "gray.400");
  const dividerColor = useColorModeValue("blackAlpha.100", "whiteAlpha.100");
  const statCardBg = useColorModeValue("gray.50", "whiteAlpha.50");
  const tableHeaderBg = useColorModeValue("gray.50", "whiteAlpha.50");
  const green = useColorModeValue("green.50", "rgba(56, 161, 105, 0.12)");
  const yellow = useColorModeValue("yellow.50", "rgba(214, 158, 46, 0.12)");

  if (isLoading || !user || isLoadingUser) return <Loading />;

  const total = results.reduce((sum, p) => sum + (p.points || 0), 0);
  const perfect_count = results.filter((p) => p.points === 3).length;
  const acertados_count = results.filter((p) => (p.points || 0) > 0).length;

  return (
    <>
      <Flex flexDir="column" flex="1" overflow="auto" gap="3">
        {/* Profile header card */}
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
            {/* Avatar + name */}
            <Flex alignItems="center" gap="4">
              <Image
                rounded="full"
                w="72px"
                h="72px"
                flexShrink={0}
                border="3px solid"
                borderColor="green.400"
                boxShadow="0 8px 20px -6px rgba(56, 161, 105, 0.55)"
                src={
                  user.img
                    ? user.img + "&thumb=120x120"
                    : `https://api.dicebear.com/9.x/initials/svg?seed=${user.username}`
                }
              />
              <Flex flexDir="column" gap="0.5">
                <Heading size="md" letterSpacing="tight">
                  {user.name}
                </Heading>
                <Text fontSize="sm" color={mutedText}>
                  @{user.username}
                </Text>
              </Flex>
            </Flex>

            {/* Stats row */}
            <Flex gap="2">
              <Flex
                flex="1"
                flexDir="column"
                alignItems="center"
                bg={statCardBg}
                borderRadius="xl"
                p="3"
                border="1px solid"
                borderColor={dividerColor}
                gap="0.5"
              >
                <Text
                  fontSize="xl"
                  fontWeight="bold"
                  bgGradient="linear(to-br, green.400, green.600)"
                  bgClip="text"
                >
                  {total}
                </Text>
                <Text fontSize="xs" color={mutedText}>
                  puntos
                </Text>
              </Flex>
              <Flex
                flex="1"
                flexDir="column"
                alignItems="center"
                bg={statCardBg}
                borderRadius="xl"
                p="3"
                border="1px solid"
                borderColor={dividerColor}
                gap="0.5"
              >
                <Text fontSize="xl" fontWeight="bold">
                  {acertados_count}
                </Text>
                <Text fontSize="xs" color={mutedText}>
                  acertados
                </Text>
              </Flex>
              <Flex
                flex="1"
                flexDir="column"
                alignItems="center"
                bg={statCardBg}
                borderRadius="xl"
                p="3"
                border="1px solid"
                borderColor={dividerColor}
                gap="0.5"
              >
                <Text fontSize="xl" fontWeight="bold">
                  {perfect_count}
                </Text>
                <Text fontSize="xs" color={mutedText}>
                  perfectos
                </Text>
              </Flex>
            </Flex>
          </Flex>
        </Flex>

        {/* Predictions table */}
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
                Historial de predicciones
              </Text>
            </Box>
            <Box overflowX="auto">
              <Table size="sm">
                <Thead>
                  <Tr bg={tableHeaderBg}>
                    <Th py="3" fontSize="xs" color={mutedText} fontWeight="semibold">
                      Partido
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
                  {results.map((result) => {
                    const rowBg = result?.points === 3 ? green : result?.points === 1 ? yellow : undefined;
                    return (
                      <Tr bg={rowBg} key={result.id} transition="background 0.15s ease">
                        <Td py="2.5">
                          <Flex alignItems="center" gap="2" flexWrap="nowrap">
                            <Link
                              to="/tournaments/$tournamentId/matches/$matchId"
                              params={{ tournamentId, matchId: result.match_id }}
                            >
                              <Button
                                size="xs"
                                variant="outline"
                                colorScheme="green"
                                borderRadius="lg"
                                flexShrink={0}
                                _hover={{ transform: "translateY(-1px)" }}
                                _active={{ transform: "translateY(0) scale(0.98)" }}
                                transition="all 0.15s ease-out"
                              >
                                ver
                              </Button>
                            </Link>
                            <Flex alignItems="center" gap="1.5" overflow="hidden">
                              <Image
                                w="18px"
                                h="18px"
                                flexShrink={0}
                                src={`https://flagsapi.com/${getCountryCode(result.expand?.match_id.home)}/flat/32.png`}
                              />
                              <Text fontSize="xs" color={mutedText} noOfLines={1} maxW="44px">
                                {result.expand?.match_id.home}
                              </Text>
                              <Text fontSize="xs" color={mutedText} flexShrink={0}>
                                vs
                              </Text>
                              <Text fontSize="xs" color={mutedText} noOfLines={1} maxW="44px">
                                {result.expand?.match_id.away}
                              </Text>
                              <Image
                                w="18px"
                                h="18px"
                                flexShrink={0}
                                src={`https://flagsapi.com/${getCountryCode(result.expand?.match_id.away)}/flat/32.png`}
                              />
                            </Flex>
                          </Flex>
                        </Td>
                        <Td py="2.5" textAlign="center">
                          <Text fontFamily="monospace" fontSize="sm" fontWeight="semibold">
                            {result.p_home} - {result.p_away}
                          </Text>
                        </Td>
                        <Td py="2.5" textAlign="center">
                          <Badge
                            borderRadius="full"
                            px="2"
                            py="0.5"
                            fontSize="xs"
                            fontWeight="bold"
                            colorScheme={result.points === 3 ? "green" : "yellow"}
                          >
                            {result.points}
                          </Badge>
                        </Td>
                      </Tr>
                    );
                  })}
                </Tbody>
              </Table>
            </Box>
          </Flex>
        </Flex>
      </Flex>
      <BottomNav tournamentId={tournamentId} />
    </>
  );
}
