import { useState } from "react";
import { Drawer } from "vaul";
import {
  Box,
  Flex,
  Grid,
  GridItem,
  Text,
  useColorModeValue,
} from "@chakra-ui/react";
import { usePostHog } from "@posthog/react";
import { useQuery } from "@tanstack/react-query";
import { DateTime } from "luxon";
import { matchesQuery } from "@/api/matches";
import Flag from "./Flag";

interface Props {
  tournamentId: string;
  country: string;
  children: React.ReactNode;
}

const getCountryResult = (
  match: {
    home: string;
    away: string;
    homeScore: number;
    awayScore: number;
  },
  country: string,
) => {
  const isHome = match.home === country;
  const countryScore = isHome ? match.homeScore : match.awayScore;
  const opponentScore = isHome ? match.awayScore : match.homeScore;
  const opponent = isHome ? match.away : match.home;

  return { countryScore, opponentScore, opponent };
};

export default function GameHistoryDrawer({
  tournamentId,
  country,
  children,
}: Props) {
  const posthog = usePostHog();
  const bg = useColorModeValue("white", "gray.800");
  const itemBorder = useColorModeValue("gray.100", "gray.700");
  const handleColor = useColorModeValue("gray.300", "gray.600");
  const dateColor = useColorModeValue("gray.500", "gray.400");
  const summaryBg = useColorModeValue("gray.50", "gray.700");
  const opponentScoreColor = useColorModeValue("gray.400", "gray.500");

  const [open, setOpen] = useState(false);
  const { data: matches = [] } = useQuery({
    ...matchesQuery(tournamentId, country),
    enabled: open,
  });
  const summary = matches.reduce(
    (totals, match) => {
      const { countryScore, opponentScore } = getCountryResult(match, country);

      totals.goalsFor += countryScore;
      totals.goalsAgainst += opponentScore;
      if (countryScore > opponentScore) totals.wins += 1;
      else if (countryScore < opponentScore) totals.losses += 1;
      else totals.draws += 1;

      return totals;
    },
    { wins: 0, draws: 0, losses: 0, goalsFor: 0, goalsAgainst: 0 },
  );

  return (
    <Drawer.Root
      onOpenChange={(isOpen) => {
        setOpen(isOpen);
        if (isOpen) posthog.capture("open_game_history", { country });
      }}
    >
      <Drawer.Trigger
        style={{
          background: "none",
          border: "none",
          padding: 0,
          cursor: "pointer",
        }}
      >
        {children}
      </Drawer.Trigger>
      <Drawer.Portal>
        <Drawer.Overlay
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.4)",
            zIndex: 1500,
          }}
        />
        <Drawer.Content
          style={{
            position: "fixed",
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: 1500,
            outline: "none",
          }}
        >
          <Box bg={bg} borderTopRadius="2xl" h="50vh" overflowY="auto" pb={6}>
            <Flex justifyContent="center" pt={3} pb={2}>
              <Box w="40px" h="6px" borderRadius="full" bg={handleColor} />
            </Flex>
            <Flex alignItems="center" gap={2} px={4} py={2}>
              <Flag height="32px" country={country} />
              <Text fontWeight="bold" fontSize="lg">
                {country}
              </Text>
            </Flex>
            {matches.length === 0 ? (
              <Text px={4} py={2} color={dateColor}>
                No hay partidos anteriores
              </Text>
            ) : (
              <>
                <Grid
                  templateColumns="repeat(5, 1fr)"
                  gap={2}
                  mx={4}
                  my={2}
                  p={3}
                  borderRadius="xl"
                  bg={summaryBg}
                >
                  {[
                    ["G", summary.wins],
                    ["E", summary.draws],
                    ["P", summary.losses],
                    ["GF", summary.goalsFor],
                    ["GC", summary.goalsAgainst],
                  ].map(([label, value]) => (
                    <GridItem key={label} textAlign="center">
                      <Text fontSize="xs" color={dateColor} fontWeight="semibold">
                        {label}
                      </Text>
                      <Text fontWeight="bold">{value}</Text>
                    </GridItem>
                  ))}
                </Grid>
                <Text px={4} pb={2} fontSize="xs" color={dateColor}>
                  El marcador de {country} aparece siempre a la izquierda.
                </Text>
                {matches.map((match) => {
                  const { countryScore, opponentScore, opponent } =
                    getCountryResult(match, country);
                  const details = [
                    match.startAtUtc
                      ? DateTime.fromSQL(match.startAtUtc).toLocaleString(
                          DateTime.DATE_MED,
                        )
                      : "",
                    match.location,
                  ].filter(Boolean);

                  return (
                    <Flex
                      key={match.id}
                      alignItems="center"
                      gap={3}
                      px={4}
                      py={3}
                      borderTopWidth="1px"
                      borderColor={itemBorder}
                    >
                      <Flag height="24px" country={opponent} />
                      <Box flex="1" minW={0}>
                        <Text fontWeight="medium">{opponent}</Text>
                        <Text fontSize="sm" color={dateColor} noOfLines={1}>
                          {details.join(" · ")}
                        </Text>
                      </Box>
                      <Flex
                        alignItems="baseline"
                        gap={1}
                        fontWeight="bold"
                        fontFamily="monospace"
                        fontSize="lg"
                      >
                        <Text>{countryScore}</Text>
                        <Text color={dateColor}>-</Text>
                        <Text color={opponentScoreColor}>{opponentScore}</Text>
                      </Flex>
                    </Flex>
                  );
                })}
              </>
            )}
          </Box>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
