import {
  Container,
  Flex,
  useColorModeValue,
} from "@chakra-ui/react";
import { TanStackRouterDevtools } from "@tanstack/router-devtools";
import { Toaster } from "react-hot-toast";
import { createRootRoute, Outlet } from "@tanstack/react-router";
import { PostHogProvider } from "@posthog/react";

import Login from "@/components/Login";
import { pb } from "@/pb";
import Navbar from "@/components/Navbar";

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
