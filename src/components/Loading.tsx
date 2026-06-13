import { Box, Flex, Text, keyframes, useColorModeValue } from '@chakra-ui/react'

const rise = keyframes`
  from { opacity: 0; transform: translateY(22px); }
  to   { opacity: 1; transform: translateY(0); }
`

const pulse = keyframes`
  0%, 100% { opacity: 0.6; transform: scale(1); }
  50%       { opacity: 1;   transform: scale(1.08); }
`

const float = keyframes`
  0%, 100% { transform: translateY(0px); }
  50%       { transform: translateY(-6px); }
`

const slide = keyframes`
  0%   { transform: translateX(-100%); }
  100% { transform: translateX(400%); }
`

export default function Loading() {
  const bg = useColorModeValue('white', 'gray.900')
  const cardBg = useColorModeValue(
    'rgba(255,255,255,0.72)',
    'rgba(26,32,44,0.72)'
  )
  const borderColor = useColorModeValue(
    'rgba(56,161,105,0.18)',
    'rgba(74,222,128,0.14)'
  )
  const trackBg = useColorModeValue(
    'rgba(56,161,105,0.12)',
    'rgba(74,222,128,0.10)'
  )
  const mutedText = useColorModeValue('gray.500', 'gray.400')
  const headingColor = useColorModeValue('gray.800', 'gray.100')

  const radialGlow = useColorModeValue(
    'radial-gradient(ellipse 80% 55% at 50% -5%, rgba(56,161,105,0.20) 0%, transparent 70%)',
    'radial-gradient(ellipse 80% 55% at 50% -5%, rgba(74,222,128,0.22) 0%, transparent 70%)'
  )

  return (
    <Flex
      flexDir="column"
      justifyContent="center"
      alignItems="center"
      flex="1"
      bg={bg}
      position="relative"
      overflow="hidden"
    >
      {/* Background glow */}
      <Box
        position="absolute"
        inset="0"
        bgImage={radialGlow}
        pointerEvents="none"
      />

      <Flex
        flexDir="column"
        alignItems="center"
        gap="5"
        animation={`${rise} 0.5s ease-out`}
        position="relative"
        zIndex="1"
        px="8"
        py="7"
        borderRadius="2xl"
        bg={cardBg}
        backdropFilter="blur(16px)"
        border="1px solid"
        borderColor={borderColor}
        boxShadow={useColorModeValue(
          '0 8px 32px -8px rgba(56,161,105,0.15)',
          '0 8px 32px -8px rgba(0,0,0,0.40)'
        )}
        minW="220px"
      >
        {/* Soccer ball */}
        <Box
          animation={`${pulse} 2.6s ease-in-out infinite, ${float} 3.2s ease-in-out infinite`}
          fontSize="3xl"
          lineHeight="1"
          filter="drop-shadow(0 6px 16px rgba(56,161,105,0.45))"
        >
          ⚽
        </Box>

        {/* Text */}
        <Flex flexDir="column" alignItems="center" gap="1">
          <Text
            fontWeight="700"
            fontSize="md"
            letterSpacing="tight"
            color={headingColor}
            bgGradient="linear(to-r, green.400, teal.400)"
            bgClip="text"
          >
            Cargando
          </Text>
          <Text fontSize="xs" color={mutedText} letterSpacing="wide">
            Preparando la cancha…
          </Text>
        </Flex>

        {/* Progress bar */}
        <Box w="full" maxW="180px" h="3px" bg={trackBg} borderRadius="full" overflow="hidden">
          <Box
            h="full"
            w="1/3"
            borderRadius="full"
            bgGradient="linear(to-r, green.400, teal.400)"
            animation={`${slide} 1.4s ease-in-out infinite`}
          />
        </Box>
      </Flex>
    </Flex>
  )
}
