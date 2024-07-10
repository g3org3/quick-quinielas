import { createFileRoute } from '@tanstack/react-router'
import { useMutation, useQuery } from '@tanstack/react-query'
import { Table, Thead, Tr, Td, Th, Tbody, Button, Spacer, Text } from '@chakra-ui/react'
import { Flex, Image, useColorModeValue } from '@chakra-ui/react'
import { DateTime } from 'luxon'
import toaster from 'react-hot-toast'

import { Collections, MatchesResponse, PredictionsResponse, ResultsResponse, TournamentsResponse, UsersResponse } from '@/pocketbase-types'
import { pb } from '@/pb'
import Loading from '@/components/Loading'
import { getCountryCode } from '@/countries'
import BottomNav from '@/components/BottomNav'
import { queryClient } from '@/queryClient'

export const Route = createFileRoute('/tournaments/$tournamentId/matches/$matchId')({
  component: SingleMatch
})

const isAdmin = true

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

  const { data: results = [], isLoading: isLoadingP } = useQuery({
    queryKey: ['get-all', Collections.Results, matchId],
    queryFn: () => pb.collection(Collections.Results)
      .getFullList<ResultsResponse<number, { user: UsersResponse, prediction_id: PredictionsResponse }>>({
        filter: `match_id = '${matchId}'`,
        expand: 'user,prediction_id',
        sort: '-points'
      })
  })

  const { mutate: onDelete } = useMutation({
    mutationFn: (id: string) => pb.collection(Collections.Predictions).delete(id),
    onError(e) {
      toaster.error(e.message)
    },
    onSuccess() {
      toaster.success('deleted')
      queryClient.invalidateQueries({
        queryKey: ['get-all', Collections.Results, matchId]
      })
    }
  })

  const total = users.length
  const homeper = Math.floor(100 * results.filter(p => p.p_home > p.p_away).length / total)
  const awayper = Math.floor(100 * results.filter(p => p.p_home < p.p_away).length / total)
  const tieper = Math.floor(100 * results.filter(p => p.p_home === p.p_away).length / total)

  if (isLoading || isLoadingM || isLoadingP || isLoadingU) return <Loading />

  if (!match) return <div>something went wrong</div>

  return (
    <>
      <h1 style={{ fontWeight: 'bold', letterSpacing: '2px', fontSize: '20px', textAlign: 'center' }}>{tournament?.name}</h1>
      <Flex flexDir="column">
        <Flex alignItems="center" gap="3" mb="3">
          <Flex flex="1" gap="3" alignItems="center">
            <Flex flexDir="column" flex="1" alignItems="center" justifyContent="flex-end">
              <Image src={`https://flagsapi.com/${getCountryCode(match.home)}/flat/64.png`} />
              {match.home}
              <Flex fontFamily="monospace" color="gray.600">{homeper}%</Flex>
            </Flex>
          </Flex>
          <Flex flexDir="column" alignSelf="flex-end">
            <Flex alignItems="center">
              <Flex fontWeight="bold" p="1">{match.homeScore}</Flex>
              <Flex>vs</Flex>
              <Flex fontWeight="bold" p="1">{match.awayScore}</Flex>
            </Flex>
            <br />
            <Flex color="gray.600" fontFamily="monospace" display="box" textAlign="center">{tieper}%</Flex>
          </Flex>
          <Flex flex="1" gap="3" alignItems="center">
            <Flex flexDir="column" flex="1" alignItems="center">
              <Image fallbackSrc="fallbackSrc='https://via.placeholder.com/64'" src={`https://flagsapi.com/${getCountryCode(match.away)}/flat/64.png`} />
              {match.away}
              <Flex fontFamily="monospace" color="gray.600">{awayper}%</Flex>
            </Flex>
          </Flex>
        </Flex>
        <hr />
        <Flex color="gray.500" display="box" pt="1" fontSize="16px" textAlign="center">
          {DateTime.fromSQL(match.startAtUtc).toFormat('EEE MMM dd')}
          {' - '}{DateTime.fromSQL(match.startAtUtc).toFormat('h:mm a')}
        </Flex>
        <Flex color="gray.500" display="box" fontSize="14px" textAlign="center" mb="2">
          {match.location} - {DateTime.fromSQL(match.startAtUtc).toRelative()}
        </Flex>
        <hr />
      </Flex>
      <Flex flexDir="column" flex="1" overflow="auto">
        <Table boxShadow="md" borderRadius="sm">
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
              const result = results.find(p => p.expand?.user.id === user.id)

              return (
                <Tr
                  bg={result?.points === 3 ? green : result?.points === 1 ? yellow : red}
                  key={user.id}>
                  <Td>
                    {user.name}<br />
                    <Text color="gray.500">{result?.expand?.prediction_id?.created ?
                      DateTime.fromSQL(result.expand.prediction_id.created).toFormat('MMM dd h:mm a')
                      : null}</Text>
                  </Td>
                  <Td>{result?.p_home ?? '-'}</Td>
                  <Td>{result?.p_away ?? '-'}</Td>
                  <Td>{result?.points ?? '-'}</Td>
                </Tr>
              )
            })}
          </Tbody>
        </Table>
      </Flex>
      {isAdmin ? <Flex flexDir="column">
        {results.map(p => (
          <Flex gap="3" p="1" borderTop="1px solid" borderColor="gray.100">
            {p.prediction_id} -{p.expand?.user.name} - {p.p_home} {p.p_away}
            <Spacer />
            <Button onClick={() => onDelete(p.prediction_id)} colorScheme="red" size="sm">delete</Button>
          </Flex>
        ))}
      </Flex> : null}
      <BottomNav tournamentId={tournamentId} />
    </>
  )
}
