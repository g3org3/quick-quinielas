import { Box, Button, Flex, Text, useColorModeValue } from "@chakra-ui/react";
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

function ChooseFavorite() {
  const bg = useColorModeValue("gray.100", "gray.700");
  const hoverBg = useColorModeValue("gray.200", "gray.600");
  return (
    <Box
      px="3"
      py="1.5"
      borderRadius="md"
      bg={bg}
      _hover={{ bg: hoverBg }}
      fontWeight="medium"
    >
      Elige tu favorito
    </Box>
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
          team ? "Equipo favorito guardado!" : "Equipo favorito eliminado!"
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
        <CountryDrawer
          value={favoriteTeam}
          isApplying={isPending}
          onApply={setTeam}
          trigger={
            favoriteTeam ? <TeamDisplay team={favoriteTeam} /> : <ChooseFavorite />
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
