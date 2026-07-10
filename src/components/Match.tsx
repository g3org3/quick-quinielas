import toaster from "react-hot-toast";
import { Text, Button, Flex, Input, Badge } from "@chakra-ui/react";
import { DateTime } from "luxon";
import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { usePostHog } from "@posthog/react";
import { FaEye, FaSave } from "react-icons/fa";
import {
  MatchBetsResponse,
  MatchesResponse,
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
import { MatchStatus } from "./MatchStatus";

interface Props {
  bet?: MatchBetsResponse<number, number, number>;
  match: MatchesResponse;
  tab?: string | null;
  prediction?: PredictionsResponse;
  tournamentId: string;
}

export default function Match(props: Props) {
  const { match, tournamentId, bet, prediction } = props;
  const border = "border.subtle";
  const posthog = usePostHog();

  const { mutate, isPending } = useCreatePrediction();
  const { mutate: update, isPending: uisPending } = useUpdatePrediction();
  const { data: user } = useUserQuery(pb.authStore.model?.id);

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
  const isBonusActive =
    match.roundNumber > 3
      ? user?.favorite_team === match.home || user?.favorite_team === match.away
      : false;

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
    const form: Record<string, number> = {};
    for (const [key, value] of data.entries()) {
      form[key] = Number(value) || 0;
    }
    const payload: Partial<PredictionsRecord> = {
      user: user?.id,
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
              <Text
                color={_isBonusActive ? "whiteAlpha.800" : "text.muted"}
                fontFamily="mono"
                fontSize="xs"
              >
                {Math.floor((100 * (bet?.home_per || 0)) / 17)}% votos
              </Text>
            </Flex>
          </Flex>
          <Flex flexDirection="column" gap={2} alignSelf="flex-start">
            <MatchStatus isClosed={isGameStarted2} onDark={!!_isBonusActive} />

            <Flex gap={1}>
              <Input
                defaultValue={home}
                disabled={isAnyPending || isGameStarted2}
                border={isGameStarted2 ? "0" : undefined}
                p="1"
                name="home"
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
                defaultValue={away}
                disabled={isAnyPending || isGameStarted2}
                border={isGameStarted2 ? "0" : undefined}
                textAlign="center"
                fontSize="2xl"
                fontWeight="bold"
                aria-label={`Goles de ${match.away}`}
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
              <GameHistoryDrawer
                tournamentId={tournamentId}
                country={match.away}
              >
                <Flag height="40px" country={match.away} />
              </GameHistoryDrawer>
              <Text fontWeight="semibold" noOfLines={1}>
                {match.away}
              </Text>
              <Text
                color={_isBonusActive ? "whiteAlpha.800" : "text.muted"}
                fontFamily="mono"
                fontSize="xs"
              >
                {Math.floor((100 * (bet?.away_per || 0)) / 17)}% votos
              </Text>
            </Flex>
          </Flex>
        </Flex>
        <Flex gap={3} p={1} alignItems="center">
          <Flex flex="1" overflow="auto">
            <AvatarListDrawer users={users} max={3} />
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
          flexDir="column"
          alignItems="center"
          color={_isBonusActive ? "whiteAlpha.800" : "text.muted"}
          fontSize="sm"
          textAlign="center"
        >
          <Text>
            {matchdate.toRelative()} · {matchdate.toFormat("EEE dd MMM, h:mm a")}
          </Text>
          <Text fontSize="xs">{match.location}</Text>
        </Flex>
      </Flex>
    </form>
  );
}
