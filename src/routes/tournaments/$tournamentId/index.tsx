import { createFileRoute, Link } from '@tanstack/react-router'
import { Collections, MatchesResponse, PredictionsRecord, PredictionsResponse, TournamentsResponse } from '../../../pocketbase-types'
import { useMutation, useQuery } from '@tanstack/react-query'
import { pb } from '../../../pb'
import Loading from '../../../components/Loading'
import { Button, Flex, Input } from '@chakra-ui/react'
import { DateTime } from 'luxon'
import toaster from 'react-hot-toast'
import { useState } from 'react'

export const Route = createFileRoute('/tournaments/$tournamentId/')({
  component: HomeTournament,
})

function HomeTournament() {
  const { tournamentId } = Route.useParams()
  const [tab, setTab] = useState<'today' | 'tomorrow' | 'yesterday'>('today')

  const today = tab === 'today' ? DateTime.now().toUTC() : DateTime.now().toUTC().plus({ days: 1 })
  const nextDay = today.plus({ days: 1 })
  const todayUtc = `${today.toSQLDate()} 00:00:00Z`
  const nextDayUtc = `${nextDay.toSQLDate()} 00:00:00Z`

  const { data: tournament, isLoading } = useQuery({
    queryKey: ['get-one', Collections.Tournaments, tournamentId],
    queryFn: () => pb.collection(Collections.Tournaments)
      .getOne<TournamentsResponse>(tournamentId)
  })

  const { data: matches = [], isLoading: misLoading } = useQuery({
    queryKey: ['get-all', Collections.Matches, tournamentId, `${todayUtc}-${nextDayUtc}`],
    queryFn: () => pb.collection(Collections.Matches)
      .getFullList<MatchesResponse>({
        filter: `tournament = '${tournamentId}' && startAtUtc > '${todayUtc}' && startAtUtc < '${nextDayUtc}'`,
        sort: 'matchNumber'
      })
  })

  if (isLoading || misLoading) return <Loading />

  return (
    <>
      <h1 style={{ fontWeight: 'bold' }}>Torneos / {tournament?.name}</h1>
      <Flex gap="1" mb="5" justifyContent="center">
        <Button onClick={() => setTab('today')} variant="ghost" isActive={tab === 'today'}>Hoy</Button>
        <Button onClick={() => setTab('tomorrow')} variant="ghost" isActive={tab === 'tomorrow'}>Manana</Button>
        <Link to="/tournaments/$tournamentId/points" params={{ tournamentId }}>
          <Button variant="ghost">Puntos</Button>
        </Link>
      </Flex>
      {matches.map(match => <Match key={match.id} match={match} />)}
      {matches.length === 0 ? <>No hay partidos Hoy</> : null}
    </>
  )
}

function Match({ match }: { match: MatchesResponse }) {
  const { mutate, isPending } = useMutation({
    mutationFn: (prediction: PredictionsRecord) => pb.collection(Collections.Predictions).create(prediction),
    onSuccess() {
      toaster.success('saved')
    },
    onError(err) {
      toaster.error('Something went wrong: ' + err.message)
    }
  })
  const { mutate: update, isPending: uisPending } = useMutation({
    mutationFn: (params: { id: string, prediction: PredictionsRecord }) =>
      pb.collection(Collections.Predictions).update(params.id, params.prediction),
    onSuccess() {
      toaster.success('saved')
    },
    onError(err) {
      toaster.error('Something went wrong: ' + err.message)
    }
  })
  const { data, isLoading } = useQuery({
    queryKey: ['get-one', Collections.Predictions, `${pb.authStore.model?.id}-${match.id}`],
    queryFn: () => pb.collection(Collections.Predictions)
      .getFullList<PredictionsResponse>({
        filter: `user = '${pb.authStore.model?.id}' && match = '${match.id}'`
      })
  })
  const prediction = data && data[0]?.id ? data[0] : null
  const home = data && data[0] ? data[0].homeScore.toString() : ''
  const away = data && data[0] ? data[0].awayScore.toString() : ''

  const onUpdate: React.FormEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault()
    if (isPending) return

    if (DateTime.now().toMillis() > DateTime.fromSQL(match.startAtUtc).toMillis()) {
      toaster.error('Ya ha empezado el partido!')
      return
    }
    const data = new FormData(e.currentTarget)
    const form: Record<string, number> = {}
    for (const [key, value] of data.entries()) {
      form[key] = Number(value)
    }

    const payload: PredictionsRecord = {
      user: pb.authStore.model?.id,
      homeScore: form.home,
      awayScore: form.away,
      match: match.id,
    }
    if (prediction?.id) update({ id: prediction.id, prediction: payload })
    else mutate(payload)
  }

  const isAnyPending = isLoading || isPending || uisPending

  return (
    <form onSubmit={onUpdate}>
      <Flex flexDir="column">
        <Flex alignItems="center" gap="3">
          <Flex flex="1" gap="3">
            <Flex flex="1" alignItems="center" justifyContent="flex-end">{match.home}</Flex>
            <Input defaultValue={home} disabled={isAnyPending} p="1" name="home" textAlign="center" placeholder="-" w="40px" />
          </Flex>
          <Flex>vs</Flex>
          <Flex flex="1" gap="3">
            <Input defaultValue={away} disabled={isAnyPending} textAlign="center" p="1" name="away" placeholder="-" w="40px" />
            <Flex flex="1" alignItems="center">{match.away}</Flex>
          </Flex>
          <Button disabled={isAnyPending} type="submit" size="sm" variant="outline" colorScheme="purple"> 💾 </Button>
        </Flex>
        <Flex display="box" fontSize="14px" textAlign="center">{match.homeScore} - {match.awayScore}</Flex>
        <Flex display="box" fontSize="14px" textAlign="center">
          {DateTime.fromSQL(match.startAtUtc).toFormat('EEE MMM dd ')}
          hora: {DateTime.fromSQL(match.startAtUtc).toFormat('HH:mm')}
        </Flex>
      </Flex>
    </form>
  )
}
