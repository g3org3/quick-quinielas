import { Drawer } from "vaul";
import {
  Avatar,
  AvatarGroup,
  Badge,
  Box,
  Flex,
  Progress,
  Text,
  useColorModeValue,
} from "@chakra-ui/react";
import { usePostHog } from "@posthog/react";
import { useQuery } from "@tanstack/react-query";
import { DateTime } from "luxon";

import Flag from "@/components/Flag";
import { usersQuery } from "@/api/users";

export interface AvatarUser {
  img: string;
  name: string;
  updatedAt: string;
  favoriteTeam?: string;
  isBonusActive?: boolean;
}

interface Props {
  users: AvatarUser[];
  max?: number;
}

export default function AvatarListDrawer({ users, max }: Props) {
  const posthog = usePostHog();
  const bg = useColorModeValue("white", "gray.800");
  const itemBorder = useColorModeValue("gray.100", "gray.700");
  const handleColor = useColorModeValue("gray.300", "gray.600");
  const dateColor = useColorModeValue("gray.500", "gray.400");
  const countColor = useColorModeValue("brand.600", "brand.300");
  const progressTrack = useColorModeValue("gray.100", "gray.700");

  const { data: allUsers = [] } = useQuery(usersQuery);
  const total = allUsers.length || users.length;
  const predictionPercent =
    total > 0 ? Math.min(100, Math.round((users.length / total) * 100)) : 0;

  const sortedUsers = [...users].sort((a, b) =>
    (b.updatedAt ?? "").localeCompare(a.updatedAt ?? ""),
  );

  return (
    <Drawer.Root
      onOpenChange={(open) => {
        if (open) posthog.capture("open_avatar_list");
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
        <AvatarGroup size="md" max={max}>
          {sortedUsers.map((user, i) => (
            <Avatar
              key={user.img || user.name || i}
              src={user.img}
              name={user.name}
            />
          ))}
        </AvatarGroup>
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
          <Box
            bg={bg}
            borderTopRadius="2xl"
            maxH="70vh"
            display="flex"
            flexDirection="column"
          >
            <Flex justifyContent="center" pt={3} pb={2}>
              <Box w="40px" h="6px" borderRadius="full" bg={handleColor} />
            </Flex>
            <Flex flexDir="column" px={4} py={2}>
              <Flex alignItems="baseline" justifyContent="space-between">
                <Text fontWeight="bold" fontSize="lg">
                  Participantes
                </Text>
                <Text fontWeight="bold" color={countColor}>
                  {predictionPercent}%
                </Text>
              </Flex>
              <Text fontSize="sm" color={dateColor} mb={2}>
                <Text as="span" fontWeight="bold" color={countColor}>
                  {users.length} de {total}
                </Text>{" "}
                ya vaticinaron
              </Text>
              <Progress
                aria-label="Porcentaje de participantes que ya vaticinaron"
                value={predictionPercent}
                size="sm"
                colorScheme="brand"
                bg={progressTrack}
                borderRadius="full"
              />
            </Flex>
            <Box overflowY="auto" pb={6}>
              {sortedUsers.map((user, i) => (
                <Flex
                  key={user.img || user.name || i}
                  alignItems="center"
                  gap={3}
                  px={4}
                  py={2}
                  borderTopWidth="1px"
                  borderColor={itemBorder}
                >
                  <Avatar size="md" src={user.img} name={user.name} />
                  <Text>{user.name || "Anónimo"}</Text>
                  {user.favoriteTeam && (
                    <Flag height="24px" country={user.favoriteTeam} />
                  )}
                  {user.isBonusActive && (
                    <Badge
                      alignSelf="center"
                      bg="gold.50"
                      borderWidth="1px"
                      borderColor="gold.200"
                      color="gold.700"
                      fontFamily="mono"
                      rounded="md"
                    >
                      ×2
                    </Badge>
                  )}
                  <Text ml="auto" fontSize="sm" color={dateColor}>
                    {user.updatedAt
                      ? DateTime.fromSQL(user.updatedAt)
                          .toFormat("LLL-dd hh:mma")
                          .toLowerCase()
                      : ""}
                  </Text>
                </Flex>
              ))}
            </Box>
          </Box>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
