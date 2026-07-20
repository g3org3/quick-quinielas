import { Button, Flex, useColorModeValue } from "@chakra-ui/react";
import { Link } from "@tanstack/react-router";

import { useUserQuery } from "@/api/users";
import { pb } from "@/pb";

export default function BottomNav({
  tournamentId,
  state,
}: {
  tournamentId: string;
  state?: "vaticinios" | "puntos" | "perfil";
}) {
  const { data: user } = useUserQuery(pb.authStore.model?.id);
  const userId = user?.id ?? "";
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const buttonProps = {
    flex: "1",
    minW: 0,
    variant: "ghost",
  } as const;

  return (
    <Flex
      borderTop="1px solid"
      borderColor={borderColor}
      pt={2}
      flexShrink={0}
      alignItems="center"
      gap="2"
      mb="3"
    >
      <Button
        as={Link}
        to="/tournaments/$tournamentId/$userId"
        params={{ tournamentId, userId }}
        isActive={state === "perfil"}
        {...buttonProps}
      >
        Perfil
      </Button>
      <Button
        as={Link}
        to="/tournaments/$tournamentId"
        params={{ tournamentId }}
        isActive={state === "vaticinios"}
        {...buttonProps}
      >
        Vaticinios
      </Button>
      <Button
        as={Link}
        to="/tournaments/$tournamentId/points"
        params={{ tournamentId }}
        isActive={state === "puntos"}
        {...buttonProps}
      >
        Puntos
      </Button>
    </Flex>
  );
}
