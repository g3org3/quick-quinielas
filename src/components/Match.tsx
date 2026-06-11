import toaster from "react-hot-toast";
import {
  Avatar,
  AvatarGroup,
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
  const images = bets.map((bet) =>
    bet.expand?.user.img ? bet.expand?.user.img + "&thumb=20x20" : "",
  );
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
        p="4"
        my="2"
        gap="2"
        animation={`${rise} 0.5s ease-out`}
      >
        <Flex alignItems="center" gap="3">
          <Flex flex="1" gap="3" alignItems="center">
            <Flex
              flex="1"
              flexDir="column"
              alignItems="center"
              justifyContent="flex-end"
            >
              <Img
                src={`https://flagsapi.com/${getCountryCode(match.home)}/flat/64.png`}
              />
              <Text fontWeight="semibold" letterSpacing="tight">
                {match.home}
              </Text>
              <Text color={mutedText} fontFamily="monospace" fontSize="sm">
                {Math.floor((100 * (bet?.home_per || 0)) / 8)}%
              </Text>
            </Flex>
            <Input
              defaultValue={home}
              disabled={isAnyPending || isGameStarted}
              p="1"
              name="home"
              textAlign="center"
              placeholder="-"
              w="40px"
              borderRadius="lg"
              borderColor={inputBorder}
              focusBorderColor="green.400"
              _hover={{ borderColor: "green.300" }}
            />
          </Flex>
          <Text
            fontSize="xs"
            color={mutedText}
            textTransform="uppercase"
            letterSpacing="widest"
          >
            vs
          </Text>
          <Flex flex="1" gap="3" alignItems="center">
            <Input
              defaultValue={away}
              disabled={isAnyPending || isGameStarted}
              textAlign="center"
              p="1"
              name="away"
              placeholder="-"
              w="40px"
              borderRadius="lg"
              borderColor={inputBorder}
              focusBorderColor="green.400"
              _hover={{ borderColor: "green.300" }}
            />
            <Flex flex="1" alignItems="center" flexDir="column">
              <Img
                src={`https://flagsapi.com/${getCountryCode(match.away)}/flat/64.png`}
              />
              <Text fontWeight="semibold" letterSpacing="tight">
                {match.away}
              </Text>
              <Text color={mutedText} fontFamily="monospace" fontSize="sm">
                {Math.floor((100 * (bet?.away_per || 0)) / 8)}%
              </Text>
            </Flex>
          </Flex>
          {!isGameStarted ? (
            <Button
              disabled={isAnyPending}
              type="submit"
              size="sm"
              colorScheme="green"
              borderRadius="lg"
              bgGradient="linear(to-b, green.400, green.500)"
              _hover={{
                bgGradient: "linear(to-b, green.500, green.600)",
                transform: "translateY(-1px)",
                boxShadow: "0 10px 22px -8px rgba(56, 161, 105, 0.6)",
              }}
              _active={{ transform: "translateY(0) scale(0.98)", boxShadow: "none" }}
              transition="all 0.15s ease-out"
            >
              save
            </Button>
          ) : (
            <Link
              to="/tournaments/$tournamentId/matches/$matchId"
              params={{ tournamentId, matchId: match.id }}
            >
              <Button
                disabled={isAnyPending}
                size="sm"
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
          )}
        </Flex>
        <Flex overflow="auto">
          <AvatarGroup size="md">
            {images.map((imgurl) => (
              <Avatar key={imgurl} src={imgurl} />
            ))}
          </AvatarGroup>
        </Flex>
        <Text color={mutedText} fontSize="sm" textAlign="center">
          {matchdate.toFormat("EEE MMM dd ")} - hora:{" "}
          {matchdate.toFormat("h:mm a")}
          <br />
          {match.location} {" - "}
          {matchdate.toRelative()}
        </Text>
      </Flex>
    </form>
  );
}
