import { useQuery } from "@tanstack/react-query";
import {
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
  const green = useColorModeValue("green.100", "green.800");
  const red = useColorModeValue("red.50", "red.800");
  const cardBg = useColorModeValue("white", "gray.800");
  const cardBorder = useColorModeValue("blackAlpha.100", "whiteAlpha.200");
  const cardShadow = useColorModeValue(
    "0 12px 30px -14px rgba(26, 70, 50, 0.25)",
    "0 12px 30px -14px rgba(0, 0, 0, 0.6)"
  );
  const mutedText = useColorModeValue("gray.500", "gray.400");

  if (isLoading || !user || isLoadingUser) return <Loading />;

  const total = results.reduce((sum, p) => sum + (p.points || 0), 0);
  const perfect_count = results.filter((p) => p.points === 3).length;
  const acertados_count = results.filter((p) => (p.points || 0) > 0).length;

  return (
    <>
      <Flex flexDir="column" flex="1" overflow="auto" gap="3">
        <Flex
          justifyContent="center"
          alignItems="center"
          gap="4"
          p="5"
          bg={cardBg}
          borderRadius="2xl"
          border="1px solid"
          borderColor={cardBorder}
          boxShadow={cardShadow}
          animation={`${rise} 0.5s ease-out`}
        >
          <Image
            rounded="full"
            w="120px"
            h="120px"
            border="3px solid"
            borderColor="green.400"
            boxShadow="0 8px 20px -6px rgba(56, 161, 105, 0.55)"
            src={
              user.img
                ? user.img + "&thumb=120x120"
                : `https://api.dicebear.com/9.x/initials/svg?seed=${user.username}`
            }
          />
          <Flex flexDir="column" gap="1">
            <Heading size="md" letterSpacing="tight">
              {user.name}
            </Heading>
            <Text fontSize="lg" fontWeight="semibold">
              ❗️ {total} puntos
            </Text>
            <Text fontSize="sm" color={mutedText}>
              ✅ {acertados_count} - partidos acertados
            </Text>
            <Text fontSize="sm" color={mutedText}>
              🙌 {perfect_count} - partidos perfectos
            </Text>
          </Flex>
        </Flex>
        <Flex flexDir="column" flex="1" overflow="auto">
          <Flex
            flexDir="column"
            bg={cardBg}
            borderRadius="2xl"
            border="1px solid"
            borderColor={cardBorder}
            boxShadow={cardShadow}
            overflow="hidden"
            animation={`${rise} 0.5s ease-out 0.08s backwards`}
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
                  return (
                    <Tr
                      bg={
                        result?.points === 3
                          ? green
                          : result?.points === 1
                            ? undefined
                            : red
                      }
                      key={result.id}
                    >
                      <Td>
                        <Link
                          to="/tournaments/$tournamentId/matches/$matchId"
                          params={{ tournamentId, matchId: result.match_id }}
                        >
                          <Button
                            size="xs"
                            variant="outline"
                            colorScheme="green"
                            borderRadius="lg"
                            _hover={{ transform: "translateY(-1px)" }}
                            _active={{ transform: "translateY(0) scale(0.98)" }}
                            transition="all 0.15s ease-out"
                          >
                            ver
                          </Button>
                        </Link>
                      </Td>
                      <Td>
                        <Image
                          src={`https://flagsapi.com/${getCountryCode(result.expand?.match_id.home)}/flat/32.png`}
                        />
                      </Td>
                      <Td>{result?.p_home ?? "-"}</Td>
                      <Td>{result?.p_away ?? "-"}</Td>
                      <Td>
                        <Image
                          src={`https://flagsapi.com/${getCountryCode(result.expand?.match_id.away)}/flat/32.png`}
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
      </Flex>
      <BottomNav tournamentId={tournamentId} />
    </>
  );
}
