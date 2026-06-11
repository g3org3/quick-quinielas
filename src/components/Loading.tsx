import {
  Flex,
  Heading,
  Progress,
  Text,
  keyframes,
  useColorModeValue,
} from '@chakra-ui/react'

const rise = keyframes`
  from { opacity: 0; transform: translateY(14px); }
  to { opacity: 1; transform: translateY(0); }
`

const pulse = keyframes`
  0%, 100% { transform: scale(1); box-shadow: 0 8px 20px -6px rgba(56, 161, 105, 0.55); }
  50% { transform: scale(1.08); box-shadow: 0 12px 28px -6px rgba(56, 161, 105, 0.7); }
`

export default function Loading() {
  const mutedText = useColorModeValue('gray.500', 'gray.400')
  const trackBg = useColorModeValue('green.100', 'whiteAlpha.200')

  return (
    <Flex
      flexDir="column"
      justifyContent="center"
      alignItems="center"
      flex="1"
      gap="4"
      animation={`${rise} 0.5s ease-out`}
    >
      <Flex
        w="14"
        h="14"
        alignItems="center"
        justifyContent="center"
        fontSize="3xl"
        borderRadius="full"
        bgGradient="linear(to-br, green.400, green.600)"
        animation={`${pulse} 1.4s ease-in-out infinite`}
      >
        ⚽
      </Flex>
      <Flex flexDir="column" alignItems="center" gap="1">
        <Heading size="md" letterSpacing="tight">
          Cargando
        </Heading>
        <Text fontSize="sm" color={mutedText}>
          Preparando la cancha...
        </Text>
      </Flex>
      <Progress
        size="xs"
        isIndeterminate
        colorScheme="green"
        bg={trackBg}
        borderRadius="full"
        w="full"
        maxW="240px"
      />
    </Flex>
  )
}
