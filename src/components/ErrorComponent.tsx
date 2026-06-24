import type { ErrorComponentProps } from "@tanstack/react-router";
import { Flex, Text, useColorModeValue } from "@chakra-ui/react";
import { usePostHog } from "@posthog/react";
import { useEffect } from "react";

export default function ErrorComponent({ error }: ErrorComponentProps) {
  const bg = useColorModeValue("gray.100", "gray.800");
  const bgsoft = useColorModeValue("gray.50", "gray.900");
  const colorText = useColorModeValue("black", "white");
  const posthog = usePostHog();

  useEffect(() => {
    posthog.captureException(error);
  }, [posthog, error]);

  return (
    <Flex
      flex="1"
      flexDirection="column"
      pt={{ base: "38.2%", md: "15%" }}
      alignItems="center"
      bg={bg}
    >
      <Flex
        p="8"
        w="400px"
        maxW="100%"
        bg={bgsoft}
        boxShadow="lg"
        border="1px solid"
        borderColor={bg}
        borderRadius="lg"
        flexDir="column"
        color={colorText}
        gap="4"
        textAlign="center"
        alignItems="center"
      >
        <Text fontSize="xxx-large">😅</Text>
        <Text mt="-15px" fontSize="xx-large" fontWeight="bold">
          Algo salió mal
        </Text>
        <Text color="gray.500">
          Ya notificamos al Admin para que lo revise. Por favor intenta de nuevo
          más tarde.
        </Text>
      </Flex>
    </Flex>
  );
}
