import { useQuery } from '@tanstack/react-query'
import { Flex, Image, Table, Th, Td, Tr, Tbody, Thead, useColorModeValue, Spacer, Button } from '@chakra-ui/react'
import { Link, createFileRoute } from '@tanstack/react-router'

import { pb } from '@/pb'
import { Collections, MatchesResponse, ResultsResponse, UsersResponse } from '@/pocketbase-types'
import Loading from '@/components/Loading'
import BottomNav from '@/components/BottomNav'
import { getCountryCode } from '@/countries'

export const Route = createFileRoute('/tournaments/$tournamentId/$userId')({
  component: UserPredictions,
})

function UserPredictions() {
  const { tournamentId, userId } = Route.useParams()
  const { data: user, isLoading: isLoadingUser } = useQuery({
    queryKey: ['get-one', Collections.Users, userId],
    queryFn: () => pb.collection(Collections.Users).getOne<UsersResponse>(userId)
  })
  const { data: results = [], isLoading } = useQuery({
    queryKey: ['get-all', Collections.Results, tournamentId, userId],
    queryFn: () => pb.collection(Collections.Results)
      .getFullList<ResultsResponse<number, { match_id: MatchesResponse }>>({
        filter: `tournament_id = '${tournamentId}' && user = '${userId}' && points > 0`,
        expand: 'match_id'
      })
  })
  const green = useColorModeValue('green.100', 'green.800')
  const yellow = useColorModeValue('yellow.100', 'yellow.800')
  const red = useColorModeValue('red.50', 'red.800')

  if (isLoading || !user || isLoadingUser) return <Loading />

  const total = results.reduce((sum, p) => sum + (p.points || 0), 0)

  return <>
    <Flex flexDir="column" flex="1">
      <hr />
      <Flex alignItems="center" gap="3" p="3">
        <Image
          rounded="full"
          w="40px"
          h="40px"
          src={user.img || `https://api.dicebear.com/9.x/initials/svg?seed=${user.username}`}
        />
        {user.name}
        <Spacer />
        {total} puntos
      </Flex>
      <hr />
      <Table boxShadow="md" borderRadius="sm">
        <Thead>
          <Tr>
            <Th></Th>
            <Th>local</Th>
            <Th>-</Th>
            <Th>-</Th>
            <Th>visita</Th>
            <Th>pts</Th>
          </Tr>
        </Thead>
        <Tbody>
          {results.map(result => {
            return (
              <Tr bg={result?.points === 3 ? green : result?.points === 1 ? yellow : red} key={result.id}>
                <Td>
                  <Link
                    to="/tournaments/$tournamentId/matches/$matchId"
                    params={{ tournamentId, matchId: result.match_id }}>
                    <Button size="xs" colorScheme='blue'>ver</Button>
                  </Link>
                </Td>
                <Td>
                  <Image src={`https://flagsapi.com/${getCountryCode(result.expand?.match_id.home)}/flat/32.png`} />
                </Td>
                <Td>{result?.p_home ?? '-'}</Td>
                <Td>{result?.p_away ?? '-'}</Td>
                <Td>
                  <Image src={`https://flagsapi.com/${getCountryCode(result.expand?.match_id.away)}/flat/32.png`} />
                </Td>
                <Td>{result?.points ?? '-'}</Td>
              </Tr>
            )
          })}
        </Tbody>
      </Table>
    </Flex>
    <BottomNav tournamentId={tournamentId} />
  </>
}
