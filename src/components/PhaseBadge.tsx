import { Badge } from "@chakra-ui/react";

interface Props {
  roundNumber: number;
}

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
      <Badge alignSelf="center">
        {label[props.roundNumber]}
      </Badge>
    </>
  );
}
