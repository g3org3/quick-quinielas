import { Box, Button, Flex, Text } from "@chakra-ui/react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useVirtualizer } from "@tanstack/react-virtual";
import { useMemo, useRef } from "react";
import { z } from "zod";

import BottomNav from "@/components/BottomNav";
import MatchV2 from "@/components/MatchV2";
import TournamentLoading from "@/components/TournamentLoading";
import { getMatchesQuery } from "@/api/matches";
import { matchBetsQuery } from "@/api/matchBets";
import { getPredictionsQuery } from "@/api/predictions";
import { queryClient } from "@/queryClient";
import {
  MatchesResponse,
  MatchBetsResponse,
  PredictionsResponse,
} from "@/pocketbase-types";

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

  const matchesQuery = getMatchesQuery(tournamentId, tab);
  const { data: matches } = useSuspenseQuery(matchesQuery);
  const { data: bets } = useSuspenseQuery(matchBetsQuery);
  const predictionsQuery = getPredictionsQuery(tournamentId, tab);
  const { data: predictions } = useSuspenseQuery(predictionsQuery);
  const betsByMatchId = useMemo(
    () => new Map(bets.map((bet) => [bet.match_id, bet])),
    [bets],
  );
  const predictionsByMatchId = useMemo(
    () =>
      new Map(
        predictions.map((prediction) => [prediction.match, prediction]),
      ),
    [predictions],
  );

  return (
    <>
      <Flex
        flexDir="column"
        flex="1"
        minH={0}
        px={4}
        mb={1}
      >
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
        {tab === "todos" ? (
          <VirtualizedMatchList
            matches={matches}
            betsByMatchId={betsByMatchId}
            predictionsByMatchId={predictionsByMatchId}
            tab={tab}
            tournamentId={tournamentId}
          />
        ) : (
          <MatchList
            matches={matches}
            betsByMatchId={betsByMatchId}
            predictionsByMatchId={predictionsByMatchId}
            tab={tab}
            tournamentId={tournamentId}
          />
        )}
      </Flex>
      <BottomNav state="vaticinios" tournamentId={tournamentId} />
    </>
  );
}

type Bet = MatchBetsResponse<number, number, number>;

interface MatchListProps {
  matches: MatchesResponse[];
  betsByMatchId: Map<string, Bet>;
  predictionsByMatchId: Map<string, PredictionsResponse>;
  tab?: string | null;
  tournamentId: string;
}

function EmptyMatchList() {
  return (
    <Flex
      flex="1"
      flexDir="column"
      alignItems="center"
      justifyContent="center"
      gap={2}
      py={12}
    >
      <Text fontSize="4xl" aria-hidden>
        ⚽
      </Text>
      <Text color="text.muted">No hay partidos</Text>
    </Flex>
  );
}

function MatchList({
  matches,
  betsByMatchId,
  predictionsByMatchId,
  tab,
  tournamentId,
}: MatchListProps) {
  if (matches.length === 0) return <EmptyMatchList />;

  return (
    <Flex flexDir="column" flex="1" minH={0} overflow="auto">
      {matches.map((match) => (
        <MatchV2
          key={match.id}
          match={match}
          bet={betsByMatchId.get(match.id)}
          prediction={predictionsByMatchId.get(match.id)}
          tab={tab}
          tournamentId={tournamentId}
        />
      ))}
    </Flex>
  );
}

function VirtualizedMatchList(props: MatchListProps) {
  const { matches, betsByMatchId, predictionsByMatchId, tab, tournamentId } =
    props;
  const scrollRef = useRef<HTMLDivElement>(null);
  const virtualizer = useVirtualizer({
    count: matches.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => 520,
    getItemKey: (index) => matches[index].id,
    overscan: 2,
  });

  if (matches.length === 0) return <EmptyMatchList />;

  return (
    <Box
      ref={scrollRef}
      flex="1"
      minH={0}
      overflowY="auto"
      overscrollBehavior="contain"
    >
      <Box position="relative" h={`${virtualizer.getTotalSize()}px`}>
        {virtualizer.getVirtualItems().map((virtualRow) => {
          const match = matches[virtualRow.index];
          return (
            <Box
              key={match.id}
              ref={virtualizer.measureElement}
              data-index={virtualRow.index}
              position="absolute"
              top={0}
              left={0}
              w="100%"
              transform={`translateY(${virtualRow.start}px)`}
            >
              <MatchV2
                match={match}
                bet={betsByMatchId.get(match.id)}
                prediction={predictionsByMatchId.get(match.id)}
                tab={tab}
                tournamentId={tournamentId}
              />
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}
