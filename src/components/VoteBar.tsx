import { Box, Flex, HStack, Text, useColorModeValue } from "@chakra-ui/react";

interface Props {
  homeLabel: string;
  awayLabel: string;
  homeCount: number;
  awayCount: number;
  tieCount: number;
  // Total participants; the remainder (tie + not voted) fills the middle segment.
  total: number;
  onDark?: boolean;
}

// Segmented vote bar: home win · tie/not voted · away win (guide.md §3 — labeled).
export function VoteBar(props: Props) {
  const {
    homeLabel,
    awayLabel,
    homeCount,
    awayCount,
    tieCount,
    total,
    onDark,
  } = props;
  const midColor = useColorModeValue("gray.300", "gray.600");
  const trackColor = useColorModeValue("gray.100", "gray.700");
  const labelColor = onDark ? "whiteAlpha.800" : "text.muted";

  const denom = Math.max(total, homeCount + awayCount + tieCount, 1);
  const homePct = Math.round((homeCount / denom) * 100);
  const awayPct = Math.round((awayCount / denom) * 100);
  const midPct = Math.max(0, 100 - homePct - awayPct);

  return (
    <Box>
      <Flex h="8px" rounded="full" overflow="hidden" bg={trackColor}>
        <Box w={`${homePct}%`} bg="brand.500" />
        <Box w={`${midPct}%`} bg={midColor} />
        <Box w={`${awayPct}%`} bg="blue.400" />
      </Flex>
      <Flex
        justifyContent="space-between"
        mt={1.5}
        fontSize="xs"
        color={labelColor}
      >
        <HStack spacing={1} minW={0}>
          <Box boxSize="7px" rounded="full" bg="brand.500" flexShrink={0} />
          <Text noOfLines={1}>
            {homeLabel} {homePct}%
          </Text>
        </HStack>
        <HStack spacing={1} minW={0}>
          <Box boxSize="7px" rounded="full" bg={midColor} flexShrink={0} />
          <Text noOfLines={1}>Empate/sin votar {midPct}%</Text>
        </HStack>
        <HStack spacing={1} minW={0}>
          <Box boxSize="7px" rounded="full" bg="blue.400" flexShrink={0} />
          <Text noOfLines={1}>
            {awayLabel} {awayPct}%
          </Text>
        </HStack>
      </Flex>
    </Box>
  );
}
