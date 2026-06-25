import toaster from "react-hot-toast";
import {
  Text,
  Button,
  Flex,
  Input,
  Select,
  useColorModeValue,
  Badge,
} from "@chakra-ui/react";
import { DateTime } from "luxon";
import { Link } from "@tanstack/react-router";
import { QueryKey, useMutation, useQuery } from "@tanstack/react-query";
import { usePostHog } from "@posthog/react";
import { FaEye, FaLock, FaLockOpen, FaSave } from "react-icons/fa";
import {
  Collections,
  MatchBetsResponse,
  MatchesResponse,
  PredictionsFirstGoalFromOptions,
  PredictionsFirstGoalOptions,
  PredictionsRecord,
  PredictionsResponse,
  UsersResponse,
} from "@/pocketbase-types";
import { pb } from "@/pb";
import Flag from "./Flag";
import AvatarListDrawer from "./AvatarListDrawer";
import { useFeatFlag } from "@/featureFlags";
import FeatFlagComponent from "@/components/FeatFlagComponent";
import { queryClient } from "@/queryClient";
import { useEffect, useState } from "react";

interface Props {
  bet?: MatchBetsResponse<number, number, number>;
  match: MatchesResponse;
  tab?: string | null;
  prediction?: PredictionsResponse;
  tournamentId: string;
  getMatchesQueryKey: QueryKey;
  predictionsQueryKey: QueryKey;
}

