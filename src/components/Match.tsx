import toaster from 'react-hot-toast'
import { Button, Flex, Img, Input, useColorModeValue } from '@chakra-ui/react'
import { DateTime } from 'luxon'
import { Link } from '@tanstack/react-router'
import { useMutation, useQuery } from '@tanstack/react-query'

import { Collections, MatchBetsResponse, MatchesResponse, PredictionsRecord, PredictionsResponse } from '@/pocketbase-types'
import { getCountryCode } from '@/countries'
import { pb } from '@/pb'

interface Props {
  bet?: MatchBetsResponse<number, number, number>
  match: MatchesResponse
  tournamentId: string
}
export default function Match({ match, tournamentId, bet }: Props) {
  const border = useColorModeValue('gray.200', 'gray.700')
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
  const matchdate = DateTime.fromSQL(match.startAtUtc)
  const isGameStarted = matchdate.toMillis() <= DateTime.now().toMillis()

  return (
    <form onSubmit={onUpdate}>
      <Flex flexDir="column" borderBottom="1px solid" borderColor={border} py="5">
        <Flex alignItems="center" gap="3">
          <Flex flex="1" gap="3" alignItems="center">
            <Flex flex="1" flexDir="column" alignItems="center" justifyContent="flex-end">
              <Img src={`https://flagsapi.com/${getCountryCode(match.home)}/flat/64.png`} />
              {match.home}
              <Flex color="gray.500" fontFamily="monospace">{Math.floor(100 * (bet?.home_per || 0) / 8)}%</Flex>
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
              <Flex color="gray.500" fontFamily="monospace">{Math.floor(100 * (bet?.away_per || 0) / 8)}%</Flex>
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
          {matchdate.toFormat('EEE MMM dd ')} - hora: {matchdate.toFormat('h:mm a')}
          <br />
          {match.location} {' - '}
          {matchdate.toRelative()}
        </Flex>
      </Flex>
    </form>
  )
}
