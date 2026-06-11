import { Button, Flex, Heading, Text, useColorModeValue } from "@chakra-ui/react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
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
    .enum(["todos", "today", "tomorrow", "ayer", "ante", "pasado"])
    .nullish(),
});

export const Route = createFileRoute("/tournaments/$tournamentId/")({
  component: HomeTournament,
  validateSearch: homeSchema,
});

const dayTabs = [
  { tab: "ante", label: "Ante" },
  { tab: "ayer", label: "Ayer" },
  { tab: "today", label: "Hoy" },
  { tab: "tomorrow", label: "Manana" },
  { tab: "pasado", label: "Pasado" },
] as const;

function HomeTournament() {
  const { tournamentId } = Route.useParams();
  const { tab = 'today' } = Route.useSearch();
  const inactiveColor = useColorModeValue("gray.500", "gray.400");
  const hoverBg = useColorModeValue("green.50", "whiteAlpha.100");
  const mutedText = useColorModeValue("gray.500", "gray.400");

  useEffect(() => {
    localStorage.setItem("tab", JSON.stringify(tab));
  }, [tab]);

  let today =
    tab === "today"
      ? DateTime.now().toUTC()
      : DateTime.now().toUTC().plus({ days: 1 });
  today = tab === "ayer" ? DateTime.now().toUTC().minus({ days: 1 }) : today;
  today = tab === "ante" ? DateTime.now().toUTC().minus({ days: 2 }) : today;
  today = tab === "pasado" ? DateTime.now().toUTC().plus({ days: 2 }) : today;
  const nextDay = today.plus({ days: 1 });
  const todayUtc = `${today.toSQLDate()} 00:00:00Z`;
  const nextDayUtc = `${nextDay.toSQLDate()} 00:00:00Z`;
  let filter = `tournament = '${tournamentId}' && startAtUtc > '${todayUtc}' && startAtUtc < '${nextDayUtc}'`;
  if (tab === "todos") {
    filter = `tournament = '${tournamentId}' && startAtUtc < '${todayUtc}'`;
  }

  const { data: tournament, isLoading: isLoadingTournaments } = useQuery({
    queryKey: ["get-one", Collections.Tournaments, tournamentId],
    queryFn: () =>
      pb
        .collection(Collections.Tournaments)
        .getOne<TournamentsResponse>(tournamentId),
  });

  const { data: matches = [], isLoading: isLoadingMatches } = useQuery({
    queryKey: [
      "get-all",
      Collections.Matches,
      tournamentId,
      `${todayUtc}-${nextDayUtc}`,
    ],
    queryFn: () =>
      pb.collection(Collections.Matches).getFullList<MatchesResponse>({
        filter,
        sort: "startAtUtc",
      }),
  });

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
      <Heading size="md" letterSpacing="tight" textAlign="center">
        {tournament?.name}
      </Heading>
      <Flex gap="1" mt="5" justifyContent="center" overflow="auto">
        {dayTabs.map(({ tab: dayTab, label }) => {
          const isActive = tab === dayTab;
          return (
            <Link
              key={dayTab}
              to="/tournaments/$tournamentId"
              params={{ tournamentId }}
              search={{ tab: dayTab }}
            >
              <Button
                size="sm"
                borderRadius="full"
                fontWeight={isActive ? "semibold" : "medium"}
                variant={isActive ? "solid" : "ghost"}
                color={isActive ? "white" : inactiveColor}
                bgGradient={isActive ? "linear(to-b, green.400, green.500)" : undefined}
                boxShadow={isActive ? "0 8px 18px -8px rgba(56, 161, 105, 0.6)" : undefined}
                _hover={
                  isActive
                    ? { bgGradient: "linear(to-b, green.500, green.600)" }
                    : { bg: hoverBg, color: "green.500" }
                }
                _active={{ transform: "scale(0.97)" }}
                transition="all 0.15s ease-out"
              >
                {label}
              </Button>
            </Link>
          );
        })}
      </Flex>
      <Flex flexDir="column" flex="1" overflow="auto">
        {matches.map((match) => {
          const bet = bets.find((bet) => bet.match_id === match.id);
          return (
            <Match
              key={match.id}
              match={match}
              bet={bet}
              tournamentId={tournamentId}
            />
          );
        })}
        {matches.length === 0 ? (
          <Flex flexDir="column" alignItems="center" gap="1" py="10">
            <Text fontSize="3xl">🥅</Text>
            <Text color={mutedText}>No hay partidos</Text>
          </Flex>
        ) : null}
      </Flex>
      <BottomNav state="vaticinios" tournamentId={tournamentId} />
    </>
  );
}