export default function MatchV2(props: Props) {
  const { match, tournamentId, bet, prediction } = props;
  const border = useColorModeValue("gray.200", "gray.700");
  const posthog = usePostHog();

  // The bonus is active when the user's favorite team is playing this match.
  const favoriteTeam = (pb.authStore.model as UsersResponse | null)
    ?.favorite_team;
  const isBonusActive =
    !!favoriteTeam &&
    (favoriteTeam === match.home || favoriteTeam === match.away);

  const { mutate, isPending } = useMutation({
    mutationFn(prediction: Partial<PredictionsRecord>) {
      return pb.collection(Collections.Predictions).create(prediction);
    },
    onSuccess() {
      queryClient.invalidateQueries({
        queryKey: props.predictionsQueryKey,
      });
      toaster.success("saved");
    },
    onError(err) {
      toaster.error("Something went wrong: " + err.message);
    },
  });
  const { mutate: update, isPending: uisPending } = useMutation({
    mutationFn: (params: {
      id: string;
      prediction: Partial<PredictionsRecord>;
    }) =>
      pb
        .collection(Collections.Predictions)
        .update(params.id, params.prediction),
    onSuccess() {
      toaster.success("saved");
      queryClient.invalidateQueries({
        queryKey: props.predictionsQueryKey,
      });
    },
    onError(err) {
      toaster.error("Something went wrong: " + err.message);
      posthog.captureException(err);
      if (
        confirm(
          "Hubo un problem al guardar. Quisieres refrescar la pagina para arreglarlo?"
        )
      ) {
        window.document.location.reload();
      }
    },
  });

  // CHAPUZ BELOW
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
  const users = bets.map((bet) => ({
    img: bet.expand?.user.img
      ? bet.expand?.user.img + "&thumb=100x100&cache=default"
      : "",
    name: bet.expand?.user.name ?? "",
    updatedAt: bet.updated,
    favoriteTeam: bet.expand?.user.favorite_team,
  }));
  const home = prediction?.homeScore.toString() ?? "";
  const away = prediction?.awayScore.toString() ?? "";

  const onUpdate: React.FormEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();
    if (isPending) return;

    if (
      DateTime.now().toMillis() > DateTime.fromSQL(match.startAtUtc).toMillis()
    ) {
      posthog.capture("try_to_save_after_match_started");
      toaster.error("Ya ha empezado el partido!");
      return;
    }
    const data = new FormData(e.currentTarget);
    // Send "" (not undefined) so picking "Sin definir" clears the field.
    // PocketBase omits undefined values from the update, leaving the old one.
    const firstGoal = data.get("first_goal")?.toString() ?? "";
    const firstGoalFrom = data.get("first_goal_from")?.toString() ?? "";

    const payload: Partial<PredictionsRecord> = {
      user: pb.authStore.model?.id,
      homeScore: Number(data.get("home")) || 0,
      awayScore: Number(data.get("away")) || 0,
      first_goal: firstGoal as PredictionsFirstGoalOptions,
      first_goal_from: firstGoalFrom as PredictionsFirstGoalFromOptions,
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

  const isAnyPending = isPending || uisPending;
  const matchdate = DateTime.fromSQL(match.startAtUtc);
  const [isGameStarted2, setGameStarted] = useState(
    matchdate.toMillis() <= DateTime.now().toMillis()
  );
  useEffect(() => {
    if (isGameStarted2) return;
    const id = setInterval(() => {
      const isGameStarted = matchdate.toMillis() <= DateTime.now().toMillis();
      if (isGameStarted) {
        setGameStarted(true);
      }
    }, 1000);

    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isGameStarted2]);
  let _points = "";
  let _pointsColor = "red";
  // TODO: this should come up from results it seems
  if (prediction && isGameStarted2) {
    if (
      match.homeScore === prediction.homeScore &&
      match.awayScore === prediction.awayScore
    ) {
      _points = isBonusActive ? "+6" : "+3";
      _pointsColor = "green";
    } else if (
      (match.homeScore > match.awayScore &&
        prediction.homeScore > prediction.awayScore) ||
      (match.homeScore < match.awayScore &&
        prediction.homeScore < prediction.awayScore) ||
      (match.homeScore === match.awayScore &&
        prediction.homeScore === prediction.awayScore)
    ) {
      _points = isBonusActive ? "+2" : "+1";
      _pointsColor = "blue";
    }
  }
  const showLimitAvatars = useFeatFlag("show_limit_avatars");

  return (
    <form onSubmit={onUpdate}>
      <Flex
        flexDir="column"
        borderBottom="1px solid"
        borderColor={border}
        bgGradient={
          !isBonusActive
            ? undefined
            : "linear(to-br, red.600, red.900, orange.500)"
        }
        color={isBonusActive ? "whiteAlpha.800" : undefined}
        py="5"
      >
        <Flex alignItems="center" position="relative" gap="3">
          <FeatFlagComponent feature="show_points">
            <Badge
              rounded="full"
              px={2}
              colorScheme={_pointsColor}
              position="absolute"
              top={-2}
              right={0}
            >
              {_points}
            </Badge>
          </FeatFlagComponent>
          <Flex flex="1" gap="3" alignItems="center">
            <Flex
              flex="1"
              flexDir="column"
              alignItems="center"
              justifyContent="center"
            >
              <Flag height="40px" country={match.home} />
              {match.home}
              <Flex
                color={isBonusActive ? "whiteAlpha.800" : undefined}
                fontFamily="monospace"
              >
                {Math.floor((100 * (bet?.home_per || 0)) / 17)}%
              </Flex>
            </Flex>
          </Flex>
          <Flex flexDirection="column" gap={2} alignSelf="flex-start">
            {isGameStarted2 ? (
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
                disabled={isAnyPending || isGameStarted2}
                border={isGameStarted2 ? "0" : undefined}
                p="1"
                name="home"
                textAlign="center"
                placeholder="-"
                fontSize="x-large"
                w="50px"
              />
              <Flex
                color={isBonusActive ? "whiteAlpha.800" : undefined}
                fontSize="x-large"
              >
                -
              </Flex>
              <Input
                defaultValue={away}
                disabled={isAnyPending || isGameStarted2}
                border={isGameStarted2 ? "0" : undefined}
                textAlign="center"
                fontSize="x-large"
                p={1}
                name="away"
                placeholder="-"
                w="50px"
              />
            </Flex>
            <FeatFlagComponent feature="show_match_score">
              <Flex
                gap={1}
                mt="-15px"
                hidden={!isGameStarted2}
                alignItems="center"
                justifyContent="center"
              >
                <Badge colorScheme="red">{match.homeScore}</Badge>-
                <Badge colorScheme="red">{match.awayScore}</Badge>
              </Flex>
            </FeatFlagComponent>
          </Flex>
          <Flex flex="1" gap="3" alignItems="center">
            <Flex flex="1" alignItems="center" flexDir="column">
              <Flag height="40px" country={match.away} />
              {match.away}
              <Flex
                color={isBonusActive ? "whiteAlpha.800" : undefined}
                fontFamily="monospace"
              >
                {Math.floor((100 * (bet?.away_per || 0)) / 17)}%
              </Flex>
            </Flex>
          </Flex>
        </Flex>
        <Flex gap={3} px={1} pb={2} alignItems="center" flexWrap="wrap">
          <Flex flex="1 1 140px" flexDir="column" gap={1} minW={0}>
            <Text fontSize="sm">Primer gol</Text>
            <Select
              name="first_goal"
              defaultValue={prediction?.first_goal ?? ""}
              disabled={isAnyPending || isGameStarted2}
              size="sm"
            >
              <option value="">Sin definir</option>
              <option value={PredictionsFirstGoalOptions.primer_tiempo}>
                Primer tiempo
              </option>
              <option value={PredictionsFirstGoalOptions.segundo_tiempo}>
                Segundo tiempo
              </option>
            </Select>
          </Flex>
          <Flex flex="1 1 140px" flexDir="column" gap={1} minW={0}>
            <Text fontSize="sm">Primer gol de</Text>
            <Select
              name="first_goal_from"
              defaultValue={prediction?.first_goal_from ?? ""}
              disabled={isAnyPending || isGameStarted2}
              size="sm"
            >
              <option value="">Sin definir</option>
              <option value={PredictionsFirstGoalFromOptions.home}>
                {match.home}
              </option>
              <option value={PredictionsFirstGoalFromOptions.away}>
                {match.away}
              </option>
            </Select>
          </Flex>
        </Flex>
        <Flex gap={3} p={1} alignItems="center">
          <Flex flex="1" overflow="auto">
            <AvatarListDrawer
              users={users}
              max={showLimitAvatars ? 3 : undefined}
            />
          </Flex>
          {!isGameStarted2 ? (
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
        <Flex
          color={isBonusActive ? "whiteAlpha.800" : undefined}
          display="box"
          fontSize="14px"
          textAlign="center"
        >
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
