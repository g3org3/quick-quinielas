import { getFlagsQuery, useToggleFeatFlags } from "@/api";
import { queryClient } from "@/queryClient";
import { Button, Flex, Table, Td, Tr } from "@chakra-ui/react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/admin")({
  component: Component,
  loader: async () => {
    await queryClient.ensureQueryData(getFlagsQuery);
  },
});

function Component() {
  const { data } = useSuspenseQuery(getFlagsQuery);
  const { mutate } = useToggleFeatFlags();

  return (
    <>
      <Flex px={2}>Admin</Flex>
      <Table>
        {data.map((flag) => {
          const { id, isActive } = flag;
          return (
            <Tr key={flag.id}>
              <Td>{flag.feature}</Td>
              <Td>{flag.isActive ? "✅" : "❌"}</Td>
              <Td>
                <Button onClick={() => mutate({ id, isActive: !isActive })}>
                  toggle
                </Button>
              </Td>
            </Tr>
          );
        })}
      </Table>
    </>
  );
}
