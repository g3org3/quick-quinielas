import { Button, Container, Flex, Spacer, useColorMode, useColorModeValue } from '@chakra-ui/react'
import { TanStackRouterDevtools } from '@tanstack/router-devtools'
import { Toaster } from 'react-hot-toast'
import { createRootRoute, Link, Outlet } from '@tanstack/react-router'
import { PostHogProvider, usePostHog } from '@posthog/react'

import Login from '@/components/Login'
import { pb } from '@/pb'

export const Route = createRootRoute({
  component: Root,
})

const isDev = false

function Root() {
  const bg = useColorModeValue('white', 'black')
  const color = useColorModeValue('black', 'white')

  if (!pb.authStore.isValid) return (
    <PostHogProvider
      apiKey={import.meta.env.VITE_PUBLIC_POSTHOG_PROJECT_TOKEN!}
      options={{
        api_host: '/ingest',
        ui_host: import.meta.env.VITE_PUBLIC_POSTHOG_HOST || 'https://eu.posthog.com',
        defaults: '2026-01-30',
        capture_exceptions: true,
        debug: import.meta.env.DEV,
      }}
    >
      <Login />
      <Toaster />
    </PostHogProvider>
  )

  return (
    <PostHogProvider
      apiKey={import.meta.env.VITE_PUBLIC_POSTHOG_PROJECT_TOKEN!}
      options={{
        api_host: '/ingest',
        ui_host: import.meta.env.VITE_PUBLIC_POSTHOG_HOST || 'https://eu.posthog.com',
        defaults: '2026-01-30',
        capture_exceptions: true,
        debug: import.meta.env.DEV,
      }}
    >
      <Flex color={color} bg={bg} flexDir="column" height="100dvh">
        <Navbar />
        <Container maxW="container.xl" display="flex" px="1" py="4" gap="3" flexDir="column" flex="1" overflow="auto">
          <Outlet />
        </Container>
        <Toaster />
        {isDev ? <TanStackRouterDevtools /> : null}
      </Flex>
    </PostHogProvider>
  )
}

function Navbar() {
  const { colorMode, toggleColorMode } = useColorMode()
  const bg = useColorModeValue('white', 'black')
  const posthog = usePostHog()

  const onLogout = () => {
    posthog.capture('user_logged_out')
    posthog.reset()
    pb.authStore.clear();
    window.document.location = '/'
  }

  const onToggleColorMode = () => {
    const meta = document.querySelectorAll('meta[name="theme-color"]')[0] as unknown
    if (meta && typeof meta === 'object' && "content" in meta && colorMode === 'light') {
      meta.content = '#000'
    }
    if (meta && typeof meta === 'object' && "content" in meta && colorMode === 'dark') {
      meta.content = '#fff'
    }
    toggleColorMode()
  }

  return (
    <Flex py="2" bg={bg} alignItems="center" boxShadow="md">
      <Container maxW="container.xl" gap="4" display="flex" alignItems="center">
        <Link to="/">
          <span style={{ fontWeight: 'bold' }}>Quiniela</span>
        </Link>
        <Spacer />
        <Button size="sm" variant="ghost" onClick={onToggleColorMode}>
          Toggle {colorMode === 'light' ? '🌚' : '☀️'}
        </Button>
        <Button size="sm" variant="ghost" onClick={onLogout}>
          Logout
        </Button>
      </Container>
    </Flex>
  )
}
