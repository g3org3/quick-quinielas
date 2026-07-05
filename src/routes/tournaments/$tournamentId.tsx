import { createFileRoute, Outlet } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";

import { getTournamentQuery } from "@/api/tournaments";
import { queryClient } from "@/queryClient";
import TournamentLoading from "@/components/TournamentLoading";

export const Route = createFileRoute("/tournaments/$tournamentId")({
  component: TournamentLayout,
  pendingComponent: TournamentLoading,
  loader: async ({ params }) => {
    await queryClient.ensureQueryData(getTournamentQuery(params.tournamentId));
  },
});

function TournamentLayout() {
  const { tournamentId } = Route.useParams();
  const { data: tournament } = useSuspenseQuery(
    getTournamentQuery(tournamentId),
  );

  return (
    <>
      <h1
        style={{
          paddingTop: '20px',
          fontWeight: "bold",
          letterSpacing: "2px",
          fontSize: "20px",
          textAlign: "center",
        }}
      >
        {tournament.name}
      </h1>
      <Outlet />
    </>
  );
}
