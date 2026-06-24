import { Button, Flex, Img, useColorModeValue } from "@chakra-ui/react";
import { Link, createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";

import { tournamentsQuery } from "@/api";
import TournamentLoading from "@/components/TournamentLoading";
import { queryClient } from "@/queryClient";

export const Route = createFileRoute("/tournaments/")({
  component: Tournaments,
  pendingComponent: TournamentLoading,
  loader: async () => {
    await queryClient.ensureQueryData(tournamentsQuery);
  },
});

function Tournaments() {
  const border = useColorModeValue("gray.200", "gray.700");
  const btn = useColorModeValue("white", undefined);
  const { data } = useSuspenseQuery(tournamentsQuery);

  return (
    <>
      <h1 style={{ fontWeight: "bold" }}>Torneos</h1>
      <Flex gap="5" flexDirection="column">
        {data.map((tournament) => (
          <Link
            key={tournament.id}
            to="/tournaments/$tournamentId"
            params={{ tournamentId: tournament.id }}
          >
            <Button
              display="flex"
              justifyContent="flex-start"
              gap="5"
              h="120px"
              width="100%"
              bg={btn}
              border="1px solid"
              boxShadow="sm"
              borderColor={border}
            >
              <Flex borderRight="1px solid" borderColor={border} pr="5">
                <Img width="100px" height="100px" src={tournament.logo} />
              </Flex>
              <Flex>{tournament.name}</Flex>
            </Button>
          </Link>
        ))}
      </Flex>
    </>
  );
}
