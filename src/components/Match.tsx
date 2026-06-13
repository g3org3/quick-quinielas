import toaster from "react-hot-toast";
import {
  Avatar,
  AvatarGroup,
  Badge,
  Box,
  Button,
  Flex,
  Img,
  Input,
  Text,
  keyframes,
  useColorModeValue,
} from "@chakra-ui/react";
import { DateTime } from "luxon";
import { Link } from "@tanstack/react-router";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  Collections,
  MatchBetsResponse,
  MatchesResponse,
  PredictionsRecord,
  PredictionsResponse,
  UsersResponse,
} from "@/pocketbase-types";
import { getCountryCode } from "@/countries";
import { pb } from "@/pb";

const rise = keyframes`
  from { opacity: 0; transform: translateY(14px); }
  to { opacity: 1; transform: translateY(0); }
`;

interface Props {
  bet?: MatchBetsResponse<number, number, number>;
  match: MatchesResponse;
  tournamentId: string;
}

export default function Match({ match, tournamentId, bet }: Props) {
  const cardBg = useColorModeValue("white", "gray.800");
  const cardBorder = useColorModeValue("blackAlpha.100", "whiteAlpha.200");
  const cardShadow = useColorModeValue(
    "0 12px 30px -14px rgba(26, 70, 50, 0.25)",
    "0 12px 30px -14px rgba(0, 0, 0, 0.6)"
  );
  const mutedText = useColorModeValue("gray.500", "gray.400");
  const inputBorder = useColorModeValue("gray.300", "whiteAlpha.300");
  const dividerColor = useColorModeValue("blackAlpha.100", "whiteAlpha.100");
  const disabledBg = useColorModeValue("gray.50", "whiteAlpha.50");
  const ghostHoverBg = useColorModeValue("green.50", "rgba(56, 161, 105, 0.1)");

  const { mutate, isPending } = useMutation({
    mutationFn: (prediction: PredictionsRecord) =>
      pb.collection(Collections.Predictions).create(prediction),
    onSuccess() {
      toaster.success("saved");
    },
    onError(err) {
      toaster.error("Something went wrong: " + err.message);
    },
  });

  const { mutate: update, isPending: uisPending } = useMutation({
    mutationFn: (params: { id: string; prediction: PredictionsRecord }) =>
      pb
        .collection(Collections.Predictions)
        .update(params.id, params.prediction),
    onSuccess() {
      toaster.success("saved");
    },
    onError(err) {
      toaster.error("Something went wrong: " + err.message);
    },
  });

  const { data, isLoading } = useQuery({
    queryKey: [
      "get-one",
      Collections.Predictions,
      `${pb.authStore.model?.id}-${match.id}`,
    ],
    queryFn: () =>
      pb.collection(Collections.Predictions).getFullList<PredictionsResponse>({
        filter: `user = '${pb.authStore.model?.id}' && match = '${match.id}'`,
      }),
  });

  const { data: bets = [] } = useQuery({
    queryKey: ["get-all", Collections.Predictions, match.id],
    queryFn: () =>
      pb
        .collection(Collections.Predictions)
        .getFullList<PredictionsResponse<{ user: UsersResponse }>>({
          filter: `match = '${match.id}'`,
          expand: "user",
        }),
  });

  const betUsers = bets.map((b) => ({
    id: b.id,
    img: b.expand?.user.img ? b.expand?.user.img + "&thumb=20x20" : "",
  }));

  const prediction = data && data[0]?.id ? data[0] : null;
  const home = data && data[0] ? data[0].homeScore.toString() : "";
  const away = data && data[0] ? data[0].awayScore.toString() : "";

  const onUpdate: React.FormEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();
    if (isPending) return;

    if (
      DateTime.now().toMillis() > DateTime.fromSQL(match.startAtUtc).toMillis()
    ) {
      toaster.error("Ya ha empezado el partido!");
      return;
    }
    const data = new FormData(e.currentTarget);
    const form: Record<string, number> = {};
    for (const [key, value] of data.entries()) {
      form[key] = Number(value) || 0;
    }

    const payload: PredictionsRecord = {
      user: pb.authStore.model?.id,
      homeScore: form.home,
      awayScore: form.away,
      match: match.id,
    };
    if (prediction?.id) update({ id: prediction.id, prediction: payload });
    else mutate(payload);
  };

  const isAnyPending = isLoading || isPending || uisPending;
  const matchdate = DateTime.fromSQL(match.startAtUtc);
  const isGameStarted = matchdate.toMillis() <= DateTime.now().toMillis();

  return (
    <form onSubmit={onUpdate}>
      <Flex
        flexDir="column"
        bg={cardBg}
        borderRadius="2xl"
        border="1px solid"
        borderColor={cardBorder}
        boxShadow={cardShadow}
        my="2"
        gap="0"
        animation={`${rise} 0.5s ease-out`}
        overflow="hidden"
      >
        {/* Green accent line */}
        <Box h="3px" bgGradient="linear(to-r, green.400, green.500, green.400)" />

        <Flex flexDir="column" p="4" gap="3">
          {/* Teams + inputs row */}
          <Flex alignItems="center" gap="2">
            {/* Home team */}
            <Flex flex="1" flexDir="column" alignItems="center" gap="1">
              <Img
                w="44px"
                h="44px"
                src={`https://flagsapi.com/${getCountryCode(match.home)}/flat/64.png`}
                filter="drop-shadow(0 2px 6px rgba(0,0,0,0.15))"
              />
              <Text
                fontWeight="semibold"
                fontSize="xs"
                letterSpacing="tight"
                textAlign="center"
                noOfLines={2}
              >
                {match.home}
              </Text>
              <Text color={mutedText} fontFamily="monospace" fontSize="xs">
                {Math.floor((100 * (bet?.home_per || 0)) / 8)}%
              </Text>
            </Flex>

            {/* Score inputs + action, centered */}
            <Flex flexDir="column" alignItems="center" gap="2" flexShrink={0}>
              <Flex alignItems="center" gap="1.5">
                <Input
                  defaultValue={home}
                  disabled={isAnyPending || isGameStarted}
                  name="home"
                  placeholder="—"
                  textAlign="center"
                  w="44px"
                  p="1"
                  fontSize="sm"
                  fontFamily="monospace"
                  fontWeight="semibold"
                  borderRadius="full"
                  borderColor={inputBorder}
                  focusBorderColor="green.400"
                  _focus={{ boxShadow: "0 0 0 3px rgba(56, 161, 105, 0.25)" }}
                  _hover={{ borderColor: "green.300" }}
                  _disabled={{ opacity: 0.5, cursor: "not-allowed", bg: disabledBg }}
                />
                <Text
                  fontSize="xs"
                  color={mutedText}
                  fontWeight="bold"
                  letterSpacing="widest"
                  px="0.5"
                >
                  :
                </Text>
                <Input
                  defaultValue={away}
                  disabled={isAnyPending || isGameStarted}
                  name="away"
                  placeholder="—"
                  textAlign="center"
                  w="44px"
                  p="1"
                  fontSize="sm"
                  fontFamily="monospace"
                  fontWeight="semibold"
                  borderRadius="full"
                  borderColor={inputBorder}
                  focusBorderColor="green.400"
                  _focus={{ boxShadow: "0 0 0 3px rgba(56, 161, 105, 0.25)" }}
                  _hover={{ borderColor: "green.300" }}
                  _disabled={{ opacity: 0.5, cursor: "not-allowed", bg: disabledBg }}
                />
              </Flex>

              {!isGameStarted ? (
                <Button
                  disabled={isAnyPending}
                  type="submit"
                  size="xs"
                  colorScheme="green"
                  borderRadius="full"
                  px="4"
                  bgGradient="linear(to-b, green.400, green.500)"
                  _hover={{
                    bgGradient: "linear(to-b, green.500, green.600)",
                    transform: "translateY(-1px)",
                    boxShadow: "0 8px 18px -6px rgba(56, 161, 105, 0.55)",
                  }}
                  _active={{
                    transform: "translateY(0) scale(0.97)",
                    boxShadow: "none",
                  }}
                  transition="all 0.15s ease-out"
                  fontWeight="semibold"
                >
                  guardar
                </Button>
              ) : (
                <Flex alignItems="center" gap="1.5">
                  <Badge
                    colorScheme="orange"
                    borderRadius="full"
                    px="2"
                    py="0.5"
                    fontSize="2xs"
                    fontWeight="semibold"
                    textTransform="uppercase"
                    letterSpacing="wide"
                  >
                    cerrado
                  </Badge>
                  <Link
                    to="/tournaments/$tournamentId/matches/$matchId"
                    params={{ tournamentId, matchId: match.id }}
                  >
                    <Button
                      size="xs"
                      variant="ghost"
                      colorScheme="green"
                      borderRadius="full"
                      px="3"
                      _hover={{ bg: ghostHoverBg, color: "green.600" }}
                      _active={{ transform: "scale(0.97)" }}
                      transition="all 0.15s ease-out"
                      fontWeight="semibold"
                    >
                      ver →
                    </Button>
                  </Link>
                </Flex>
              )}
            </Flex>

            {/* Away team */}
            <Flex flex="1" flexDir="column" alignItems="center" gap="1">
              <Img
                w="44px"
                h="44px"
                src={`https://flagsapi.com/${getCountryCode(match.away)}/flat/64.png`}
                filter="drop-shadow(0 2px 6px rgba(0,0,0,0.15))"
              />
              <Text
                fontWeight="semibold"
                fontSize="xs"
                letterSpacing="tight"
                textAlign="center"
                noOfLines={2}
              >
                {match.away}
              </Text>
              <Text color={mutedText} fontFamily="monospace" fontSize="xs">
                {Math.floor((100 * (bet?.away_per || 0)) / 8)}%
              </Text>
            </Flex>
          </Flex>

          {/* Divider */}
          <Box borderTop="1px solid" borderColor={dividerColor} />

          {/* Bettors + date */}
          <Flex alignItems="center" gap="3">
            {betUsers.length > 0 ? (
              <AvatarGroup size="sm" max={7} flex="1">
                {betUsers.map((bu) => (
                  <Avatar key={bu.id} src={bu.img} size="sm" />
                ))}
              </AvatarGroup>
            ) : (
              <Text
                fontSize="xs"
                color={mutedText}
                flex="1"
                fontStyle="italic"
              >
                Sin predicciones aún
              </Text>
            )}
            <Flex flexDir="column" alignItems="flex-end" flexShrink={0}>
              <Text color={mutedText} fontSize="xs" fontWeight="medium">
                {matchdate.toFormat("EEE, MMM dd")}
              </Text>
              <Text color={mutedText} fontSize="xs">
                {matchdate.toFormat("h:mm a")} · {matchdate.toRelative()}
              </Text>
            </Flex>
          </Flex>
        </Flex>
      </Flex>
    </form>
  );
}
