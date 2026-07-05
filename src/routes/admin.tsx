import AdminMatch from "@/components/AdminMatch";
import { getFlagsQuery, useToggleFeatFlags } from "@/api/flags";
import { getMatchesQuery } from "@/api/matches";
import { tournamentsQuery } from "@/api/tournaments";
import { useUserQuery } from "@/api/users";
import { pb } from "@/pb";
import { queryClient } from "@/queryClient";
import TournamentLoading from "@/components/TournamentLoading";
import {
  Button,
  Flex,
  Select,
  Table,
  Tbody,
  Td,
  Text,
  Tr,
  useColorModeValue,
} from "@chakra-ui/react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { z } from "zod";

const adminSearchSchema = z.object({
  tab: z.enum(["matches", "flags"]).catch("matches").optional(),
  tournamentId: z.string().optional(),
});

export const Route = createFileRoute("/admin")({
  component: Component,
  pendingComponent: TournamentLoading,
  validateSearch: adminSearchSchema,
  loaderDeps: ({ search: { tab = "matches", tournamentId } }) => ({
    tab,
    tournamentId,
  }),
  loader: async ({ deps }) => {
    await queryClient.ensureQueryData(getFlagsQuery);
    await queryClient.ensureQueryData(tournamentsQuery);
    if (deps.tab === "matches" && deps.tournamentId) {
      await queryClient.ensureQueryData(
        getMatchesQuery(deps.tournamentId, "today"),
      );
    }
  },
});

function Component() {
  const { tab = "matches" } = Route.useSearch();
  const { data: user } = useUserQuery(pb.authStore.model?.id);

  if (!user?.isAdmin) {
    return <Text px={4}>No tienes permiso para ver esta pagina.</Text>;
  }

  return (
    <Flex flexDir="column" px={4} gap={4} flex="1" overflow="auto">
      <Text fontWeight="bold" fontSize="xl">
        Admin
      </Text>
      <Flex gap={2}>
        <Link to="/admin" search={{}}>
          <Button variant="ghost" isActive={tab === "matches"}>
            Partidos
          </Button>
        </Link>
        <Link to="/admin" search={{ tab: "flags" }}>
          <Button variant="ghost" isActive={tab === "flags"}>
            Feature flags
          </Button>
        </Link>
      </Flex>
      {tab === "flags" ? <FeatureFlags /> : <TodayMatches />}
    </Flex>
  );
}

function FeatureFlags() {
  const { data } = useSuspenseQuery(getFlagsQuery);
  const { mutate } = useToggleFeatFlags();

  return (
    <Table>
      <Tbody>
        {data.map((flag) => {
          const { id, isActive } = flag;
          return (
            <Tr key={flag.id}>
              <Td
                onClick={() => mutate({ id, isActive: !isActive })}
                style={{ cursor: "pointer" }}
              >
                {flag.feature}
              </Td>
              <Td>{flag.isActive ? "✅" : "❌"}</Td>
            </Tr>
          );
        })}
      </Tbody>
    </Table>
  );
}

function TodayMatches() {
  const navigate = Route.useNavigate();
  const { tournamentId } = Route.useSearch();
  const border = useColorModeValue("gray.200", "gray.700");
  const { data: tournaments } = useSuspenseQuery(tournamentsQuery);
  const selectedTournamentId = tournamentId ?? tournaments[0]?.id;

  if (!selectedTournamentId) {
    return <Text>No hay torneos.</Text>;
  }

  return (
    <Flex flexDir="column" gap={3}>
      <Flex
        alignItems="center"
        gap={3}
        borderBottom="1px solid"
        borderColor={border}
        pb={3}
      >
        <Text fontWeight="bold">Partidos de hoy</Text>
        <Select
          maxW="320px"
          value={selectedTournamentId}
          onChange={(event) =>
            navigate({
              to: "/admin",
              search: {
                tournamentId: event.target.value,
              },
            })
          }
        >
          {tournaments.map((tournament) => (
            <option key={tournament.id} value={tournament.id}>
              {tournament.name}
            </option>
          ))}
        </Select>
      </Flex>
      <AdminMatchList tournamentId={selectedTournamentId} />
    </Flex>
  );
}

function AdminMatchList({ tournamentId }: { tournamentId: string }) {
  const matchesQuery = getMatchesQuery(tournamentId, "today");
  const { data: matches } = useSuspenseQuery(matchesQuery);

  if (matches.length === 0) {
    return <Text>No hay partidos hoy.</Text>;
  }

  return (
    <Flex flexDir="column">
      {matches.map((match) => (
        <AdminMatch key={match.id} match={match} tournamentId={tournamentId} />
      ))}
    </Flex>
  );
}
