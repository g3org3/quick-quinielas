import { useColorModeValue } from "@chakra-ui/react";
import { PredictionsResponse, ResultsResponse } from "./pocketbase-types";

export const useGetRowStyle = () => {
  const green = useColorModeValue("green.100", "green.800");
  const yellow = useColorModeValue("yellow.100", "yellow.800");
  const blue = useColorModeValue("blue.100", "blue.800");
  const red = useColorModeValue("red.50", "red.800");

  return (params: {
    result: ResultsResponse | undefined;
    prediction: PredictionsResponse | undefined;
  }) => {
    const { prediction, result } = params;
    if (prediction?.isBonusActive) {
      return {
        bgGradient: "linear(to-br, red.600, red.900, orange.500)",
        color: "white",
        bg: undefined,
      };
    }

    let bg = red;
    if (result?.exact_score) {
      bg = green;
    } else if (result?.correct_result) {
      bg = yellow;
    } else if ((result?.points ?? 0) > 0) {
      bg = blue;
    }

    return { bgGradient: undefined, color: undefined, bg };
  };
};
