import toaster from "react-hot-toast";
import {
  Text,
  Avatar,
  AvatarGroup,
  Button,
  Flex,
  Input,
  useColorModeValue,
  Badge,
} from "@chakra-ui/react";
import { DateTime } from "luxon";
import { Link } from "@tanstack/react-router";
import { useMutation, useQuery } from "@tanstack/react-query";
import { usePostHog } from "@posthog/react";
import { FaEye, FaLock, FaLockOpen, FaSave } from "react-icons/fa";
import {
  Collections,
  MatchBetsResponse,
  MatchesResponse,
  PredictionsRecord,
  PredictionsResponse,
  UsersResponse,
} from "@/pocketbase-types";
import { pb } from "@/pb";
import Flag from "./Flag";
import { useFeatFlags } from "@/featureFlags";

interface Props {
  bet?: MatchBetsResponse<number, number, number>;
  match: MatchesResponse;
  tournamentId: string;
}
export default function Match({ match, tournamentId, bet }: Props) {
  const { fflags } = useFeatFlags();
  const border = useColorModeValue("gray.200", "gray.700");
  const posthog = usePostHog();
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
  const { data = [], isLoading } = useQuery({
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
    bet.expand?.user.img
      ? bet.expand?.user.img + "&thumb=100x100&cache=default"
      : "",
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
    if (prediction?.id) {
      posthog.capture("prediction_updated", {
        match_id: match.id,
        home_team: match.home,
        away_team: match.away,
        predicted_home_score: payload.homeScore,
        predicted_away_score: payload.awayScore,
        tournament_id: tournamentId,
      });
      update({ id: prediction.id, prediction: payload });
    } else {
      posthog.capture("prediction_submitted", {
        match_id: match.id,
        home_team: match.home,
        away_team: match.away,
        predicted_home_score: payload.homeScore,
        predicted_away_score: payload.awayScore,
        tournament_id: tournamentId,
      });
      mutate(payload);
    }
  };

  const isAnyPending = isLoading || isPending || uisPending;
  const matchdate = DateTime.fromSQL(match.startAtUtc);
  const isGameStarted = matchdate.toMillis() <= DateTime.now().toMillis();
  let _points = "";
  let _pointsColor = "red";
  if (data[0] && isGameStarted) {
    if (
      match.homeScore === data[0].homeScore &&
      match.awayScore === data[0].awayScore
    ) {
      _points = "+3";
      _pointsColor = "green";
    } else if (
      (match.homeScore > match.awayScore &&
        data[0].homeScore > data[0].awayScore) ||
      (match.homeScore < match.awayScore &&
        data[0].homeScore < data[0].awayScore) ||
      (match.homeScore === match.awayScore &&
        data[0].homeScore === data[0].awayScore)
    ) {
      _points = "+1";
      _pointsColor = "blue";
    }
  }

  return (
    <form onSubmit={onUpdate}>
      <Flex
        flexDir="column"
        borderBottom="1px solid"
        borderColor={border}
        py="5"
      >
        <Flex alignItems="center" position="relative" gap="3">
          {fflags.show_points ? (
            <Badge
              rounded="full"
              px={2}
              hidden={isLoading}
              colorScheme={_pointsColor}
              position="absolute"
              top={-2}
              right={0}
            >
              {_points}
            </Badge>
          ) : null}
          <Flex flex="1" gap="3" alignItems="center">
            <Flex
              flex="1"
              flexDir="column"
              alignItems="center"
              justifyContent="center"
            >
              <Flag height="40px" country={match.home} />
              {match.home}
              <Flex color="gray.500" fontFamily="monospace">
                {Math.floor((100 * (bet?.home_per || 0)) / 17)}%
              </Flex>
            </Flex>
          </Flex>
          <Flex flexDirection="column" gap={2} alignSelf="flex-start">
            {isGameStarted ? (
              <Flex
                justifyContent="center"
                alignSelf="center"
                alignItems="center"
                gap={1}
                px={3}
                py={0.5}
                rounded="md"
                fontWeight="bold"
                bg="orange.100"
                fontSize="small"
                color="orange.600"
              >
                <FaLock />
                <Text>Cerrado</Text>
              </Flex>
            ) : (
              <Flex
                justifyContent="center"
                alignSelf="center"
                alignItems="center"
                gap={1}
                px={3}
                py={0.5}
                rounded="md"
                fontWeight="bold"
                bg="green.100"
                fontSize="small"
                color="green.600"
              >
                <FaLockOpen />
                <Text>Abierto</Text>
              </Flex>
            )}

            <Flex gap={1}>
              <Input
                defaultValue={home}
                disabled={isAnyPending || isGameStarted}
                border={isGameStarted ? "0" : undefined}
                p="1"
                name="home"
                textAlign="center"
                placeholder="-"
                fontSize="x-large"
                w="50px"
              />
              <Flex color="gray.400" fontSize="x-large">
                -
              </Flex>
              <Input
                defaultValue={away}
                disabled={isAnyPending || isGameStarted}
                border={isGameStarted ? "0" : undefined}
                textAlign="center"
                fontSize="x-large"
                p={1}
                name="away"
                placeholder="-"
                w="50px"
              />
            </Flex>
            {fflags.show_match_score ? (
              <Flex
                gap={1}
                mt="-15px"
                hidden={!isGameStarted}
                alignItems="center"
                justifyContent="center"
              >
                <Badge colorScheme="red">{match.homeScore}</Badge>-
                <Badge colorScheme="red">{match.awayScore}</Badge>
              </Flex>
            ) : null}
          </Flex>
          <Flex flex="1" gap="3" alignItems="center">
            <Flex flex="1" alignItems="center" flexDir="column">
              <Flag height="40px" country={match.away} />
              {match.away}
              <Flex color="gray.500" fontFamily="monospace">
                {Math.floor((100 * (bet?.away_per || 0)) / 17)}%
              </Flex>
            </Flex>
          </Flex>
        </Flex>
        <Flex gap={3} p={1} alignItems="center">
          <Flex flex="1" overflow="auto">
            <AvatarGroup size="md">
              {images.map((imgurl) => (
                <Avatar key={imgurl} src={imgurl} />
              ))}
            </AvatarGroup>
          </Flex>
          {!isGameStarted ? (
            <Button
              disabled={isAnyPending}
              type="submit"
              variant="primary"
              size="sm"
              leftIcon={<FaSave />}
            >
              Guardar
            </Button>
          ) : (
            <Link
              to="/tournaments/$tournamentId/matches/$matchId"
              params={{ tournamentId, matchId: match.id }}
            >
              <Button
                disabled={isAnyPending}
                variant="secondary"
                size="sm"
                leftIcon={<FaEye />}
              >
                Ver resultados
              </Button>
            </Link>
          )}
        </Flex>
        <Flex color="gray.500" display="box" fontSize="14px" textAlign="center">
          {matchdate.toFormat("EEE MMM dd ")} - hora:{" "}
          {matchdate.toFormat("h:mm a")}
          <br />
          {match.location} {" - "}
          {matchdate.toRelative()}
        </Flex>
      </Flex>
    </form>
  );
}
