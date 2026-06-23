import type { ErrorComponentProps } from "@tanstack/react-router";
import { Box, Code, Text } from "@chakra-ui/react";

export default function ErrorComponent({ error }: ErrorComponentProps) {
  return (
    <Box p={4}>
      <Text fontWeight="bold">Error, disculpe</Text>
      <Code whiteSpace="pre-wrap" mt={2} display="block">
        {error.message}
      </Code>
      {import.meta.env.DEV && error.stack ? (
        <Code whiteSpace="pre-wrap" mt={2} display="block">
          {error.stack}
        </Code>
      ) : null}
    </Box>
  );
}
