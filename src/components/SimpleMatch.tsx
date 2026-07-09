import {
  Text,
  Flex,
  FormControl,
  FormLabel,
  Input,
  Select,
  Badge,
} from "@chakra-ui/react";
import { DateTime } from "luxon";
import {
  MatchBetsResponse,
  MatchesFirstGoalFromOptions,
  MatchesFirstGoalOptions,
  MatchesResponse,
  PredictionsFirstGoalFromOptions,
  PredictionsResponse,
} from "@/pocketbase-types";
import { pb } from "@/pb";
import Flag from "./Flag";
import GameHistoryDrawer from "./GameHistoryDrawer";
import FeatFlagComponent from "@/components/FeatFlagComponent";
import { useUserQuery } from "@/api/users";
import { useEffect, useRef, useState } from "react";
import { PhaseBadge } from "./PhaseBadge";
import { MatchStatus } from "./MatchStatus";

interface Props {
  bet?: MatchBetsResponse<number, number, number>;
  match: MatchesResponse;
  tab?: string | null;
  prediction?: PredictionsResponse;
  homeScore?: number;
  awayScore?: number;
  firstGoal?: MatchesFirstGoalOptions;
  firstGoalFrom?: MatchesFirstGoalFromOptions;
  tournamentId: string;
}

export default function SimpleMatch(props: Props) {
  const {
    match,
    tournamentId,
    bet,
    prediction,
    homeScore,
    awayScore,
    firstGoal,
    firstGoalFrom,
  } = props;
  const border = "border.subtle";
  const bg = "surface";

  const { data: user } = useUserQuery(pb.authStore.model?.id);

  // Collapse to a compact flags + score row once the user scrolls down.
  const containerRef = useRef<HTMLDivElement>(null);
  const [collapsed, setCollapsed] = useState(false);
  useEffect(() => {
    let scrollParent = containerRef.current?.parentElement ?? null;
    while (scrollParent) {
      const overflowY = getComputedStyle(scrollParent).overflowY;
      if (overflowY === "auto" || overflowY === "scroll") break;
      scrollParent = scrollParent.parentElement;
    }
    if (!scrollParent) return;
    const onScroll = () => setCollapsed(scrollParent.scrollTop > 16);
    onScroll();
    scrollParent.addEventListener("scroll", onScroll, { passive: true });
    return () => scrollParent.removeEventListener("scroll", onScroll);
  }, []);

  const home = homeScore?.toString() ?? "";
  const away = awayScore?.toString() ?? "";
  const isBonusActive =
    match.roundNumber > 3
      ? user?.favorite_team === match.home || user?.favorite_team === match.away
      : false;

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
  const _isBonusActive = isBonusActive || prediction?.isBonusActive;

  if (collapsed) {
    return (
      <Flex
        ref={containerRef}
        position="sticky"
        top="0"
        zIndex={1}
        alignItems="center"
        justifyContent="center"
        gap="4"
        borderBottom="1px solid"
        borderColor={border}
        bg={_isBonusActive ? undefined : bg}
        bgGradient={
          !_isBonusActive
            ? undefined
            : "linear(to-br, red.600, red.900, orange.500)"
        }
        color={_isBonusActive ? "whiteAlpha.800" : undefined}
        py="2"
      >
        <Flag height="32px" country={match.home} />
        <Flex
          alignItems="center"
          gap="2"
          fontFamily="mono"
          fontSize="2xl"
          fontWeight="bold"
        >
          <Text>{home || "-"}</Text>
          <Text>-</Text>
          <Text>{away || "-"}</Text>
        </Flex>
        <Flag height="32px" country={match.away} />
      </Flex>
    );
  }

  return (
    <Flex
      ref={containerRef}
      flexDir="column"
      position="sticky"
      top="0"
      zIndex={1}
      borderBottom="1px solid"
      borderColor={border}
      bg={_isBonusActive ? undefined : bg}
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
            <GameHistoryDrawer tournamentId={tournamentId} country={match.home}>
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
          <PhaseBadge roundNumber={match.roundNumber} />
          <MatchStatus isClosed={isGameStarted2} onDark={!!_isBonusActive} />

          <Flex gap={1}>
            <Input
              defaultValue={home}
              disabled
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
              disabled
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
        </Flex>
        <Flex flex="1" gap="3" alignItems="center">
          <Flex flex="1" alignItems="center" flexDir="column">
            <GameHistoryDrawer tournamentId={tournamentId} country={match.away}>
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
            defaultValue={firstGoal ?? ""}
            disabled
            size="sm"
          >
            <option value="">Sin definir</option>
            <option value={MatchesFirstGoalOptions.primer_tiempo}>
              Primer tiempo
            </option>
            <option value={MatchesFirstGoalOptions.segundo_tiempo}>
              Segundo tiempo
            </option>
            <option value={MatchesFirstGoalOptions.tiempo_extra}>
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
            defaultValue={firstGoalFrom ?? ""}
            disabled
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
  );
}
