import { Badge } from "@chakra-ui/react";

interface Props {
  roundNumber: number;
}

export const FINAL_ROUND_NUMBER = 8;

const label = [
  "Fase Grupos",
  "Fase Grupos",
  "Fase Grupos",
  "Fase Grupos",
  "16avos",
  "Octavos",
  "Cuartos",
  "SemiFinal",
  "FINAL",
];
export function PhaseBadge(props: Props) {
  return (
    <>
      <Badge
        alignSelf="center"
        colorScheme="gray"
        rounded="full"
        px={2}
        fontFamily="mono"
        letterSpacing="wider"
      >
        {label[props.roundNumber]}
      </Badge>
    </>
  );
}
