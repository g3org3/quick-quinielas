import { Link } from '@tanstack/react-router'
import { Flex, Button } from '@chakra-ui/react'

import { posthog } from '@/posthog'

export default function BottomNav({ tournamentId, state }: { tournamentId: string, state?: 'vaticinios' | 'puntos' }) {
  const onNavClick = (tab: string) => {
    posthog.capture('bottom_nav_clicked', { tab, tournamentId })
  }

  return (
    <>
      <hr />
      <Flex alignItems="center" gap="2" mb="3">
        <Link style={{ width: '100%' }} to="/" onClick={() => onNavClick('torneos')}>
          <Button w="100%" variant="ghost">Torneos</Button>
        </Link>
        <Link style={{ width: '100%' }} to="/tournaments/$tournamentId" params={{ tournamentId }} onClick={() => onNavClick('vaticinios')}>
          <Button isActive={state === 'vaticinios'} w="100%" variant="ghost">Vaticinios</Button>
        </Link>
        <Link style={{ width: '100%' }} to="/tournaments/$tournamentId/points" params={{ tournamentId }} onClick={() => onNavClick('puntos')}>
          <Button isActive={state === 'puntos'} w="100%" variant="ghost">Puntos</Button>
        </Link>
      </Flex>
    </>
  )
}
