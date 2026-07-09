import { Box, HStack, Text } from "@chakra-ui/react";

interface Props {
  isClosed: boolean;
  // On the bonus gradient the card text is light; keep the word readable there.
  onDark?: boolean;
}

// Status = quiet dot + word (guide.md §2.3), never a pill competing with the CTA.
export function MatchStatus(props: Props) {
  const { isClosed, onDark } = props;

  return (
    <HStack spacing={1.5} alignSelf="center">
      <Box
        boxSize="7px"
        rounded="full"
        bg={isClosed ? "status.closed" : "status.open"}
      />
      <Text
        fontSize="xs"
        fontWeight="semibold"
        color={onDark ? "whiteAlpha.900" : "text.secondary"}
      >
        {isClosed ? "Cerrado" : "Abierto"}
      </Text>
    </HStack>
  );
}
