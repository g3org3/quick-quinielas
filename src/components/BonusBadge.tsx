import { Badge } from "@chakra-ui/react";

export function BonusBadge() {
  return (
    <Badge
      alignSelf="center"
      bg="gold.50"
      borderWidth="1px"
      borderColor="gold.200"
      color="gold.700"
      fontFamily="mono"
      rounded="md"
    >
      ×2
    </Badge>
  );
}
