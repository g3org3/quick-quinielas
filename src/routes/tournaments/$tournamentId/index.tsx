import { Button, Flex } from "@chakra-ui/react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { z } from "zod";

import BottomNav from "@/components/BottomNav";
import Match from "@/components/Match";
import TournamentLoading from "@/components/TournamentLoading";
import {
  getMatchesQuery,
  getPredictionsQuery,
  getTournamentQuery,
  matchBetsQuery,
} from "@/api";
import { queryClient } from "@/queryClient";

const homeSchema = z.object({
  tab: z.enum(["todos", "ayer", "today", "proximos"]).nullish(),
});

export const Route = createFileRoute("/tournaments/$tournamentId/")({
  component: HomeTournament,
  pendingComponent: TournamentLoading,
  validateSearch: homeSchema,
  loaderDeps: ({ search: { tab } }) => ({ tab }),
  loader: async ({ params, deps }) => {
    await queryClient.ensureQueryData(matchBetsQuery);
    await queryClient.ensureQueryData(getTournamentQuery(params.tournamentId));
    await queryClient.ensureQueryData(
      getMatchesQuery(params.tournamentId, deps.tab),
    );
    await queryClient.ensureQueryData(
      getPredictionsQuery(params.tournamentId, deps.tab),
    );
  },
});

function HomeTournament() {
  const { tournamentId } = Route.useParams();
  const { tab = "today" } = Route.useSearch();

  const { data: tournament } = useSuspenseQuery(
    getTournamentQuery(tournamentId),
  );
  const matchesQuery = getMatchesQuery(tournamentId, tab);
  const { data: matches } = useSuspenseQuery(matchesQuery);
  const { data: bets } = useSuspenseQuery(matchBetsQuery);
  const predictionsQuery = getPredictionsQuery(tournamentId, tab);
  const { data: predictions } = useSuspenseQuery(predictionsQuery);

  return (
    <>
      <Flex
        flexDir="column"
        flex="1"
        overflow="auto"
        px={4}
        mb={1}
        overscrollBehavior="contain"
      >
        <h1
          style={{
            fontWeight: "bold",
            letterSpacing: "2px",
            fontSize: "20px",
            textAlign: "center",
          }}
        >
          {tournament.name}
        </h1>
        <Flex gap="1" mt="5" justifyContent="center">
          <Link
            to="/tournaments/$tournamentId"
            params={{ tournamentId }}
            search={{ tab: "todos" }}
          >
            <Button variant="ghost" isActive={tab === "todos"}>
              Todos
            </Button>
          </Link>
          <Link
            to="/tournaments/$tournamentId"
            params={{ tournamentId }}
            search={{ tab: "ayer" }}
          >
            <Button variant="ghost" isActive={tab === "ayer"}>
              Ayer
            </Button>
          </Link>
          <Link
            to="/tournaments/$tournamentId"
            params={{ tournamentId }}
            search={{ tab: "today" }}
          >
            <Button variant="ghost" isActive={tab === "today"}>
              Hoy
            </Button>
          </Link>
          <Link
            to="/tournaments/$tournamentId"
            params={{ tournamentId }}
            search={{ tab: "proximos" }}
          >
            <Button variant="ghost" isActive={tab === "proximos"}>
              Proximos
            </Button>
          </Link>
        </Flex>
        <Flex flexDir="column" flex="1">
          {matches.map((match) => {
            const bet = bets.find((bet) => bet.match_id === match.id);
            const prediction = predictions.find((p) => p.match === match.id);
            return (
              <Match
                key={match.id}
                match={match}
                bet={bet}
                prediction={prediction}
                tab={tab}
                tournamentId={tournamentId}
                predictionsQueryKey={predictionsQuery.queryKey}
                getMatchesQueryKey={matchesQuery.queryKey}
              />
            );
          })}
          {matches.length === 0 ? <>No hay partidos</> : null}
        </Flex>
      </Flex>
      <BottomNav state="vaticinios" tournamentId={tournamentId} />
    </>
  );
}
