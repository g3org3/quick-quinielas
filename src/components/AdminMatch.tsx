import toaster from "react-hot-toast";
import {
  Badge,
  Button,
  Flex,
  FormControl,
  FormLabel,
  Input,
  Text,
  useColorModeValue,
} from "@chakra-ui/react";
import { usePostHog } from "@posthog/react";
import { QueryKey, useMutation } from "@tanstack/react-query";
import { DateTime } from "luxon";
import { FaSave } from "react-icons/fa";

import Flag from "@/components/Flag";
import { pb } from "@/pb";
import {
  Collections,
  MatchesRecord,
  MatchesResponse,
} from "@/pocketbase-types";
import { queryClient } from "@/queryClient";

interface Props {
  match: MatchesResponse;
  queryKey: QueryKey;
  tournamentId: string;
}

export default function AdminMatch({ match, queryKey, tournamentId }: Props) {
  const border = useColorModeValue("gray.200", "gray.700");
  const muted = useColorModeValue("gray.600", "gray.400");
  const posthog = usePostHog();
  const matchDate = DateTime.fromSQL(match.startAtUtc);

  const { mutate, isPending } = useMutation({
    mutationFn(score: Pick<MatchesRecord, "homeScore" | "awayScore">) {
      return pb.collection(Collections.Matches).update(match.id, score);
    },
    onSuccess(_data, score) {
      posthog.capture("admin_match_score_updated", {
        match_id: match.id,
        tournament_id: tournamentId,
        home_team: match.home,
        away_team: match.away,
        home_score: score.homeScore,
        away_score: score.awayScore,
      });
      toaster.success("Marcador guardado");
      queryClient.invalidateQueries({ queryKey });
    },
    onError(err) {
      posthog.capture("admin_match_score_update_failed", {
        match_id: match.id,
        tournament_id: tournamentId,
        home_team: match.home,
        away_team: match.away,
        error: err.message,
      });
      posthog.captureException(err);
      toaster.error("No se pudo guardar el marcador");
    },
  });

  const onSubmit: React.FormEventHandler<HTMLFormElement> = (event) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const rawHomeScore = data.get("homeScore");
    const rawAwayScore = data.get("awayScore");
    const homeScore = Number(rawHomeScore);
    const awayScore = Number(rawAwayScore);

    if (
      rawHomeScore === "" ||
      rawAwayScore === "" ||
      !Number.isFinite(homeScore) ||
      !Number.isFinite(awayScore)
    ) {
      posthog.capture("admin_match_score_update_failed", {
        match_id: match.id,
        tournament_id: tournamentId,
        home_team: match.home,
        away_team: match.away,
        error: "invalid_score",
      });
      toaster.error("Ingresa un marcador valido");
      return;
    }

    mutate({ homeScore, awayScore });
  };

  return (
    <form onSubmit={onSubmit}>
      <Flex
        borderBottom="1px solid"
        borderColor={border}
        py={4}
        px={2}
        gap={3}
        alignItems="flex-start"
        flexWrap="wrap"
      >
        <Flex flex="1 1 220px" direction="column" gap={3} minW={0}>
          <Flex alignItems="center" gap={3} minW={0}>
            <Flag height="32px" country={match.home} />
            <Text fontWeight="bold" noOfLines={1}>
              {match.home}
            </Text>
          </Flex>
          <Flex alignItems="center" gap={3} minW={0}>
            <Flag height="32px" country={match.away} />
            <Text fontWeight="bold" noOfLines={1}>
              {match.away}
            </Text>
          </Flex>
        </Flex>

        <Flex
          direction="column"
          alignItems="stretch"
          gap={2}
          flex="0 0 92px"
          maxW="92px"
        >
          <FormControl>
            <FormLabel fontSize="xs" color={muted} mb={1}>
              Local
            </FormLabel>
            <Input
              type="number"
              min={0}
              name="homeScore"
              defaultValue={match.homeScore}
              disabled={isPending}
              textAlign="center"
              fontWeight="bold"
            />
          </FormControl>
          <FormControl>
            <FormLabel fontSize="xs" color={muted} mb={1}>
              Visita
            </FormLabel>
            <Input
              type="number"
              min={0}
              name="awayScore"
              defaultValue={match.awayScore}
              disabled={isPending}
              textAlign="center"
              fontWeight="bold"
            />
          </FormControl>
        </Flex>

        <Flex
          width="100%"
          alignItems="center"
          justifyContent="space-between"
          gap={3}
          flexWrap="wrap"
        >
          <Flex gap={2} alignItems="center" color={muted} fontSize="sm">
            <Badge colorScheme="blue">#{match.matchNumber}</Badge>
            <Text>{matchDate.toFormat("EEE MMM dd - h:mm a")}</Text>
            <Text>{match.location}</Text>
          </Flex>
          <Button
            type="submit"
            size="sm"
            variant="primary"
            leftIcon={<FaSave />}
            isLoading={isPending}
          >
            Guardar
          </Button>
        </Flex>
      </Flex>
    </form>
  );
}
