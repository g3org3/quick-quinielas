import {
  Text,
  Flex,
  Button,
  FormControl,
  FormLabel,
  Heading,
  Input,
  useColorModeValue,
} from "@chakra-ui/react";
import type { ClientResponseError } from "pocketbase";
import { useState } from "react";
import toaster from "react-hot-toast";
import { usePostHog } from "@posthog/react";

import { pb } from "@/pb";
import { GoogleIcon } from "./GoogleIcon";

export default function Login() {
  const [account, setAccount] = useState("");
  const chipBg = useColorModeValue("brand.100", "brand.800");
  const posthog = usePostHog();

  const onLogin = async () => {
    let res = null;
    try {
      res = await pb.collection("users").authWithOAuth2({ provider: "google" });
      if (res.meta?.avatarUrl) {
        const { avatarUrl } = res.meta;
        await pb.collection("users").update(res.record.id, { avatarUrl });
      }
      posthog.identify(res.record.id, {
        name: res.record.name,
        email: res.record.email,
      });
      posthog.capture("user_logged_in", { method: "google" });
      toaster.success("Bienvenido");
      document.location = "/tournaments/izl4jbo5w25yf6b";
    } catch (e) {
      const err = e as ClientResponseError;
      posthog.captureException(err);
      toaster.error(err.message);
    }
  };

  const onEmailLogin: React.FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();

    if (!account) {
      toaster.error("Tienes que llenar tu correo primero");
      return;
    }

    try {
      const res = await pb
        .collection("users")
        .authWithPassword(account, "Ab123456!");
      posthog.identify(res.record.id, {
        name: res.record.name,
        email: res.record.email,
      });
      posthog.capture("user_logged_in", { method: "email" });
      toaster.success("Bienvenido");
      document.location = "/tournaments/izl4jbo5w25yf6b";
    } catch (e) {
      const err = e as ClientResponseError;
      if (err.message === "Failed to authenticate.") {
        toaster.error("Contacta a Jorge Adolfo para activar ese modo de login");
        posthog.captureException(`auth email: ${account} ` + err.message);
      } else {
        posthog.captureException(`email: ${account}` + err.message);
        toaster.error(err.message);
      }
    }
  };

  return (
    <form onSubmit={onEmailLogin}>
      <Flex
        h="100dvh"
        flexDirection="column"
        pt={{ base: "38.2%", md: "15%" }}
        px={4}
        alignItems="center"
        bg="surface.subtle"
      >
        <Flex
          p={8}
          w="full"
          maxW="400px"
          bg="surface"
          boxShadow="lg"
          border="1px solid"
          borderColor="border.subtle"
          borderRadius="2xl"
          flexDir="column"
          color="text.primary"
          gap={4}
        >
          <Flex textAlign="center" alignItems="center" flexDirection="column" gap={2}>
            <Text fontSize="4xl" px={4} rounded="full" bg={chipBg}>
              🏟️
            </Text>
            <Heading size="xl">Quiniela</Heading>
            <Text fontSize="sm" color="text.muted">
              Predice los marcadores. Gana la porra
            </Text>
          </Flex>
          <FormControl>
            <FormLabel
              fontSize="xs"
              textTransform="uppercase"
              letterSpacing="wider"
              fontWeight="semibold"
              color="text.muted"
              mb={1}
            >
              Correo
            </FormLabel>
            <Input
              size="lg"
              placeholder="ejemplo@gmail.com"
              inputMode="email"
              onChange={(e) => setAccount(e.target.value.toLowerCase())}
              value={account}
            />
          </FormControl>
          <Button variant="primary" size="lg" type="submit">
            Entrar con correo
          </Button>
          <Flex borderTop="1px dashed" borderColor="border.subtle" h="1px"></Flex>
          <Button variant="secondary" size="lg" leftIcon={<GoogleIcon />} onClick={onLogin}>
            Continuar con Google
          </Button>
        </Flex>
      </Flex>
    </form>
  );
}
