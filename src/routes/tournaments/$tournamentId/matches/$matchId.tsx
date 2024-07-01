import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { Table, Thead, Tr, Td, Th, Tbody } from '@chakra-ui/react'
import { Flex, Img, Input, useColorModeValue } from '@chakra-ui/react'
import { DateTime } from 'luxon'

import { Collections, MatchesResponse, ResultsResponse, TournamentsResponse, UsersResponse } from '@/pocketbase-types'
import { pb } from '@/pb'
import Loading from '@/components/Loading'
import { getCountryCode } from '@/countries'
import BottomNav from '@/components/BottomNav'

export const Route = createFileRoute('/tournaments/$tournamentId/matches/$matchId')({
  component: SingleMatch
})

function SingleMatch() {
  const { matchId, tournamentId } = Route.useParams()
  const green = useColorModeValue('green.100', 'green.800')
  const yellow = useColorModeValue('yellow.100', 'yellow.800')
  const red = useColorModeValue('red.50', 'red.800')

  const { data: tournament, isLoading } = useQuery({
    queryKey: ['get-one', Collections.Tournaments, tournamentId],
    queryFn: () => pb.collection(Collections.Tournaments)
      .getOne<TournamentsResponse>(tournamentId)
  })

  const { data: match, isLoading: isLoadingM } = useQuery({
    queryKey: ['get-one', Collections.Matches, matchId],
    queryFn: () => pb.collection(Collections.Matches)
      .getOne<MatchesResponse>(matchId)
  })

  const { data: users = [], isLoading: isLoadingU } = useQuery({
    queryKey: ['get-all', Collections.Users],
    queryFn: () => pb.collection(Collections.Users)
      .getFullList<UsersResponse>()
  })

  const { data: predictions = [], isLoading: isLoadingP } = useQuery({
    queryKey: ['get-all', Collections.Results, matchId],
    queryFn: () => pb.collection(Collections.Results)
      .getFullList<ResultsResponse<number, { user: UsersResponse }>>({
        filter: `match_id = '${matchId}'`,
        expand: 'user',
        sort: '-points'
      })
  })

  if (isLoading || isLoadingM || isLoadingP || isLoadingU) return <Loading />

  if (!match) return <div>something went wrong</div>

  return (
    <>
      <h1 style={{ fontWeight: 'bold', letterSpacing: '2px', fontSize: '20px', textAlign: 'center' }}>{tournament?.name}</h1>
      <Flex flexDir="column">
        <Flex alignItems="center" gap="3">
          <Flex flex="1" gap="3" alignItems="center">
            <Flex flexDir="column" flex="1" alignItems="center" justifyContent="flex-end">
              <Img src={`https://flagsapi.com/${getCountryCode(match.home)}/flat/64.png`} />
              {match.home}
            </Flex>
            <Input fontWeight="bold" disabled defaultValue={match.homeScore} p="1" name="home" textAlign="center" placeholder="-" w="40px" />
          </Flex>
          <Flex>vs</Flex>
          <Flex flex="1" gap="3" alignItems="center">
            <Input fontWeight="bold" disabled defaultValue={match.awayScore} textAlign="center" p="1" name="away" placeholder="-" w="40px" />
            <Flex flexDir="column" flex="1" alignItems="center">
              <Img src={`https://flagsapi.com/${getCountryCode(match.away)}/flat/64.png`} />
              {match.away}
            </Flex>
          </Flex>
        </Flex>
        <Flex display="box" fontSize="14px" textAlign="center">
          {DateTime.fromSQL(match.startAtUtc).toFormat('EEE MMM dd ')}
          hora: {DateTime.fromSQL(match.startAtUtc).toFormat('HH:mm')}
        </Flex>
      </Flex>
      <Flex flexDir="column" flex="1">
        <Table>
          <Thead>
            <Tr>
              <Th>Participante</Th>
              <Th>-</Th>
              <Th>-</Th>
              <Th>pts</Th>
            </Tr>
          </Thead>
          <Tbody>
            {users.map(user => {
              const prediction = predictions.find(p => p.expand?.user.id === user.id)
              return (
                <Tr bg={prediction?.points === 3 ? green : prediction?.points === 1 ? yellow : red} key={user.id}>
                  <Td>{user.name}</Td>
                  <Td>{prediction?.p_home ?? '-'}</Td>
                  <Td>{prediction?.p_away ?? '-'}</Td>
                  <Td>{prediction?.points ?? '-'}</Td>
                </Tr>
              )
            })}
          </Tbody>
        </Table>
      </Flex>
      <BottomNav tournamentId={tournamentId} />
    </>
  )
}
