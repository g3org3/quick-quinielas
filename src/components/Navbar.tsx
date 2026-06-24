import { pb } from "@/pb";
import { UsersResponse } from "@/pocketbase-types";
import {
  Container,
  Text,
  Flex,
  useColorModeValue,
  Avatar,
  Button,
  Spacer,
} from "@chakra-ui/react";
import { usePostHog } from "@posthog/react";
import { Link } from "@tanstack/react-router";
import ColorModeSwitcher from "./ColorModeSwitcher";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useFeatFlag } from "@/featureFlags";
import Swal from "sweetalert2";

export default function Navbar() {
  const bg = useColorModeValue("white", "gray.800");
  const posthog = usePostHog();
  const user = pb.authStore.model as UsersResponse;
  const [version, setVersion] = useState<number | undefined>(undefined);

  const { data, isLoading } = useQuery({
    queryKey: ["version"],
    async queryFn() {
      const res = await fetch("/.netlify/functions/hello");
      return (await res.json()) as { version: number };
    },
  });
  const flag_showUpdateApp = useFeatFlag("show_update_app");
  posthog.identify(user.email);

  useEffect(() => {
    if (data?.version === undefined) {
      return;
    }
    if (version === undefined) {
      setVersion(data.version);
      return;
    }
    if (!flag_showUpdateApp) return;
    if (data.version > version) {
      Swal.fire({
        title: "Hay una nueva actualizacion",
        confirmButtonText: "Actualizar",
      }).then(() => {
        posthog.capture("user_reload_page");
        window.document.location.reload();
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data?.version]);

  const onLogout = () => {
    posthog.capture("user_logged_out");
    posthog.reset();
    pb.authStore.clear();
    localStorage.clear()
    window.document.location = "/";
  };

  return (
    <Flex py="2" bg={bg} alignItems="center" boxShadow="md">
      <Container maxW="container.xl" gap="4" display="flex" alignItems="center">
        <Link to="/">
          <Flex gap={1} alignItems="center">
            <Text fontSize="x-large">🏟️</Text>
            <Text fontWeight="bold" fontSize="large">
              Quiniela
            </Text>
            {isLoading ? null : (
              <Text fontFamily="monospace" fontSize="smaller">
                v{data?.version}
              </Text>
            )}
          </Flex>
        </Link>
        <Spacer />
        {user.isAdmin && <Link to="/admin">A</Link>}
        <ColorModeSwitcher />
        <Button
          size="sm"
          variant="ghost"
          onClick={onLogout}
          leftIcon={
            <Avatar
              size="xs"
              name={user?.name}
              src={pb.files.getUrl(user, user.avatar, {
                thumb: "100x100",
                cache: "default",
              })}
            />
          }
        >
          Logout
        </Button>
      </Container>
    </Flex>
  );
}
