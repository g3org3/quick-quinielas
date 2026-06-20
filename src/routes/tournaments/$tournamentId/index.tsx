import { Button, Flex } from "@chakra-ui/react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect } from "react";
import { queryOptions, useQuery } from "@tanstack/react-query";
import { z } from "zod";
import { DateTime } from "luxon";

import {
  Collections,
  MatchBetsResponse,
  MatchesResponse,
  TournamentsResponse,
} from "@/pocketbase-types";
import { pb } from "@/pb";
import Loading from "@/components/Loading";
import BottomNav from "@/components/BottomNav";
import Match from "@/components/Match";

const homeSchema = z.object({
  tab: z
    .enum(["todos", "today", "tomorrow", "ayer", "ante", "pasado", "proximos"])
    .nullish(),
});

export const Route = createFileRoute("/tournaments/$tournamentId/")({
  component: HomeTournament,
  validateSearch: homeSchema,
});

function HomeTournament() {
  const { tournamentId } = Route.useParams();
  const { tab = "today" } = Route.useSearch();

  useEffect(() => {
    localStorage.setItem("tab", JSON.stringify(tab));
  }, [tab]);

  let today =
    tab === "today" ? DateTime.now() : DateTime.now().plus({ days: 1 });
  today = tab === "ayer" ? DateTime.now().minus({ days: 1 }) : today;
  today = tab === "ante" ? DateTime.now().minus({ days: 2 }) : today;
  today = tab === "pasado" ? DateTime.now().plus({ days: 2 }) : today;
  today = tab === "todos" ? DateTime.now() : today;
  const nextDayUtc = today.plus({ days: 1 }).startOf("day").toUTC().toSQL();
  const todayUtc = today.startOf("day").toUTC().toSQL();
  let filter = `tournament = '${tournamentId}' && startAtUtc >= '${todayUtc}' && startAtUtc < '${nextDayUtc}'`;
  if (tab === "todos") {
    filter = `tournament = '${tournamentId}' && startAtUtc < '${todayUtc}'`;
  }
  if (tab === "proximos") {
    const startat = DateTime.now()
      .plus({ day: 1 })
      .startOf("day")
      .toUTC()
      .toSQL();
    const endat = DateTime.now().plus({ day: 4 }).endOf("day").toUTC().toSQL();
    filter = `tournament = '${tournamentId}' && startAtUtc >= '${startat}' && startAtUtc < '${endat}'`;
  }

  const { data: tournament, isLoading: isLoadingTournaments } = useQuery({
    queryKey: ["get-one", Collections.Tournaments, tournamentId],
    queryFn: () =>
      pb
        .collection(Collections.Tournaments)
        .getOne<TournamentsResponse>(tournamentId),
  });

  const getMatchesQueryOptions = queryOptions({
    queryKey: [
      "get-all",
      Collections.Matches,
      tournamentId,
      tab,
      `${todayUtc}-${nextDayUtc}`,
    ],
    queryFn: () =>
      pb.collection(Collections.Matches).getFullList<MatchesResponse>({
        filter,
        sort: "startAtUtc",
      }),
  });
  const { data: matches = [], isLoading: isLoadingMatches } = useQuery(getMatchesQueryOptions);

  const { data: bets = [] } = useQuery({
    queryKey: ["get-all", Collections.MatchBets],
    queryFn: () =>
      pb
        .collection(Collections.MatchBets)
        .getFullList<MatchBetsResponse<number, number, number>>(),
  });

  if (isLoadingMatches || isLoadingTournaments) return <Loading />;

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
          {tournament?.name}
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
            return (
              <Match
                key={match.id}
                match={match}
                bet={bet}
                tournamentId={tournamentId}
                getMatchesQueryKey={getMatchesQueryOptions.queryKey}
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
