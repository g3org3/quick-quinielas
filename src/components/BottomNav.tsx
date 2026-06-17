import { Link } from "@tanstack/react-router";
import { Flex, Button } from "@chakra-ui/react";
import { pb } from "@/pb";
import { UsersResponse } from "@/pocketbase-types";

export default function BottomNav({
  tournamentId,
  state,
}: {
  tournamentId: string;
  state?: "vaticinios" | "puntos" | "perfil";
}) {
  const userId = (pb.authStore.model as UsersResponse).id;

  return (
    <>
      <hr />
      <Flex flexShrink={0} alignItems="center" gap="2" mb="3">
        <Link
          style={{ width: "100%" }}
          to="/tournaments/$tournamentId/$userId"
          params={{ tournamentId, userId }}
        >
          <Button isActive={state === "perfil"} w="100%" variant="ghost">
            Perfil
          </Button>
        </Link>
        <Link
          style={{ width: "100%" }}
          to="/tournaments/$tournamentId"
          params={{ tournamentId }}
        >
          <Button isActive={state === "vaticinios"} w="100%" variant="ghost">
            Vaticinios
          </Button>
        </Link>
        <Link
          style={{ width: "100%" }}
          to="/tournaments/$tournamentId/points"
          params={{ tournamentId }}
        >
          <Button isActive={state === "puntos"} w="100%" variant="ghost">
            Puntos
          </Button>
        </Link>
      </Flex>
    </>
  );
}
