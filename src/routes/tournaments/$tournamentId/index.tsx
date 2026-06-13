import { Box, Button, Flex, Heading, Img, Text, useColorModeValue } from "@chakra-ui/react";
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
  { tab: "tomorrow", label: "Mañana" },
  { tab: "pasado", label: "Pasado" },
] as const;

function HomeTournament() {
  const { tournamentId } = Route.useParams();
  const { tab = "today" } = Route.useSearch();

  const containerBg = useColorModeValue(
    "rgba(255,255,255,0.70)",
    "rgba(12,18,15,0.72)"
  );
  const containerBorder = useColorModeValue("blackAlpha.100", "whiteAlpha.100");
  const containerShadow = useColorModeValue(
    "0 2px 20px -4px rgba(0,0,0,0.08)",
    "0 2px 20px -4px rgba(0,0,0,0.45)"
  );
  const inactiveColor = useColorModeValue("gray.500", "gray.400");
  const inactiveHoverBg = useColorModeValue("green.50", "whiteAlpha.100");
  const mutedText = useColorModeValue("gray.500", "gray.400");
  const logoBg = useColorModeValue("gray.50", "whiteAlpha.50");
  const logoBorder = useColorModeValue("blackAlpha.100", "whiteAlpha.100");

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

  const pillButton = (isActive: boolean) => {
    const base = {
      size: "sm",
      borderRadius: "full",
      px: "4",
      fontWeight: isActive ? "semibold" : "medium",
      bg: isActive ? undefined : "transparent",
      bgGradient: isActive ? "linear(to-br, green.400, green.500)" : undefined,
      color: isActive ? "white" : inactiveColor,
      boxShadow: isActive ? "0 4px 14px -4px rgba(56, 161, 105, 0.65)" : "none",
      _hover: isActive
        ? {
            bgGradient: "linear(to-br, green.500, green.600)",
            transform: "translateY(-1px)",
            boxShadow: "0 6px 18px -4px rgba(56, 161, 105, 0.7)",
          }
        : { bg: inactiveHoverBg, color: "green.500" },
      _active: { transform: "scale(0.96)" },
      transition: "all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)",
    } as const;
    return base;
  };

  return (
    <>
      <Flex alignItems="center" gap="3" px="1">
        {tournament?.logo && (
          <Flex
            w="44px"
            h="44px"
            flexShrink={0}
            alignItems="center"
            justifyContent="center"
            bg={logoBg}
            borderRadius="lg"
            border="1px solid"
            borderColor={logoBorder}
            overflow="hidden"
            p="1.5"
          >
            <Img w="full" h="full" src={tournament.logo} objectFit="contain" />
          </Flex>
        )}
        <Heading size="md" letterSpacing="tight">
          {tournament?.name}
        </Heading>
      </Flex>

      <Box
        borderRadius="2xl"
        bg={containerBg}
        backdropFilter="blur(12px) saturate(160%)"
        border="1px solid"
        borderColor={containerBorder}
        boxShadow={containerShadow}
        overflow="hidden"
        p="1"
      >
        <Flex
          gap="1"
          overflowX="auto"
          sx={{
            "&::-webkit-scrollbar": { display: "none" },
            scrollbarWidth: "none",
          }}
        >
          {dayTabs.map(({ tab: dayTab, label }) => {
            const isActive = tab === dayTab;
            return (
              <Link
                key={dayTab}
                to="/tournaments/$tournamentId"
                params={{ tournamentId }}
                search={{ tab: dayTab }}
              >
                <Button {...pillButton(isActive)}>{label}</Button>
              </Link>
            );
          })}
        </Flex>
      </Box>

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
        {matches.length === 0 && (
          <Flex
            flexDir="column"
            alignItems="center"
            justifyContent="center"
            flex="1"
            gap="3"
            py="12"
          >
            <Text fontSize="5xl" lineHeight="1">
              🥅
            </Text>
            <Flex flexDir="column" alignItems="center" gap="1">
              <Text fontWeight="semibold" letterSpacing="tight">
                No hay partidos
              </Text>
              <Text fontSize="sm" color={mutedText} textAlign="center">
                Prueba otro día para ver los encuentros.
              </Text>
            </Flex>
          </Flex>
        )}
      </Flex>

      <BottomNav state="vaticinios" tournamentId={tournamentId} />
    </>
  );
}
