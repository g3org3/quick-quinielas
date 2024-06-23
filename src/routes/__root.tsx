import { createRootRoute, Link, Outlet } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/router-devtools'
import { Button, Container, Flex, Spacer, useColorMode, useColorModeValue } from '@chakra-ui/react'
import { Toaster } from 'react-hot-toast'

import Login from '../components/Login'
import { pb } from '../pb'

export const Route = createRootRoute({
  component: Root,
})

const isDev = !import.meta.env.DEV

function Root() {
  const { colorMode, toggleColorMode } = useColorMode()
  const bg = useColorModeValue('white', 'black')
  const color = useColorModeValue('black', 'white')
  const border = useColorModeValue('gray.200', 'gray.700')

  if (!pb.authStore.isValid) return <Login />

  const onLogout = () => {
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
    <Flex color={color} bg={bg} flexDir="column" minH="100dvh">
      <Flex py="2" bg={bg} alignItems="center" borderBottom="1px solid" borderColor={border}>
        <Container maxW="container.xl" gap="4" display="flex" alignItems="center">
          <Link to="/">
            <span style={{ fontWeight: 'bold' }}>Quiniela</span>
          </Link>
          <Spacer />
          <Button size="sm" variant="ghost" onClick={onToggleColorMode}>
            Toggle {colorMode === 'light' ? 'Dark' : 'Light'}
          </Button>
          <Button size="sm" variant="ghost" onClick={onLogout}>
            Logout
          </Button>
        </Container>
      </Flex>
      <Flex flexDir="column" flex="1" py="4">
        <Container maxW="container.xl" display="flex" gap="3" flexDir="column" flex="1">
          <Outlet />
        </Container>
      </Flex>
      <Toaster />
      {isDev ? <TanStackRouterDevtools /> : null}
    </Flex>
  )
}
