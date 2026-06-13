import { Link } from '@tanstack/react-router'
import { Box, Button, Flex, useColorModeValue } from '@chakra-ui/react'

export default function BottomNav({ tournamentId, state }: { tournamentId: string, state?: 'vaticinios' | 'puntos' }) {
  const containerBg = useColorModeValue('rgba(255,255,255,0.70)', 'rgba(12,18,15,0.72)')
  const containerBorder = useColorModeValue('blackAlpha.100', 'whiteAlpha.100')
  const containerShadow = useColorModeValue(
    '0 2px 20px -4px rgba(0,0,0,0.08)',
    '0 2px 20px -4px rgba(0,0,0,0.45)'
  )
  const inactiveColor = useColorModeValue('gray.500', 'gray.400')
  const inactiveHoverBg = useColorModeValue('green.50', 'whiteAlpha.100')

  const pillButton = (isActive: boolean) => ({
    w: '100%' as const,
    size: 'sm' as const,
    borderRadius: 'full' as const,
    fontWeight: isActive ? 'semibold' : 'medium' as const,
    bg: isActive ? undefined : 'transparent',
    bgGradient: isActive ? 'linear(to-br, green.400, green.500)' : undefined,
    color: isActive ? 'white' : inactiveColor,
    boxShadow: isActive ? '0 4px 14px -4px rgba(56, 161, 105, 0.65)' : 'none',
    _hover: isActive
      ? { bgGradient: 'linear(to-br, green.500, green.600)', transform: 'translateY(-1px)', boxShadow: '0 6px 18px -4px rgba(56, 161, 105, 0.7)' }
      : { bg: inactiveHoverBg, color: 'green.500' },
    _active: { transform: 'scale(0.96)' },
    transition: 'all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
  })

  return (
    <Box
      mt="2"
      mb="1"
      borderRadius="full"
      bg={containerBg}
      backdropFilter="blur(12px) saturate(160%)"
      border="1px solid"
      borderColor={containerBorder}
      boxShadow={containerShadow}
      p="1"
    >
      <Flex alignItems="center" gap="1">
        <Link style={{ flex: 1 }} to="/">
          <Button {...pillButton(false)}>Torneos</Button>
        </Link>
        <Link style={{ flex: 1 }} to="/tournaments/$tournamentId" params={{ tournamentId }}>
          <Button {...pillButton(state === 'vaticinios')}>Vaticinios</Button>
        </Link>
        <Link style={{ flex: 1 }} to="/tournaments/$tournamentId/points" params={{ tournamentId }}>
          <Button {...pillButton(state === 'puntos')}>Puntos</Button>
        </Link>
      </Flex>
    </Box>
  )
}
