import { useState } from "react";
import { Button, Flex, Select, Text } from "@chakra-ui/react";
import { usePostHog } from "@posthog/react";
import toaster from "react-hot-toast";

import { useSetFavoriteTeam } from "@/api";
import { countries } from "@/components/countries";
import FeatFlagComponent from "@/components/FeatFlagComponent";
import Flag from "@/components/Flag";
import { pb } from "@/pb";

interface Props {
  userId: string;
  favoriteTeam?: string;
}

export default function FavoriteTeam({ userId, favoriteTeam }: Props) {
  const posthog = usePostHog();
  const [team, setTeam] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const { mutate, isPending } = useSetFavoriteTeam(userId);

  if (favoriteTeam) {
    return (
      <Flex alignItems="center" gap="2">
        <Flag height="24px" country={favoriteTeam} />
        <Text>{favoriteTeam}</Text>
      </Flex>
    );
  }

  if (pb.authStore.model?.id !== userId) {
    return null;
  }

  return (
    <FeatFlagComponent feature="set_favorite_team">
      {isEditing ? (
        <Flex gap="2" alignItems="center">
          <Select
            size="sm"
            maxW="200px"
            placeholder="Selecciona tu equipo"
            value={team}
            onChange={(event) => setTeam(event.target.value)}
          >
            {Object.keys(countries).map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </Select>
          <Button
            size="sm"
            colorScheme="blue"
            isDisabled={!team}
            isLoading={isPending}
            onClick={() => {
              mutate(team, {
                onSuccess() {
                  posthog.capture("set_favorite_team", { team });
                  toaster.success("Equipo favorito guardado!");
                },
                onError(err) {
                  posthog.captureException(err);
                  toaster.error(err.message);
                },
              });
            }}
          >
            Guardar
          </Button>
        </Flex>
      ) : (
        <Button size="sm" colorScheme="blue" onClick={() => setIsEditing(true)}>
          Elegir equipo favorito
        </Button>
      )}
    </FeatFlagComponent>
  );
}
