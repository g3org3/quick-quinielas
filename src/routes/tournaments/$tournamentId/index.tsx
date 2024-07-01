import { Button, Flex } from '@chakra-ui/react'
import { createFileRoute, Link } from '@tanstack/react-router'
import { useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { z } from 'zod'
import { DateTime } from 'luxon'

import { Collections, MatchesResponse, TournamentsResponse } from '@/pocketbase-types'
import { pb } from '@/pb'
import Loading from '@/components/Loading'
import BottomNav from '@/components/BottomNav'
import Match from '@/components/Match'

const homeSchema = z.object({
  tab: z.enum(['today', 'tomorrow', 'ayer', 'ante', 'pasado']).nullish(),
})

export const Route = createFileRoute('/tournaments/$tournamentId/')({
  component: HomeTournament,
  validateSearch: homeSchema,
})

function HomeTournament() {
  const { tournamentId } = Route.useParams()
  const { tab = JSON.parse(localStorage.getItem('tab') || '"today"') } = Route.useSearch()

  useEffect(() => {
    localStorage.setItem('tab', JSON.stringify(tab))
  }, [tab])

  let today = tab === 'today' ? DateTime.now().toUTC() : DateTime.now().toUTC().plus({ days: 1 })
  today = tab === 'ayer' ? DateTime.now().toUTC().minus({ days: 1 }) : today
  today = tab === 'ante' ? DateTime.now().toUTC().minus({ days: 2 }) : today
  today = tab === 'pasado' ? DateTime.now().toUTC().plus({ days: 2 }) : today
  const nextDay = today.plus({ days: 1 })
  const todayUtc = `${today.toSQLDate()} 00:00:00Z`
  const nextDayUtc = `${nextDay.toSQLDate()} 00:00:00Z`

  const { data: tournament, isLoading: isLoadingTournaments } = useQuery({
    queryKey: ['get-one', Collections.Tournaments, tournamentId],
    queryFn: () => pb.collection(Collections.Tournaments)
      .getOne<TournamentsResponse>(tournamentId)
  })

  const { data: matches = [], isLoading: isLoadingMatches } = useQuery({
    queryKey: ['get-all', Collections.Matches, tournamentId, `${todayUtc}-${nextDayUtc}`],
    queryFn: () => pb.collection(Collections.Matches)
      .getFullList<MatchesResponse>({
        filter: `tournament = '${tournamentId}' && startAtUtc > '${todayUtc}' && startAtUtc < '${nextDayUtc}'`,
        sort: 'matchNumber'
      })
  })

  if (isLoadingMatches || isLoadingTournaments) return <Loading />

  return (
    <>
      <h1 style={{ fontWeight: 'bold', letterSpacing: '2px', fontSize: '20px', textAlign: 'center' }}>{tournament?.name}</h1>
      <Flex gap="1" mt="5" justifyContent="center">
        <Link to="/tournaments/$tournamentId" params={{ tournamentId }} search={{ tab: 'ante' }}>
          <Button variant="ghost" isActive={tab === 'ante'}>Ante</Button></Link>
        <Link to="/tournaments/$tournamentId" params={{ tournamentId }} search={{ tab: 'ayer' }}>
          <Button variant="ghost" isActive={tab === 'ayer'}>Ayer</Button></Link>
        <Link to="/tournaments/$tournamentId" params={{ tournamentId }} search={{ tab: 'today' }}>
          <Button variant="ghost" isActive={tab === 'today'}>Hoy</Button></Link>
        <Link to="/tournaments/$tournamentId" params={{ tournamentId }} search={{ tab: 'tomorrow' }}>
          <Button variant="ghost" isActive={tab === 'tomorrow'}>Manana</Button></Link>
        <Link to="/tournaments/$tournamentId" params={{ tournamentId }} search={{ tab: 'pasado' }}>
          <Button variant="ghost" isActive={tab === 'pasado'}>Pasado</Button></Link>
      </Flex>
      <Flex flexDir="column" flex="1">
        {matches.map(match => <Match key={match.id} match={match} tournamentId={tournamentId} />)}
        {matches.length === 0 ? <>No hay partidos</> : null}
      </Flex>
      <BottomNav state='vaticinios' tournamentId={tournamentId} />
    </>
  )
}
