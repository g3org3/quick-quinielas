import toaster from "react-hot-toast";
import {
  Badge,
  Button,
  Flex,
  FormControl,
  FormLabel,
  Input,
  Select,
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
  MatchesFirstGoalFromOptions,
  MatchesFirstGoalOptions,
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
    mutationFn(
      data: Pick<
        MatchesRecord,
        "homeScore" | "awayScore" | "first_goal" | "first_goal_from"
      >,
    ) {
      return pb.collection(Collections.Matches).update(match.id, data);
    },
    onSuccess(_data, score) {
      posthog.capture("admin_match_score_updated", {
        match_id: match.id,
        tournament_id: tournamentId,
        home_team: match.home,
        away_team: match.away,
        home_score: score.homeScore,
        away_score: score.awayScore,
        first_goal: score.first_goal,
        first_goal_from: score.first_goal_from,
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

    const first_goal = data.get("first_goal") as MatchesFirstGoalOptions | "";
    const first_goal_from = data.get(
      "first_goal_from",
    ) as MatchesFirstGoalFromOptions | "";

    mutate({
      homeScore,
      awayScore,
      first_goal: first_goal || undefined,
      first_goal_from: first_goal_from || undefined,
    });
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
        <Flex flex="1 1 320px" direction="column" gap={3} minW={0}>
          <Flex alignItems="center" gap={3} minW={0}>
            <Flex alignItems="center" gap={3} flex="1" minW={0}>
              <Flag height="32px" country={match.home} />
              <Text fontWeight="bold" noOfLines={1}>
                {match.home}
              </Text>
            </Flex>
            <FormControl w="92px" flex="0 0 92px">
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
          </Flex>
          <Flex alignItems="center" gap={3} minW={0}>
            <Flex alignItems="center" gap={3} flex="1" minW={0}>
              <Flag height="32px" country={match.away} />
              <Text fontWeight="bold" noOfLines={1}>
                {match.away}
              </Text>
            </Flex>
            <FormControl w="92px" flex="0 0 92px">
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
        </Flex>

        <Flex width="100%" gap={3} flexWrap="wrap">
          <FormControl flex="1 1 160px" minW={0}>
            <FormLabel fontSize="sm" mb={1} color={muted}>
              Primer gol
            </FormLabel>
            <Select
              name="first_goal"
              defaultValue={match.first_goal ?? ""}
              disabled={isPending}
            >
              <option value="">Sin definir</option>
              <option value={MatchesFirstGoalOptions.primer_tiempo}>
                Primer tiempo
              </option>
              <option value={MatchesFirstGoalOptions.segundo_tiempo}>
                Segundo tiempo
              </option>
            </Select>
          </FormControl>
          <FormControl flex="1 1 160px" minW={0}>
            <FormLabel fontSize="sm" mb={1} color={muted}>
              Primer gol de
            </FormLabel>
            <Select
              name="first_goal_from"
              defaultValue={match.first_goal_from ?? ""}
              disabled={isPending}
            >
              <option value="">Sin definir</option>
              <option value={MatchesFirstGoalFromOptions.home}>
                {match.home}
              </option>
              <option value={MatchesFirstGoalFromOptions.away}>
                {match.away}
              </option>
            </Select>
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
            ml="auto"
          >
            Guardar
          </Button>
        </Flex>
      </Flex>
    </form>
  );
}
