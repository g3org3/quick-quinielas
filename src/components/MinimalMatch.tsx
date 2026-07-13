import { Badge, Button, Flex, Text } from "@chakra-ui/react";
import { Link } from "@tanstack/react-router";
import { DateTime } from "luxon";
import { FaEye } from "react-icons/fa";

import {
  MatchesResponse,
  PredictionsResponse,
  ResultsResponse,
} from "@/pocketbase-types";

import Flag from "./Flag";
import { BonusBadge } from "./BonusBadge";
import { PhaseBadge } from "./PhaseBadge";

interface Props {
  match: MatchesResponse;
  prediction?: PredictionsResponse;
  result?: ResultsResponse;
  tournamentId: string;
}

export default function MinimalMatch(props: Props) {
  const { match, prediction, result, tournamentId } = props;
  const matchDate = DateTime.fromSQL(match.startAtUtc);

  return (
    <Flex
      flexDir="column"
      gap={3}
      borderBottom="1px solid"
      borderColor="border.subtle"
      p={4}
    >
      <Flex alignItems="flex-start" justifyContent="space-between" gap={3}>
        <PhaseBadge roundNumber={match.roundNumber} />
        <Flex
          flexDir="column"
          alignItems="flex-end"
          minW={0}
          color="text.muted"
          fontSize="xs"
          textAlign="right"
        >
          <Text noOfLines={1}>
            {matchDate.toFormat("EEE dd MMM")} · {matchDate.toFormat("h:mm a")}
          </Text>
          <Text noOfLines={1}>{match.location}</Text>
        </Flex>
      </Flex>

      <Flex alignItems="center" gap={3}>
        <Flex flex="1" minW={0} flexDir="column" alignItems="center" gap={1}>
          <Flag height="36px" country={match.home} />
          <Text fontWeight="semibold" noOfLines={1} textAlign="center">
            {match.home}
          </Text>
        </Flex>

        <Flex flexDir="column" alignItems="center" gap={1} flexShrink={0}>
          <Flex
            alignItems="center"
            gap={2}
            fontSize="4xl"
            fontWeight="bold"
            lineHeight="shorter"
            aria-label={`Resultado: ${match.home} ${match.homeScore}, ${match.away} ${match.awayScore}`}
          >
            <Text>{match.homeScore}</Text>
            <Text color="text.muted">-</Text>
            <Text>{match.awayScore}</Text>
          </Flex>
          <Flex
            alignItems="center"
            justifyContent="center"
            flexWrap="wrap"
            gap={2}
            color="text.muted"
            fontSize="sm"
          >
            <Text>Tu predicción</Text>
            <Text fontWeight="semibold">
              {prediction
                ? `${prediction.homeScore} - ${prediction.awayScore}`
                : "- - -"}
            </Text>
            {result ? <PredictionOutcomeBadge result={result} /> : null}
            {prediction?.isBonusActive ? <BonusBadge /> : null}
          </Flex>
        </Flex>

        <Flex flex="1" minW={0} flexDir="column" alignItems="center" gap={1}>
          <Flag height="36px" country={match.away} />
          <Text fontWeight="semibold" noOfLines={1} textAlign="center">
            {match.away}
          </Text>
        </Flex>
      </Flex>

      <Flex justifyContent="flex-end">
        <Link
          to="/tournaments/$tournamentId/matches/$matchId"
          params={{ tournamentId, matchId: match.id }}
        >
          <Button size="sm" variant="secondary" leftIcon={<FaEye />}>
            Ver resultados
          </Button>
        </Link>
      </Flex>
    </Flex>
  );
}

function PredictionOutcomeBadge({ result }: { result: ResultsResponse }) {
  if (result.exact_score) {
    return <Badge colorScheme="green">Marcador exacto</Badge>;
  }

  if (result.correct_result) {
    return <Badge colorScheme="yellow">Resultado correcto</Badge>;
  }

  return <Badge colorScheme="red">Sin acierto</Badge>;
}
