import { Link } from '@tanstack/react-router'
import { Button, Divider, Flex, useColorModeValue } from '@chakra-ui/react'

export default function BottomNav({ tournamentId, state }: { tournamentId: string, state?: 'vaticinios' | 'puntos' }) {
  const dividerColor = useColorModeValue('blackAlpha.100', 'whiteAlpha.200')
  const inactiveColor = useColorModeValue('gray.500', 'gray.400')
  const hoverBg = useColorModeValue('green.50', 'whiteAlpha.100')

  const navButton = (isActive: boolean) => ({
    w: '100%',
    size: 'sm' as const,
    borderRadius: 'full',
    fontWeight: isActive ? 'semibold' : 'medium',
    variant: isActive ? 'solid' : 'ghost',
    color: isActive ? 'white' : inactiveColor,
    bgGradient: isActive ? 'linear(to-b, green.400, green.500)' : undefined,
    boxShadow: isActive ? '0 8px 18px -8px rgba(56, 161, 105, 0.6)' : undefined,
    _hover: isActive
      ? { bgGradient: 'linear(to-b, green.500, green.600)' }
      : { bg: hoverBg, color: 'green.500' },
    _active: { transform: 'scale(0.97)' },
    transition: 'all 0.15s ease-out',
  })

  return (
    <>
      <Divider borderColor={dividerColor} />
      <Flex alignItems="center" gap="2" py="2" mb="1">
        <Link style={{ width: '100%' }} to="/">
          <Button {...navButton(false)}>Torneos</Button>
        </Link>
        <Link style={{ width: '100%' }} to="/tournaments/$tournamentId" params={{ tournamentId }}>
          <Button {...navButton(state === 'vaticinios')}>Vaticinios</Button>
        </Link>
        <Link style={{ width: '100%' }} to="/tournaments/$tournamentId/points" params={{ tournamentId }}>
          <Button {...navButton(state === 'puntos')}>Puntos</Button>
        </Link>
      </Flex>
    </>
  )
}
