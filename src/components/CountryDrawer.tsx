import { useMemo, useState, type ReactNode } from "react";
import { Box, Button, Flex, Input, Text, useColorModeValue } from "@chakra-ui/react";
import { usePostHog } from "@posthog/react";
import { Drawer } from "vaul";

import { countries } from "@/components/countries";
import Flag from "@/components/Flag";

interface Props {
  trigger: ReactNode;
  value?: string;
  isApplying?: boolean;
  onApply: (country: string) => void;
}

export default function CountryDrawer({
  trigger,
  value,
  isApplying,
  onApply,
}: Props) {
  const posthog = usePostHog();
  const bg = useColorModeValue("white", "gray.800");
  const itemBorder = useColorModeValue("gray.100", "gray.700");
  const handleColor = useColorModeValue("gray.300", "gray.600");
  const selectedBg = useColorModeValue("blue.50", "blue.900");

  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(value ?? "");

  const names = useMemo(() => Object.keys(countries), []);
  const filtered = useMemo(
    () =>
      names.filter((name) =>
        name.toLowerCase().includes(search.trim().toLowerCase()),
      ),
    [names, search],
  );

  return (
    <Drawer.Root
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (next) {
          posthog.capture("open_country_drawer");
          setSearch("");
          setSelected(value ?? "");
        }
      }}
    >
      <Drawer.Trigger
        style={{
          background: "none",
          border: "none",
          padding: 0,
          cursor: "pointer",
        }}
      >
        {trigger}
      </Drawer.Trigger>
      <Drawer.Portal>
        <Drawer.Overlay
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.4)",
            zIndex: 1500,
          }}
        />
        <Drawer.Content
          style={{
            position: "fixed",
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: 1500,
            outline: "none",
          }}
        >
          <Box
            bg={bg}
            borderTopRadius="2xl"
            maxH="70vh"
            display="flex"
            flexDirection="column"
          >
            <Flex justifyContent="center" pt={3} pb={2}>
              <Box w="40px" h="6px" borderRadius="full" bg={handleColor} />
            </Flex>
            <Flex px={4} py={2} gap={2} alignItems="center">
              <Text fontWeight="bold" fontSize="lg">
                Elige tu equipo
              </Text>
              <Button
                ml="auto"
                size="sm"
                colorScheme="blue"
                isDisabled={!selected}
                isLoading={isApplying}
                onClick={() => {
                  onApply(selected);
                  setOpen(false);
                }}
              >
                Aplicar
              </Button>
            </Flex>
            <Box px={4} pb={2}>
              <Input
                size="sm"
                autoFocus
                placeholder="Buscar país"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </Box>
            <Box overflowY="auto" pb={6}>
              {filtered.map((name) => (
                <Flex
                  key={name}
                  as="button"
                  w="100%"
                  textAlign="left"
                  alignItems="center"
                  gap={3}
                  px={4}
                  py={2}
                  borderTopWidth="1px"
                  borderColor={itemBorder}
                  bg={selected === name ? selectedBg : undefined}
                  onClick={() => setSelected(name)}
                >
                  <Flag height="24px" country={name} />
                  <Text>{name}</Text>
                </Flex>
              ))}
              {filtered.length === 0 && (
                <Text px={4} py={4} color={handleColor}>
                  No se encontraron países
                </Text>
              )}
            </Box>
          </Box>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
