import { Button, Container, Flex, Heading, Spacer, Text, useColorMode, useColorModeValue } from '@chakra-ui/react'
import { TanStackRouterDevtools } from '@tanstack/router-devtools'
import { Toaster } from 'react-hot-toast'
import { createRootRoute, Link, Outlet } from '@tanstack/react-router'

import Login from '@/components/Login'
import { pb } from '@/pb'

export const Route = createRootRoute({
  component: Root,
})

const isDev = false

function Root() {
  const pageBg = useColorModeValue('#f4f7f5', '#0c120f')
  const glow = useColorModeValue(
    'radial-gradient(ellipse 80% 55% at 50% -10%, rgba(56, 161, 105, 0.18), transparent), radial-gradient(ellipse 60% 45% at 85% 110%, rgba(49, 130, 206, 0.10), transparent)',
    'radial-gradient(ellipse 80% 55% at 50% -10%, rgba(56, 161, 105, 0.22), transparent), radial-gradient(ellipse 60% 45% at 85% 110%, rgba(49, 130, 206, 0.12), transparent)'
  )
  const dots = useColorModeValue(
    'radial-gradient(rgba(26, 32, 44, 0.07) 1px, transparent 1px)',
    'radial-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px)'
  )
  const color = useColorModeValue('gray.800', 'whiteAlpha.900')

  if (!pb.authStore.isValid) return <>
    <Login />
    <Toaster />
  </>

  return (
    <Flex
      color={color}
      bg={pageBg}
      backgroundImage={`${glow}, ${dots}`}
      backgroundSize="auto, 22px 22px"
      flexDir="column"
      height="100dvh"
    >
      <Navbar />
      <Container maxW="container.xl" display="flex" px="1" py="4" gap="3" flexDir="column" flex="1" overflow="auto">
        <Outlet />
      </Container>
      <Toaster />
      {isDev ? <TanStackRouterDevtools /> : null}
    </Flex >
  )
}

function Navbar() {
  const { colorMode, toggleColorMode } = useColorMode()
  const bg = useColorModeValue('rgba(255, 255, 255, 0.85)', 'rgba(12, 18, 15, 0.85)')
  const borderColor = useColorModeValue('blackAlpha.100', 'whiteAlpha.200')
  const mutedText = useColorModeValue('gray.500', 'gray.400')
  const hoverBg = useColorModeValue('green.50', 'whiteAlpha.100')

  const onLogout = () => {
    pb.authStore.clear();
    window.document.location = '/'
  }

  const onToggleColorMode = () => {
    const meta = document.querySelectorAll('meta[name="theme-color"]')[0] as unknown
    if (meta && typeof meta === 'object' && "content" in meta && colorMode === 'light') {
      meta.content = '#0c120f'
    }
    if (meta && typeof meta === 'object' && "content" in meta && colorMode === 'dark') {
      meta.content = '#f4f7f5'
    }
    toggleColorMode()
  }

  return (
    <Flex
      py="2"
      bg={bg}
      backdropFilter="blur(12px)"
      alignItems="center"
      borderBottom="1px solid"
      borderColor={borderColor}
    >
      <Container maxW="container.xl" gap="4" display="flex" alignItems="center">
        <Link to="/">
          <Flex alignItems="center" gap="2">
            <Flex
              w="8"
              h="8"
              alignItems="center"
              justifyContent="center"
              fontSize="lg"
              borderRadius="full"
              bgGradient="linear(to-br, green.400, green.600)"
              boxShadow="0 6px 14px -4px rgba(56, 161, 105, 0.55)"
            >
              ⚽
            </Flex>
            <Heading size="sm" letterSpacing="tight">
              Quiniela
            </Heading>
          </Flex>
        </Link>
        <Spacer />
        <Button
          size="sm"
          variant="ghost"
          borderRadius="lg"
          color={mutedText}
          _hover={{ bg: hoverBg, color: 'green.500' }}
          _active={{ transform: 'scale(0.97)' }}
          transition="all 0.15s ease-out"
          onClick={onToggleColorMode}
        >
          <Text>Toggle {colorMode === 'light' ? '🌚' : '☀️'}</Text>
        </Button>
        <Button
          size="sm"
          variant="ghost"
          borderRadius="lg"
          color={mutedText}
          _hover={{ bg: hoverBg, color: 'green.500' }}
          _active={{ transform: 'scale(0.97)' }}
          transition="all 0.15s ease-out"
          onClick={onLogout}
        >
          Logout
        </Button>
      </Container>
    </Flex>
  )
}
