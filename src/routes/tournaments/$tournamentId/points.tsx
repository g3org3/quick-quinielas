import { createFileRoute, Link } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import {
  Flex,
  Table,
  TableContainer,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  Img,
} from '@chakra-ui/react'
import { datadogLogs } from '@datadog/browser-logs';

import { Collections, LeaderboardResponse, TournamentsResponse, UsersRecord } from '@/pocketbase-types'
import { pb } from '@/pb'
import Loading from '@/components/Loading'
import BottomNav from '@/components/BottomNav'
import { useEffect } from 'react';

export const Route = createFileRoute('/tournaments/$tournamentId/points')({
  component: Points,
})

function Points() {
  const { tournamentId } = Route.useParams()

  useEffect(() => {
    datadogLogs.logger.info('view-points', { user: pb.authStore.model?.email })
  }, [])

  const { data: tournament, isLoading } = useQuery({
    queryKey: ['get-one', Collections.Tournaments, tournamentId],
    queryFn: () => pb.collection(Collections.Tournaments)
      .getOne<TournamentsResponse>(tournamentId)
  })

  const { data: leaderboard = [], isLoading: lisLoading } = useQuery({
    queryKey: ['get-all', Collections.Leaderboard, tournamentId],
    queryFn: () => pb.collection(Collections.Leaderboard)
      .getFullList<LeaderboardResponse<number, { user: UsersRecord }>>({
        filter: `tournament_id = '${tournamentId}'`,
        expand: 'user',
        sort: '-points',
      })
  })


  if (isLoading || lisLoading) return <Loading />

  return <>
    <h1 style={{ fontWeight: 'bold', letterSpacing: '2px', fontSize: '20px', textAlign: 'center' }}>{tournament?.name}</h1>
    <Flex flex="1" flexDir="column">
      <TableContainer>
        <Table variant='simple'>
          <Thead>
            <Tr>
              <Th>Participante</Th>
              <Th>Puntos</Th>
            </Tr>
          </Thead>
          <Tbody>
            {leaderboard.map((row, i) => (
              <Tr key={row.id}>
                <Td display="flex" alignItems="center" gap="3">
                  <span>{i + 1}.</span>
                  <Img
                    rounded="full"
                    w="40px"
                    h="40px"
                    // @ts-expect-error we dont care
                    src={row.expand?.user.img || `https://api.dicebear.com/9.x/initials/svg?seed=${row.expand?.user.username}`}
                  />
                  <Link to="/tournaments/$tournamentId/$userId" params={{ tournamentId, userId: row.user }}>
                    {row.expand?.user.name}
                  </Link>
                </Td>
                <Td>{row.points}</Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </TableContainer>
    </Flex>
    <BottomNav tournamentId={tournamentId} state='puntos' />
  </>
}
