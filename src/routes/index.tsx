import { Box, Flex, Heading, Img, Text, keyframes, useColorModeValue } from '@chakra-ui/react'
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

const shimmer = keyframes`
  from { transform: translateX(0); opacity: 0.7; }
  to { transform: translateX(500%); opacity: 0; }
`

function Home() {
  const cardBg = useColorModeValue('white', 'gray.800')
  const cardBorder = useColorModeValue('blackAlpha.100', 'whiteAlpha.200')
  const cardShadow = useColorModeValue(
    '0 12px 30px -14px rgba(26, 70, 50, 0.25)',
    '0 12px 30px -14px rgba(0, 0, 0, 0.6)'
  )
  const cardHoverShadow = useColorModeValue(
    '0 20px 40px -14px rgba(26, 70, 50, 0.38)',
    '0 20px 40px -14px rgba(0, 0, 0, 0.72)'
  )
  const logoBg = useColorModeValue('gray.50', 'whiteAlpha.50')
  const logoBorder = useColorModeValue('blackAlpha.100', 'whiteAlpha.100')
  const mutedText = useColorModeValue('gray.500', 'gray.400')
  const arrowColor = useColorModeValue('gray.300', 'whiteAlpha.400')
  const shimmerGradient = useColorModeValue(
    'linear(to-r, transparent, blackAlpha.100, transparent)',
    'linear(to-r, transparent, whiteAlpha.100, transparent)'
  )

  const { data = [], isLoading } = useQuery({
    queryKey: ['get-all', Collections.Tournaments, '-sort'],
    queryFn: () =>
      pb.collection(Collections.Tournaments).getFullList<TournamentsResponse>({ sort: '-created' }),
  })

  if (isLoading) return <Loading />

  return (
    <>
      <Flex flexDir="column" gap="1" px="2" animation={`${rise} 0.5s ease-out`}>
        <Heading size="lg" letterSpacing="tight">
          Torneos
        </Heading>
        <Text fontSize="sm" color={mutedText}>
          Elige tu cancha y empieza a vaticinar.
        </Text>
      </Flex>

      {data.length === 0 ? (
        <Flex
          flexDir="column"
          alignItems="center"
          justifyContent="center"
          flex="1"
          gap="3"
          py="16"
          animation={`${rise} 0.6s ease-out`}
        >
          <Text fontSize="6xl" lineHeight="1">
            🏆
          </Text>
          <Flex flexDir="column" alignItems="center" gap="1">
            <Text fontWeight="semibold" letterSpacing="tight">
              Sin torneos por ahora
            </Text>
            <Text fontSize="sm" color={mutedText} textAlign="center">
              Vuelve pronto para encontrar tu liga.
            </Text>
          </Flex>
        </Flex>
      ) : (
        <Flex gap="4" flexDirection="column">
          {data.map((tournament, i) => (
            <Link
              key={tournament.id}
              to="/tournaments/$tournamentId"
              params={{ tournamentId: tournament.id }}
            >
              <Flex
                role="group"
                position="relative"
                overflow="hidden"
                alignItems="center"
                gap="4"
                h="96px"
                width="100%"
                px="4"
                bg={cardBg}
                borderRadius="2xl"
                border="1px solid"
                borderColor={cardBorder}
                boxShadow={cardShadow}
                animation={`${rise} 0.5s ease-out ${i * 0.08}s backwards`}
                _hover={{
                  transform: 'translateY(-3px)',
                  boxShadow: cardHoverShadow,
                  borderColor: 'green.300',
                }}
                _active={{ transform: 'translateY(0) scale(0.99)' }}
                transition="all 0.18s ease-out"
              >
                <Box
                  position="absolute"
                  top="0"
                  left="-60%"
                  w="50%"
                  h="full"
                  bgGradient={shimmerGradient}
                  pointerEvents="none"
                  _groupHover={{
                    animation: `${shimmer} 0.55s ease-out`,
                  }}
                />
                <Flex
                  w="68px"
                  h="68px"
                  flexShrink={0}
                  alignItems="center"
                  justifyContent="center"
                  bg={logoBg}
                  borderRadius="xl"
                  border="1px solid"
                  borderColor={logoBorder}
                  overflow="hidden"
                  p="2"
                >
                  <Img w="full" h="full" src={tournament.logo} objectFit="contain" />
                </Flex>
                <Flex flex="1" flexDir="column">
                  <Text fontWeight="semibold" letterSpacing="tight" fontSize="md" noOfLines={2}>
                    {tournament.name}
                  </Text>
                </Flex>
                <Text color={arrowColor} fontSize="xl" fontWeight="light" mr="1">
                  ›
                </Text>
              </Flex>
            </Link>
          ))}
        </Flex>
      )}
    </>
  )
}
