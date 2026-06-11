import { Flex, Heading, Img, Text, keyframes, useColorModeValue } from '@chakra-ui/react'
import { Link, createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'

import Loading from '@/components/Loading'
import { Collections, TournamentsResponse } from '@/pocketbase-types'
import { pb } from '@/pb'

export const Route = createFileRoute('/')({
  component: Home,
})

const rise = keyframes`
  from { opacity: 0; transform: translateY(14px); }
  to { opacity: 1; transform: translateY(0); }
`

function Home() {
  const cardBg = useColorModeValue('white', 'gray.800')
  const cardBorder = useColorModeValue('blackAlpha.100', 'whiteAlpha.200')
  const cardShadow = useColorModeValue(
    '0 12px 30px -14px rgba(26, 70, 50, 0.25)',
    '0 12px 30px -14px rgba(0, 0, 0, 0.6)'
  )
  const cardHoverShadow = useColorModeValue(
    '0 20px 40px -14px rgba(26, 70, 50, 0.35)',
    '0 20px 40px -14px rgba(0, 0, 0, 0.7)'
  )
  const mutedText = useColorModeValue('gray.500', 'gray.400')
  const { data = [], isLoading } = useQuery({
    queryKey: ['get-all', Collections.Tournaments, '-sort'],
    queryFn: () => pb.collection(Collections.Tournaments)
      .getFullList<TournamentsResponse>({sort: '-created'})
  })


  if (isLoading) return <Loading />

  return <>
    <Flex flexDir="column" gap="1" px="2" animation={`${rise} 0.5s ease-out`}>
      <Heading size="lg" letterSpacing="tight">Torneos</Heading>
      <Text fontSize="sm" color={mutedText}>
        Elige tu cancha y empieza a vaticinar.
      </Text>
    </Flex>
    <Flex gap="5" flexDirection="column">
      {data.map((tournament, i) => (
        <Link key={tournament.id} to="/tournaments/$tournamentId" params={{ tournamentId: tournament.id }}>
          <Flex
            alignItems="center"
            gap="5"
            h="120px"
            width="100%"
            px="5"
            bg={cardBg}
            borderRadius="2xl"
            border="1px solid"
            borderColor={cardBorder}
            boxShadow={cardShadow}
            animation={`${rise} 0.5s ease-out ${i * 0.08}s backwards`}
            _hover={{
              transform: 'translateY(-2px)',
              boxShadow: cardHoverShadow,
              borderColor: 'green.300',
            }}
            _active={{ transform: 'translateY(0) scale(0.99)' }}
            transition="all 0.15s ease-out"
          >
            <Flex borderRight="1px solid" borderColor={cardBorder} pr="5">
              <Img width="100px" height="100px" src={tournament.logo} />
            </Flex>
            <Text fontWeight="semibold" letterSpacing="tight">
              {tournament.name}
            </Text>
          </Flex>
        </Link>
      ))}
    </Flex>
  </>
}
