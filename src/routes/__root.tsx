import {
  Avatar,
  Button,
  Container,
  Flex,
  Spacer,
  useColorModeValue,
  Text,
} from "@chakra-ui/react";
import { TanStackRouterDevtools } from "@tanstack/router-devtools";
import { Toaster } from "react-hot-toast";
import { createRootRoute, Link, Outlet } from "@tanstack/react-router";
import { PostHogProvider, usePostHog } from "@posthog/react";

import Login from "@/components/Login";
import { pb } from "@/pb";
import ColorModeSwitcher from "@/components/ColorModeSwitcher";
import { UsersResponse } from "@/pocketbase-types";

export const Route = createRootRoute({
  component: Root,
});

const isDev = false;

function Root() {
  const bg = useColorModeValue("white", "gray.900");
  const color = useColorModeValue("gray.900", "white");

  if (!pb.authStore.isValid)
    return (
      <PostHogProvider
        apiKey={import.meta.env.VITE_PUBLIC_POSTHOG_PROJECT_TOKEN!}
        options={{
          api_host: "/ingest",
          ui_host:
            import.meta.env.VITE_PUBLIC_POSTHOG_HOST ||
            "https://eu.posthog.com",
          defaults: "2026-01-30",
          capture_exceptions: true,
          debug: import.meta.env.DEV,
        }}
      >
        <Login />
        <Toaster />
      </PostHogProvider>
    );

  return (
    <PostHogProvider
      apiKey={import.meta.env.VITE_PUBLIC_POSTHOG_PROJECT_TOKEN!}
      options={{
        api_host: "/ingest",
        ui_host:
          import.meta.env.VITE_PUBLIC_POSTHOG_HOST || "https://eu.posthog.com",
        defaults: "2026-01-30",
        capture_exceptions: true,
        debug: import.meta.env.DEV,
      }}
    >
      <Flex color={color} bg={bg} flexDir="column" height="100dvh">
        <Navbar />
        <Container
          maxW="container.xl"
          display="flex"
          py="4"
          px="0"
          gap="3"
          flexDir="column"
          flex="1"
          overflow="auto"
        >
          <Outlet />
        </Container>
        <Toaster />
        {isDev ? <TanStackRouterDevtools /> : null}
      </Flex>
    </PostHogProvider>
  );
}

function Navbar() {
  const bg = useColorModeValue("whitesmoke", "gray.800");
  const posthog = usePostHog();
  const user = pb.authStore.model as UsersResponse;

  const onLogout = () => {
    posthog.capture("user_logged_out");
    posthog.reset();
    pb.authStore.clear();
    window.document.location = "/";
  };

  return (
    <Flex py="2" bg={bg} alignItems="center" boxShadow="md">
      <Container maxW="container.xl" gap="4" display="flex" alignItems="center">
        <Link to="/">
          <Flex gap={1} alignItems="center">
            <Text fontSize="x-large">🏟️</Text>
            <Text fontWeight="bold" fontSize="large">Quiniela</Text>
          </Flex>
        </Link>
        <Spacer />
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
