import { createFileRoute, Link } from '@tanstack/react-router'
import { Collections, LeaderboardResponse, TournamentsResponse, UsersRecord } from '../../../pocketbase-types'
import { pb } from '../../../pb'
import { useQuery } from '@tanstack/react-query'
import Loading from '../../../components/Loading'
import {
  Flex,
  Button,
  Table,
  TableContainer,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  Img,
} from '@chakra-ui/react'

export const Route = createFileRoute('/tournaments/$tournamentId/points')({
  component: Points,
})

function Points() {
  const { tournamentId } = Route.useParams()

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
    <h1 style={{ fontWeight: 'bold', fontSize: '20px', textAlign: 'center' }}>{tournament?.name}</h1>
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
            {leaderboard.map(row => (
              <Tr key={row.id}>
                <Td display="flex" alignItems="center" gap="2">
                  <Img
                    rounded="full"
                    w="40px"
                    h="40px"
                    // @ts-expect-error we dont care
                    src={row.expand?.user.img || `https://api.dicebear.com/9.x/initials/svg?seed=${row.expand?.user.username}`}
                  />
                  {row.expand?.user.name}
                </Td>
                <Td>{row.points}</Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </TableContainer>
    </Flex>
    <hr />
    <Flex alignItems="center" gap="2">
      <Link style={{ width: '100%' }} to="/">
        <Button w="100%" variant="ghost">Torneos</Button>
      </Link>
      <Link style={{ width: '100%' }} to="/tournaments/$tournamentId" params={{ tournamentId }}>
        <Button w="100%" variant="ghost">Vaticinios</Button>
      </Link>
      <Link style={{ width: '100%' }} to="/tournaments/$tournamentId/points" params={{ tournamentId }}>
        <Button isActive w="100%" variant="ghost">Puntos</Button>
      </Link>
    </Flex>
  </>
}
