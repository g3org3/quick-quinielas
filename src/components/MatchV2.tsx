import toaster from "react-hot-toast";
import {
  Text,
  Box,
  Button,
  Flex,
  FormControl,
  FormLabel,
  Input,
  Select,
  Badge,
} from "@chakra-ui/react";
import { DateTime } from "luxon";
import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { usePostHog } from "@posthog/react";
import { FaEye, FaSave } from "react-icons/fa";
import {
  MatchBetsResponse,
  MatchesResponse,
  PredictionsFirstGoalFromOptions,
  PredictionsFirstGoalOptions,
  PredictionsPenaltyWinnerOptions,
  PredictionsRecord,
  PredictionsResponse,
} from "@/pocketbase-types";
import { pb } from "@/pb";
import Flag from "./Flag";
import AvatarListDrawer from "./AvatarListDrawer";
import GameHistoryDrawer from "./GameHistoryDrawer";
import { useFeatFlag } from "@/featureFlags";
import FeatFlagComponent from "@/components/FeatFlagComponent";
import {
  getMatchPredictionsQuery,
  useCreatePrediction,
  useUpdatePrediction,
} from "@/api/predictions";
import { useUserQuery, usersQuery } from "@/api/users";
import { useEffect, useState } from "react";
import { PhaseBadge } from "./PhaseBadge";
import { MatchStatus } from "./MatchStatus";
import { VoteBar } from "./VoteBar";
import { countries } from "./countries";

interface Props {
  bet?: MatchBetsResponse<number, number, number>;
  match: MatchesResponse;
  tab?: string | null;
  prediction?: PredictionsResponse;
  tournamentId: string;
}

