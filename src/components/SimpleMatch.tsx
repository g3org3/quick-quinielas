import {
  Text,
  Flex,
  Input,
  Select,
  useColorModeValue,
  Badge,
} from "@chakra-ui/react";
import { DateTime } from "luxon";
import { QueryKey } from "@tanstack/react-query";
import { FaLock, FaLockOpen } from "react-icons/fa";
import {
  MatchBetsResponse,
  MatchesResponse,
  PredictionsFirstGoalFromOptions,
  PredictionsFirstGoalOptions,
  PredictionsResponse,
} from "@/pocketbase-types";
import { pb } from "@/pb";
import Flag from "./Flag";
import GameHistoryDrawer from "./GameHistoryDrawer";
import FeatFlagComponent from "@/components/FeatFlagComponent";
import { useUserQuery } from "@/api";
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

export default function SimpleMatch(props: Props) {
  const { match, tournamentId, bet, prediction } = props;
  const border = useColorModeValue("gray.200", "gray.700");

  const { data: user } = useUserQuery(pb.authStore.model?.id);

  const home = prediction?.homeScore.toString() ?? "";
  const away = prediction?.awayScore.toString() ?? "";
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

  return (
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
            <GameHistoryDrawer tournamentId={tournamentId} country={match.home}>
              <Flag height="40px" country={match.home} />
            </GameHistoryDrawer>
            {match.home}
            <Flex
              color={_isBonusActive ? "whiteAlpha.800" : undefined}
              fontFamily="monospace"
            >
              {Math.floor((100 * (bet?.home_per || 0)) / 17)}%
            </Flex>
          </Flex>
        </Flex>
        <Flex flexDirection="column" gap={2} alignSelf="flex-start">
          <Badge alignSelf="center">
            {Number(match.roundNumber) < 4 ? "Fase Groupos" : "16avos"}
          </Badge>
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
              disabled
              border={isGameStarted2 ? "0" : undefined}
              p="1"
              name="home"
              textAlign="center"
              placeholder="-"
              fontSize="x-large"
              w="50px"
            />
            <Flex
              color={_isBonusActive ? "whiteAlpha.800" : undefined}
              fontSize="x-large"
            >
              -
            </Flex>
            <Input
              defaultValue={away}
              disabled
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
            <GameHistoryDrawer tournamentId={tournamentId} country={match.away}>
              <Flag height="40px" country={match.away} />
            </GameHistoryDrawer>
            {match.away}
            <Flex
              color={_isBonusActive ? "whiteAlpha.800" : undefined}
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
            disabled
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
        </Flex>
      </Flex>
      <Flex
        color={_isBonusActive ? "whiteAlpha.800" : undefined}
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
  );
}
