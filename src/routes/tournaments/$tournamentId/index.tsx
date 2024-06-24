import { createFileRoute, Link } from '@tanstack/react-router'
import { Collections, MatchesResponse, PredictionsRecord, PredictionsResponse, TournamentsResponse } from '../../../pocketbase-types'
import { useMutation, useQuery } from '@tanstack/react-query'
import { pb } from '../../../pb'
import Loading from '../../../components/Loading'
import { Button, Flex, Img, Input, useColorModeValue } from '@chakra-ui/react'
import { DateTime } from 'luxon'
import toaster from 'react-hot-toast'
import { getCountryCode } from '../../../countries'
import { z } from 'zod'
import { useEffect } from 'react'

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
        {matches.map(match => <Match key={match.id} match={match} />)}
        {matches.length === 0 ? <>No hay partidos</> : null}
      </Flex>
      <hr />
      <Flex alignItems="center" gap="2">
        <Link style={{ width: '100%' }} to="/">
          <Button w="100%" variant="ghost">Torneos</Button>
        </Link>
        <Link style={{ width: '100%' }} to="/tournaments/$tournamentId" params={{ tournamentId }}>
          <Button isActive w="100%" variant="ghost">Vaticinios</Button>
        </Link>
        <Link style={{ width: '100%' }} to="/tournaments/$tournamentId/points" params={{ tournamentId }}>
          <Button w="100%" variant="ghost">Puntos</Button>
        </Link>
      </Flex>
    </>
  )
}

function Match({ match }: { match: MatchesResponse }) {
  const border = useColorModeValue('gray.200', 'gray.700')
  const { tournamentId } = Route.useParams()
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
      form[key] = Number(value) || 0
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
  const isGameStarted = DateTime.fromSQL(match.startAtUtc).toMillis() <= DateTime.now().toMillis()

  return (
    <form onSubmit={onUpdate}>
      <Flex flexDir="column" borderBottom="1px solid" borderColor={border} py="5">
        <Flex alignItems="center" gap="3">
          <Flex flex="1" gap="3" alignItems="center">
            <Flex flex="1" flexDir="column" alignItems="center" justifyContent="flex-end">
              <Img src={`https://flagsapi.com/${getCountryCode(match.home)}/flat/64.png`} />
              {match.home}
            </Flex>
            <Input
              defaultValue={home}
              disabled={isAnyPending || isGameStarted}
              p="1"
              name="home"
              textAlign="center"
              placeholder="-"
              w="40px" />
          </Flex>
          <Flex>vs</Flex>
          <Flex flex="1" gap="3" alignItems="center">
            <Input
              defaultValue={away}
              disabled={isAnyPending || isGameStarted}
              textAlign="center"
              p="1"
              name="away"
              placeholder="-"
              w="40px" />
            <Flex flex="1" alignItems="center" flexDir="column">
              <Img src={`https://flagsapi.com/${getCountryCode(match.away)}/flat/64.png`} />
              {match.away}
            </Flex>
          </Flex>
          {!isGameStarted
            ? <Button
              disabled={isAnyPending}
              type="submit"
              size="sm"
              variant="solid"
              colorScheme="green"> save
            </Button>
            : (
              <Link
                to="/tournaments/$tournamentId/matches/$matchId"
                params={{ tournamentId, matchId: match.id }}>
                <Button
                  disabled={isAnyPending}
                  size="sm"
                  variant="solid"
                  colorScheme="blue">ver
                </Button>
              </Link>
            )}
        </Flex>
        <Flex color="gray.500" display="box" fontSize="14px" textAlign="center">
          {DateTime.fromSQL(match.startAtUtc).toFormat('EEE MMM dd ')}
          hora: {DateTime.fromSQL(match.startAtUtc).toFormat('HH:mm')}
        </Flex>
      </Flex>
    </form>
  )
}