export default function MatchV2(props: Props) {
  const { match, tournamentId, bet, prediction } = props;
  const border = "border.subtle";
  const posthog = usePostHog();

  const { mutate, isPending } = useCreatePrediction();
  const { mutate: update, isPending: uisPending } = useUpdatePrediction();
  const { data: user } = useUserQuery(pb.authStore.model?.id);

  const { data: allUsers = [] } = useQuery(usersQuery);
  // CHAPUZ BELOW
  const { data: bets = [] } = useQuery(getMatchPredictionsQuery(match.id));
  const users = bets.map((bet) => ({
    img: bet.expand?.user.img
      ? bet.expand?.user.img + "&thumb=100x100&cache=default"
      : "",
    name: bet.expand?.user.name ?? "",
    updatedAt: bet.updated,
    favoriteTeam: bet.expand?.user.favorite_team,
    isBonusActive: bet.isBonusActive,
  }));
  const home = prediction?.homeScore.toString() ?? "";
  const away = prediction?.awayScore.toString() ?? "";
  const [homePrediction, setHomePrediction] = useState(home);
  const [awayPrediction, setAwayPrediction] = useState(away);
  const [penaltyWinner, setPenaltyWinner] = useState<string>(
    prediction?.penalty_winner ?? ""
  );
  const isPredictedTie =
    homePrediction !== "" &&
    awayPrediction !== "" &&
    Number(homePrediction) === Number(awayPrediction);
  const isBonusActive =
    match.roundNumber > 3
      ? user?.favorite_team === match.home || user?.favorite_team === match.away
      : false;

  useEffect(() => {
    setHomePrediction(home);
    setAwayPrediction(away);
    setPenaltyWinner(prediction?.penalty_winner ?? "");
  }, [away, home, prediction?.penalty_winner]);

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
    const penaltyWinner = isPredictedTie
      ? (data.get("penalty_winner")?.toString() ?? "")
      : "";

    const payload: Partial<PredictionsRecord> = {
      user: user?.id,
      homeScore: Number(data.get("home")) || 0,
      awayScore: Number(data.get("away")) || 0,
      first_goal: firstGoal as PredictionsFirstGoalOptions,
      first_goal_from: firstGoalFrom as PredictionsFirstGoalFromOptions,
      penalty_winner: penaltyWinner as PredictionsPenaltyWinnerOptions,
      match: match.id,
      isBonusActive,
    };
    if (isBonusActive) {
      posthog.capture("activated_x2", {
        label: match.home + "-" + match.away,
        favorite_team: user?.favorite_team,
      });
    }
    if (prediction?.id) {
      posthog.capture("prediction_updated", {
        match_id: match.id,
        home_team: match.home,
        away_team: match.away,
        predicted_home_score: payload.homeScore,
        predicted_away_score: payload.awayScore,
        first_goal: payload.first_goal,
        first_goal_from: payload.first_goal_from,
        penalty_winner: payload.penalty_winner,
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
        first_goal: payload.first_goal,
        first_goal_from: payload.first_goal_from,
        penalty_winner: payload.penalty_winner,
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
      _points = prediction.isBonusActive ? "+6" : "+3";
      _pointsColor = "green";
    } else if (
      (match.homeScore > match.awayScore &&
        prediction.homeScore > prediction.awayScore) ||
      (match.homeScore < match.awayScore &&
        prediction.homeScore < prediction.awayScore) ||
      (match.homeScore === match.awayScore &&
        prediction.homeScore === prediction.awayScore)
    ) {
      _points = prediction.isBonusActive ? "+2" : "+1";
      _pointsColor = "blue";
    }
  }
  const showLimitAvatars = useFeatFlag("show_limit_avatars");
  const _isBonusActive = isBonusActive || prediction?.isBonusActive;

  return (
    <form onSubmit={onUpdate}>
      <Flex
        flexDir="column"
        borderBottom="1px solid"
        borderColor={border}
        bgGradient={
          !_isBonusActive
            ? undefined
            : "linear(to-br, red.600, red.900, orange.500)"
        }
        color={_isBonusActive ? "whiteAlpha.800" : undefined}
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
              <GameHistoryDrawer
                tournamentId={tournamentId}
                country={match.home}
              >
                <Flag height="40px" country={match.home} />
              </GameHistoryDrawer>
              <Text fontWeight="semibold" noOfLines={1}>
                {match.home}
              </Text>
            </Flex>
          </Flex>
          <Flex flexDirection="column" gap={2} alignSelf="flex-start">
            <PhaseBadge roundNumber={match.roundNumber} />
            <MatchStatus isClosed={isGameStarted2} onDark={!!_isBonusActive} />

            <Flex gap={1}>
              <Input
                value={homePrediction}
                onChange={(event) => setHomePrediction(event.target.value)}
                disabled={isAnyPending || isGameStarted2}
                border={isGameStarted2 ? "0" : undefined}
                p="1"
                name="home"
                inputMode="numeric"
                textAlign="center"
                placeholder="-"
                fontSize="2xl"
                fontWeight="bold"
                aria-label={`Goles de ${match.home}`}
                w="50px"
              />
              <Flex
                color={_isBonusActive ? "whiteAlpha.800" : "text.muted"}
                fontSize="2xl"
              >
                -
              </Flex>
              <Input
                value={awayPrediction}
                onChange={(event) => setAwayPrediction(event.target.value)}
                disabled={isAnyPending || isGameStarted2}
                border={isGameStarted2 ? "0" : undefined}
                textAlign="center"
                fontSize="2xl"
                fontWeight="bold"
                aria-label={`Goles de ${match.away}`}
                p={1}
                name="away"
                inputMode="numeric"
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
              <GameHistoryDrawer
                tournamentId={tournamentId}
                country={match.away}
              >
                <Flag height="40px" country={match.away} />
              </GameHistoryDrawer>
              <Text fontWeight="semibold" noOfLines={1}>
                {match.away}
              </Text>
            </Flex>
          </Flex>
        </Flex>
        <Box px={2} pt={3} pb={1}>
          <VoteBar
            homeLabel={countries[match.home]?.iso3 ?? match.home}
            awayLabel={countries[match.away]?.iso3 ?? match.away}
            homeCount={bet?.home_per || 0}
            awayCount={bet?.away_per || 0}
            tieCount={bet?.tie_per || 0}
            total={allUsers.length}
            onDark={!!_isBonusActive}
          />
        </Box>
        <Flex gap={3} px={1} pb={2} alignItems="center" flexWrap="wrap">
          <FormControl flex="1 1 140px" minW={0}>
            <FormLabel
              fontSize="xs"
              textTransform="uppercase"
              letterSpacing="wider"
              fontWeight="semibold"
              color={_isBonusActive ? "whiteAlpha.800" : "text.muted"}
              mb={1}
            >
              Primer gol (tiempo)
            </FormLabel>
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
              <option value={PredictionsFirstGoalOptions.tiempo_extra}>
                Tiempo extra
              </option>
            </Select>
          </FormControl>
          <FormControl flex="1 1 140px" minW={0}>
            <FormLabel
              fontSize="xs"
              textTransform="uppercase"
              letterSpacing="wider"
              fontWeight="semibold"
              color={_isBonusActive ? "whiteAlpha.800" : "text.muted"}
              mb={1}
            >
              Primer gol (equipo)
            </FormLabel>
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
          </FormControl>
          <FormControl flex="1 1 140px" minW={0}>
            <FormLabel
              fontSize="xs"
              textTransform="uppercase"
              letterSpacing="wider"
              fontWeight="semibold"
              color={_isBonusActive ? "whiteAlpha.800" : "text.muted"}
              mb={1}
            >
              Penales (ganador)
            </FormLabel>
            <Select
              name="penalty_winner"
              value={isPredictedTie ? penaltyWinner : ""}
              onChange={(event) => setPenaltyWinner(event.target.value)}
              disabled={isAnyPending || isGameStarted2 || !isPredictedTie}
              size="sm"
            >
              <option value="">Sin definir</option>
              <option value={PredictionsPenaltyWinnerOptions.home}>
                {match.home}
              </option>
              <option value={PredictionsPenaltyWinnerOptions.away}>
                {match.away}
              </option>
            </Select>
          </FormControl>
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
                leftIcon={<FaEye />}
              >
                Ver resultados
              </Button>
            </Link>
          )}
        </Flex>
        <Flex
          flexDir="column"
          alignItems="center"
          color={_isBonusActive ? "whiteAlpha.800" : "text.muted"}
          fontSize="sm"
          textAlign="center"
        >
          <Text>
            {matchdate.toRelative()} ·{" "}
            {matchdate.toFormat("EEE dd MMM, h:mm a")}
          </Text>
          <Text fontSize="xs">{match.location}</Text>
        </Flex>
      </Flex>
    </form>
  );
}
