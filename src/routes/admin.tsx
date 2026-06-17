import Loading from "@/components/Loading";
import { FeatFlag } from "@/featureFlags";
import { pb } from "@/pb";
import { queryClient } from "@/queryClient";
import { Button, Flex, Table, Td, Tr } from "@chakra-ui/react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/admin")({
  component: Component,
});

function Component() {
  const { data, isLoading } = useQuery({
    queryKey: ["flags"],
    async queryFn() {
      return await pb.collection("flags").getFullList<FeatFlag>();
    },
  });
  const { mutate } = useMutation({
    mutationFn({ isActive, id }: { isActive: boolean; id: string }) {
      return pb.collection("flags").update(id, { isActive });
    },
    onSuccess() {
      queryClient.invalidateQueries({ queryKey: ["flags"] });
    },
  });

  if (isLoading || data === undefined || data.map === undefined) {
    return <Loading />;
  }
  return (
    <>
      <Flex px={2}>Admin</Flex>
      <Table>
        {data.map((flag) => {
          const { id, isActive } = flag;
          return (
            <Tr key={flag.id}>
              <Td>{flag.feature}</Td>
              <Td>{String(flag.isActive)}</Td>
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
