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
  Divider,
  Heading,
  Spacer,
  Text,
  Img,
  keyframes,
  Box,
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

function SingleMatch() {
  const { matchId, tournamentId } = Route.useParams();
  const green = useColorModeValue("green.100", "green.800");
  const yellow = useColorModeValue("yellow.100", "yellow.800");
  const red = useColorModeValue("red.50", "red.800");
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

  return (
    <>
      <Heading size="md" letterSpacing="tight" textAlign="center">
        {tournament?.name}
      </Heading>
      <Flex
        flexDir="column"
        bg={cardBg}
        borderRadius="2xl"
        border="1px solid"
        borderColor={cardBorder}
        boxShadow={cardShadow}
        p="4"
        animation={`${rise} 0.5s ease-out`}
      >
        <Flex alignItems="center" gap="3" mb="3">
          <Flex flex="1" gap="3" alignItems="center">
            <Flex
              flexDir="column"
              flex="1"
              alignItems="center"
              justifyContent="flex-end"
            >
              <Image
                src={`https://flagsapi.com/${getCountryCode(match.home)}/flat/64.png`}
              />
              <Text fontWeight="semibold" letterSpacing="tight">
                {match.home}
              </Text>
              <Text fontFamily="monospace" color={mutedText}>
                {homeper}%
              </Text>
            </Flex>
          </Flex>
          <Flex flexDir="column" alignSelf="flex-end">
            <Flex alignItems="center">
              <Text fontWeight="bold" fontSize="xl" p="1">
                {match.homeScore}
              </Text>
              <Text fontSize="xs" color={mutedText} textTransform="uppercase" letterSpacing="widest">
                vs
              </Text>
              <Text fontWeight="bold" fontSize="xl" p="1">
                {match.awayScore}
              </Text>
            </Flex>
            <br />
            <Text fontFamily="monospace" color={mutedText} textAlign="center">
              {tieper}%
            </Text>
          </Flex>
          <Flex flex="1" gap="3" alignItems="center">
            <Flex flexDir="column" flex="1" alignItems="center">
              <Image
                fallbackSrc="fallbackSrc='https://via.placeholder.com/64'"
                src={`https://flagsapi.com/${getCountryCode(match.away)}/flat/64.png`}
              />
              <Text fontWeight="semibold" letterSpacing="tight">
                {match.away}
              </Text>
              <Text fontFamily="monospace" color={mutedText}>
                {awayper}%
              </Text>
            </Flex>
          </Flex>
        </Flex>
        <Divider borderColor={cardBorder} />
        <Text color={mutedText} pt="1" fontSize="md" textAlign="center">
          {DateTime.fromSQL(match.startAtUtc).toFormat("EEE MMM dd")}
          {" - "}
          {DateTime.fromSQL(match.startAtUtc).toFormat("h:mm a")}
        </Text>
        <Text color={mutedText} fontSize="sm" textAlign="center">
          {match.location} - {DateTime.fromSQL(match.startAtUtc).toRelative()}
        </Text>
      </Flex>
      <Flex flexDir="column" flex="1" overflow="auto">
        <Flex
          flexDir="column"
          bg={cardBg}
          borderRadius="2xl"
          border="1px solid"
          borderColor={cardBorder}
          boxShadow={cardShadow}
          overflow="auto"
          animation={`${rise} 0.5s ease-out 0.08s backwards`}
        >
        <Box overflowX="auto">
          <Table>
            <Thead>
              <Tr>
                <Th>Participante</Th>
                <Th>-</Th>
                <Th>-</Th>
                <Th>pts</Th>
              </Tr>
            </Thead>
            <Tbody>
              {users.map((user) => {
                const result = results.find((p) => p.expand?.user.id === user.id);

                return (
                  <Tr
                    bg={
                      result?.points === 3
                        ? green
                        : result?.points === 1
                          ? yellow
                          : red
                    }
                    key={user.id}
                  >
                    <Td>
                      <Flex gap={2}>
                        <Img
                          rounded="full"
                          w="40px"
                          h="40px"
                          src={
                            user.img
                              ? user.img + "&thumb=40x40"
                              : `https://api.dicebear.com/9.x/initials/svg?seed=${user.username}`
                          }
                        />
                        <Flex flexDir="column">
                          <Link
                            to="/tournaments/$tournamentId/$userId"
                            params={{ tournamentId, userId: user.id }}
                          >
                            {user.name}
                          </Link>
                          <Text color={mutedText}>
                            {result?.expand?.prediction_id?.created
                              ? DateTime.fromSQL(
                                result.expand.prediction_id.created,
                              ).toFormat("MMM dd h:mm a")
                              : null}
                          </Text>
                        </Flex>
                      </Flex>
                    </Td>
                    <Td>{result?.p_home ?? "-"}</Td>
                    <Td>{result?.p_away ?? "-"}</Td>
                    <Td>{result?.points ?? "-"}</Td>
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
