import { Button, Flex, Text } from "@chakra-ui/react";
import { usePostHog } from "@posthog/react";
import toaster from "react-hot-toast";

import { useSetFavoriteTeam } from "@/api";
import CountryDrawer from "@/components/CountryDrawer";
import FeatFlagComponent from "@/components/FeatFlagComponent";
import Flag from "@/components/Flag";
import { pb } from "@/pb";

interface Props {
  userId: string;
  favoriteTeam?: string;
}

function TeamDisplay({ team }: { team: string }) {
  return (
    <Flex alignItems="center" gap="2">
      <Flag height="24px" country={team} />
      <Text>{team}</Text>
    </Flex>
  );
}

export default function FavoriteTeam({ userId, favoriteTeam }: Props) {
  const posthog = usePostHog();
  const { mutate, isPending } = useSetFavoriteTeam(userId);

  const readOnly = favoriteTeam ? <TeamDisplay team={favoriteTeam} /> : null;

  // Other users only ever see the team, never the editing controls.
  if (pb.authStore.model?.id !== userId) {
    return readOnly;
  }

  const setTeam = (team: string) => {
    mutate(team, {
      onSuccess() {
        posthog.capture("set_favorite_team", { team });
        toaster.success(
          team ? "Equipo favorito guardado!" : "Equipo favorito eliminado!",
        );
      },
      onError(err) {
        posthog.captureException(err);
        toaster.error(err.message);
      },
    });
  };

  return (
    <FeatFlagComponent feature="set_favorite_team" fallback={readOnly}>
      <Flex gap="2" alignItems="center">
        {favoriteTeam && <TeamDisplay team={favoriteTeam} />}
        <CountryDrawer
          value={favoriteTeam}
          isApplying={isPending}
          onApply={setTeam}
          trigger={
            <Button as="span" size="sm" colorScheme="blue">
              {favoriteTeam ? "Cambiar equipo" : "Elegir equipo favorito"}
            </Button>
          }
        />
        {favoriteTeam && (
          <Button
            size="sm"
            variant="ghost"
            colorScheme="red"
            isLoading={isPending}
            onClick={() => setTeam("")}
          >
            Quitar
          </Button>
        )}
      </Flex>
    </FeatFlagComponent>
  );
}
