import { useQuery } from '@tanstack/react-query'
import { Link, createFileRoute } from '@tanstack/react-router'
import { pb } from '../pb'
import { Collections, TournamentsResponse } from '../pocketbase-types'
import { Button, Flex, useColorModeValue } from '@chakra-ui/react'
import Loading from '../components/Loading'

export const Route = createFileRoute('/')({
  component: Home,
})

function Home() {
  const border = useColorModeValue('gray.200', 'gray.700')
  const btn = useColorModeValue('white', undefined)
  const { data = [], isLoading } = useQuery({
    queryKey: ['get-all', Collections.Tournaments],
    queryFn: () => pb.collection(Collections.Tournaments)
      .getFullList<TournamentsResponse>()
  })


  if (isLoading) return <Loading />

  return <>
    <h1 style={{ fontWeight: 'bold' }}>Torneos</h1>
    <Flex gap="2" flexDirection="column">
      {data.map(tournament => (
        <Link key={tournament.id} to="/tournaments/$tournamentId" params={{ tournamentId: tournament.id }}>
          <Button width="100%" bg={btn} border="1px solid" boxShadow="sm" borderColor={border}>
            <Flex>{tournament.name}</Flex>
          </Button>
        </Link>
      ))}
    </Flex>
  </>
}
