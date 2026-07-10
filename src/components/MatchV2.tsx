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
  DarkMode,
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
import FeatFlagComponent from "@/components/FeatFlagComponent";
import {
  getMatchPredictionsQuery,
  useCreatePrediction,
  useUpdatePrediction,
} from "@/api/predictions";
import { useUserQuery } from "@/api/users";
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

  // const { data: allUsers = [] } = useQuery(usersQuery);
  const totalUsers = 12;
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
  const [nowTick, setNowTick] = useState(() => DateTime.now().toMillis());
  useEffect(() => {
    if (isGameStarted2) return;
    const id = setInterval(() => {
      const nowMs = DateTime.now().toMillis();
      if (matchdate.toMillis() <= nowMs) {
        setGameStarted(true);
      }
      // Only re-render when the minute bucket changes to keep the countdown cheap.
      setNowTick((prev) =>
        Math.floor(nowMs / 60000) !== Math.floor(prev / 60000) ? nowMs : prev
      );
    }, 1000);

    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isGameStarted2]);

  // "Empieza en …": minutes under an hour, hours under a day, nothing beyond.
  const minutesUntilStart = Math.ceil((matchdate.toMillis() - nowTick) / 60000);
  let startsInLabel = "";
  if (!isGameStarted2 && minutesUntilStart > 0) {
    if (minutesUntilStart < 60) {
      startsInLabel = `Empieza en ${minutesUntilStart} min`;
    } else if (minutesUntilStart < 60 * 24) {
      startsInLabel = `Empieza en ${Math.round(minutesUntilStart / 60)} h`;
    }
  }
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
        p={4}
      >
        <Flex
          alignItems="center"
          justifyContent="space-between"
          gap={2}
          px={2}
          pb={3}
        >
          <PhaseBadge roundNumber={match.roundNumber} />
          <Flex
            flexDir="column"
            alignItems="center"
            textAlign="center"
            minW={0}
            color={_isBonusActive ? "whiteAlpha.800" : "text.muted"}
            fontSize="xs"
          >
            <Text noOfLines={1}>
              {matchdate.toFormat("EEE dd MMM, h:mm a")}
            </Text>
            <Text noOfLines={1}>{match.location}</Text>
          </Flex>
          <Flex flexDir="column" alignItems="flex-end" gap={0.5} minW={0}>
            <MatchStatus isClosed={isGameStarted2} onDark={!!_isBonusActive} />
            {startsInLabel ? (
              <Text
                fontSize="xs"
                noOfLines={1}
                color={_isBonusActive ? "whiteAlpha.800" : "text.muted"}
              >
                {startsInLabel}
              </Text>
            ) : null}
          </Flex>
        </Flex>
        <Flex alignItems="center" position="relative" gap="3">
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
          <Flex flexDirection="column" gap={2}>
            <Flex gap={1}>
              <Input
                value={homePrediction}
                onChange={(event) => setHomePrediction(event.target.value)}
                disabled={isAnyPending || isGameStarted2}
                border={isGameStarted2 ? "0" : undefined}
                p="1"
                h="64px"
                name="home"
                inputMode="numeric"
                textAlign="center"
                placeholder="-"
                fontSize="4xl"
                fontWeight="bold"
                aria-label={`Goles de ${match.home}`}
                w="64px"
              />
              <Flex
                alignItems="center"
                color={_isBonusActive ? "whiteAlpha.800" : "text.muted"}
                fontSize="4xl"
              >
                -
              </Flex>
              <Input
                value={awayPrediction}
                onChange={(event) => setAwayPrediction(event.target.value)}
                disabled={isAnyPending || isGameStarted2}
                border={isGameStarted2 ? "0" : undefined}
                textAlign="center"
                fontSize="4xl"
                fontWeight="bold"
                aria-label={`Goles de ${match.away}`}
                p={1}
                h="64px"
                name="away"
                inputMode="numeric"
                placeholder="-"
                w="64px"
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
            total={totalUsers}
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
              onDark={!!prediction?.isBonusActive}
              users={users}
              max={5}
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
              {prediction?.isBonusActive ? (
                <DarkMode>
                  <Button
                    disabled={isAnyPending}
                    variant="secondary"
                    leftIcon={<FaEye />}
                  >
                    Ver resultados
                  </Button>
                </DarkMode>
              ) : (
                <Button
                  disabled={isAnyPending}
                  variant="secondary"
                  leftIcon={<FaEye />}
                >
                  Ver resultados
                </Button>
              )}
            </Link>
          )}
        </Flex>
      </Flex>
    </form>
  );
}
