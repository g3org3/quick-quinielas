import { Drawer } from "vaul";
import {
  Avatar,
  AvatarGroup,
  Box,
  Flex,
  Text,
  useColorModeValue,
} from "@chakra-ui/react";
import { usePostHog } from "@posthog/react";
import { DateTime } from "luxon";

export interface AvatarUser {
  img: string;
  name: string;
  updatedAt: string;
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
            overflowY="auto"
            pb={6}
          >
            <Flex justifyContent="center" pt={3} pb={2}>
              <Box w="40px" h="6px" borderRadius="full" bg={handleColor} />
            </Flex>
            <Text fontWeight="bold" fontSize="lg" px={4} py={2}>
              Participantes ({users.length})
            </Text>
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
                <Text ml="auto" fontSize="sm" color={dateColor}>
                  {user.updatedAt
                    ? DateTime.fromSQL(user.updatedAt).toLocaleString(
                        DateTime.DATETIME_SHORT,
                      )
                    : ""}
                </Text>
              </Flex>
            ))}
          </Box>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
