import { useState } from "react";
import { Drawer } from "vaul";
import { Box, Flex, Text, useColorModeValue } from "@chakra-ui/react";
import { usePostHog } from "@posthog/react";
import { useQuery } from "@tanstack/react-query";
import { DateTime } from "luxon";
import { matchesQuery } from "@/api";
import Flag from "./Flag";

interface Props {
  tournamentId: string;
  country: string;
  children: React.ReactNode;
}

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

  const [open, setOpen] = useState(false);
  const { data: matches = [] } = useQuery({
    ...matchesQuery(tournamentId, country),
    enabled: open,
  });

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
          <Box bg={bg} borderTopRadius="2xl" maxH="70vh" overflowY="auto" pb={6}>
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
              matches.map((match) => (
                <Flex
                  key={match.id}
                  alignItems="center"
                  gap={3}
                  px={4}
                  py={3}
                  borderTopWidth="1px"
                  borderColor={itemBorder}
                >
                  <Flex flex="1" alignItems="center" gap={2}>
                    <Flag height="24px" country={match.home} />
                    <Text>{match.home}</Text>
                  </Flex>
                  <Text fontWeight="bold" fontFamily="monospace">
                    {match.homeScore} - {match.awayScore}
                  </Text>
                  <Flex
                    flex="1"
                    alignItems="center"
                    gap={2}
                    justifyContent="flex-end"
                  >
                    <Text>{match.away}</Text>
                    <Flag height="24px" country={match.away} />
                  </Flex>
                  <Text
                    minW="70px"
                    textAlign="right"
                    fontSize="sm"
                    color={dateColor}
                  >
                    {match.startAtUtc
                      ? DateTime.fromSQL(match.startAtUtc).toLocaleString(
                          DateTime.DATE_SHORT,
                        )
                      : ""}
                  </Text>
                </Flex>
              ))
            )}
          </Box>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
