import { createFileRoute } from '@tanstack/react-router'
import { Collections, MatchesResponse, ResultsResponse, TournamentsResponse, UsersResponse } from '../../../../pocketbase-types'
import { pb } from '../../../../pb'
import { useQuery } from '@tanstack/react-query'
import { Flex, Input } from '@chakra-ui/react'
import { Table, Tr, Td, Th, Tbody } from '@chakra-ui/react'
import { DateTime } from 'luxon'
import Loading from '../../../../components/Loading'

export const Route = createFileRoute('/tournaments/$tournamentId/matches/$matchId')({
  component: SingleMatch
})

function SingleMatch() {
  const { matchId, tournamentId } = Route.useParams()

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

  const { data: predictions = [], isLoading: isLoadingP } = useQuery({
    queryKey: ['get-all', Collections.Results, matchId],
    queryFn: () => pb.collection(Collections.Results)
      .getFullList<ResultsResponse<number, { user: UsersResponse }>>({
        filter: `match_id = '${matchId}'`,
        expand: 'user',
        sort: '-points'
      })
  })

  if (isLoading || isLoadingM || isLoadingP) return <Loading />

  if (!match) return <div>something went wrong</div>

  return (
    <>
      <h1 style={{ fontWeight: 'bold' }}>Torneos / {tournament?.name}</h1>
      <Flex flexDir="column">
        <Flex alignItems="center" gap="3">
          <Flex flex="1" gap="3">
            <Flex flex="1" alignItems="center" justifyContent="flex-end">{match.home}</Flex>
            <Input disabled defaultValue={match.homeScore} p="1" name="home" textAlign="center" placeholder="-" w="40px" />
          </Flex>
          <Flex>vs</Flex>
          <Flex flex="1" gap="3">
            <Input disabled defaultValue={match.awayScore} textAlign="center" p="1" name="away" placeholder="-" w="40px" />
            <Flex flex="1" alignItems="center">{match.away}</Flex>
          </Flex>
        </Flex>
        <Flex display="box" fontSize="14px" textAlign="center">
          {DateTime.fromSQL(match.startAtUtc).toFormat('EEE MMM dd ')}
          hora: {DateTime.fromSQL(match.startAtUtc).toFormat('HH:mm')}
        </Flex>
      </Flex>
      <Table>
        <Tr>
          <Th>Participante</Th>
          <Th>{match.home}</Th>
          <Th>{match.away}</Th>
          <Th>Puntos</Th>
        </Tr>
        <Tbody>
          {predictions.map(prediction => (
            <Tr key={prediction.id}>
              <Td>{prediction.expand?.user.name}</Td>
              <Td>{prediction.p_home}</Td>
              <Td>{prediction.p_away}</Td>
              <Td>{prediction.points}</Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    </>
  )
}
