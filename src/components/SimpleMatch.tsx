import {
  Text,
  Box,
  Flex,
  FormControl,
  FormLabel,
  Input,
  Select,
} from "@chakra-ui/react";
import { DateTime } from "luxon";
import {
  MatchBetsResponse,
  MatchesFirstGoalFromOptions,
  MatchesFirstGoalOptions,
  MatchesPenaltyWinnerOptions,
  MatchesResponse,
  PredictionsFirstGoalFromOptions,
  PredictionsResponse,
} from "@/pocketbase-types";
import Flag from "./Flag";
import GameHistoryDrawer from "./GameHistoryDrawer";
import { useEffect, useRef, useState } from "react";
import { PhaseBadge } from "./PhaseBadge";
import { MatchStatus } from "./MatchStatus";
import { VoteBar } from "./VoteBar";
import { countries } from "./countries";

interface Props {
  bet?: MatchBetsResponse<number, number, number>;
  match: MatchesResponse;
  tab?: string | null;
  prediction?: PredictionsResponse;
  homeScore?: number;
  awayScore?: number;
  firstGoal?: MatchesFirstGoalOptions;
  firstGoalFrom?: MatchesFirstGoalFromOptions;
  penaltyWinner?: MatchesPenaltyWinnerOptions;
  tournamentId: string;
}

export default function SimpleMatch(props: Props) {
  const {
    match,
    tournamentId,
    bet,
    homeScore,
    awayScore,
    firstGoal,
    firstGoalFrom,
    penaltyWinner,
  } = props;
  const totalUsers = 12;
  const border = "border.subtle";
  const bg = "surface";

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
        bg={bg}
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
      bg={bg}
      py="5"
    >
      <Flex alignItems="center" justifyContent="space-between" gap={2} px={2} pb={3}>
        <PhaseBadge roundNumber={match.roundNumber} />
        <Flex
          flexDir="column"
          alignItems="center"
          textAlign="center"
          minW={0}
          color="text.muted"
          fontSize="xs"
        >
          <Text noOfLines={1}>{matchdate.toFormat("EEE dd MMM, h:mm a")}</Text>
          <Text noOfLines={1}>{match.location}</Text>
        </Flex>
        <MatchStatus isClosed={isGameStarted2} />
      </Flex>
      <Flex alignItems="center" position="relative" gap="3">
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
          </Flex>
        </Flex>
        <Flex flexDirection="column" gap={2}>
          <Flex gap={1}>
            <Input
              defaultValue={home}
              disabled
              border={isGameStarted2 ? "0" : undefined}
              p="1"
              h="64px"
              name="home"
              textAlign="center"
              placeholder="-"
              fontSize="4xl"
              fontWeight="bold"
              aria-label={`Goles de ${match.home}`}
              w="64px"
            />
            <Flex
              alignItems="center"
              color="text.muted"
              fontSize="4xl"
            >
              -
            </Flex>
            <Input
              defaultValue={away}
              disabled
              border={isGameStarted2 ? "0" : undefined}
              textAlign="center"
              fontSize="4xl"
              fontWeight="bold"
              aria-label={`Goles de ${match.away}`}
              p={1}
              h="64px"
              name="away"
              placeholder="-"
              w="64px"
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
        />
      </Box>
      <Flex gap={3} px={1} pb={2} alignItems="center" flexWrap="wrap">
        <FormControl flex="1 1 140px" minW={0}>
          <FormLabel
            fontSize="xs"
            textTransform="uppercase"
            letterSpacing="wider"
            fontWeight="semibold"
            color="text.muted"
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
            color="text.muted"
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
        <FormControl flex="1 1 140px" minW={0}>
          <FormLabel
            fontSize="xs"
            textTransform="uppercase"
            letterSpacing="wider"
            fontWeight="semibold"
            color="text.muted"
            mb={1}
          >
            Penales (ganador)
          </FormLabel>
          <Select
            name="penalty_winner"
            defaultValue={penaltyWinner ?? ""}
            disabled
            size="sm"
          >
            <option value="">Sin definir</option>
            <option value={MatchesPenaltyWinnerOptions.home}>
              {match.home}
            </option>
            <option value={MatchesPenaltyWinnerOptions.away}>
              {match.away}
            </option>
          </Select>
        </FormControl>
      </Flex>
    </Flex>
  );
}
