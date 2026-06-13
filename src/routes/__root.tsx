import { Box, Button, Container, Flex, Heading, Spacer, useColorMode, useColorModeValue } from '@chakra-ui/react'
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
  const bg = useColorModeValue('rgba(255, 255, 255, 0.70)', 'rgba(12, 18, 15, 0.76)')
  const borderColor = useColorModeValue('blackAlpha.100', 'whiteAlpha.100')
  const mutedText = useColorModeValue('gray.500', 'gray.400')
  const hoverBg = useColorModeValue('green.50', 'whiteAlpha.100')
  const toggleBg = useColorModeValue('gray.100', 'whiteAlpha.100')
  const toggleBorderColor = useColorModeValue('gray.200', 'whiteAlpha.200')
  const logoutBorderColor = useColorModeValue('gray.200', 'whiteAlpha.200')

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
      py="2.5"
      bg={bg}
      backdropFilter="blur(20px) saturate(180%)"
      alignItems="center"
      borderBottom="1px solid"
      borderColor={borderColor}
      position="relative"
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
          borderRadius="full"
          w="9"
          h="9"
          minW="9"
          p="0"
          fontSize="sm"
          bg={toggleBg}
          border="1px solid"
          borderColor={toggleBorderColor}
          color={mutedText}
          _hover={{
            bg: hoverBg,
            transform: 'scale(1.1) rotate(15deg)',
            boxShadow: '0 0 14px rgba(56, 161, 105, 0.35)',
            borderColor: 'green.400',
          }}
          _active={{ transform: 'scale(0.90)' }}
          transition="all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)"
          onClick={onToggleColorMode}
        >
          {colorMode === 'light' ? '🌚' : '☀️'}
        </Button>
        <Button
          size="sm"
          variant="ghost"
          borderRadius="lg"
          px="3"
          fontSize="xs"
          fontWeight="semibold"
          letterSpacing="wide"
          color={mutedText}
          border="1px solid"
          borderColor={logoutBorderColor}
          _hover={{
            bg: hoverBg,
            color: 'green.500',
            borderColor: 'green.300',
          }}
          _active={{ transform: 'scale(0.96)' }}
          transition="all 0.15s ease-out"
          onClick={onLogout}
        >
          Logout
        </Button>
      </Container>
      {/* Green accent gradient line */}
      <Box
        position="absolute"
        bottom="-1px"
        left="0"
        right="0"
        h="1px"
        bgGradient="linear(to-r, transparent 0%, green.400 25%, green.500 50%, green.400 75%, transparent 100%)"
        opacity={0.75}
      />
    </Flex>
  )
}
