import { Button, Flex, Heading, Img } from "@chakra-ui/react";
import { Link, createFileRoute, redirect } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";

import { tournamentsQuery } from "@/api/tournaments";
import { queryClient } from "@/queryClient";
import TournamentLoading from "@/components/TournamentLoading";

const tournamentId = "izl4jbo5w25yf6b";
export const Route = createFileRoute("/")({
  component: Home,
  pendingComponent: TournamentLoading,
  beforeLoad: () => {
    throw redirect({
      to: "/tournaments/$tournamentId",
      params: { tournamentId },
      search: { tab: "today" },
    });
  },
  loader: async () => {
    await queryClient.ensureQueryData(tournamentsQuery);
  },
});

function Home() {
  const { data } = useSuspenseQuery(tournamentsQuery);

  return (
    <>
      <Heading size="lg" mb={4}>
        Torneos
      </Heading>
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
              bg="surface"
              border="1px solid"
              boxShadow="sm"
              borderColor="border.subtle"
            >
              <Flex borderRight="1px solid" borderColor="border.subtle" pr="5">
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
