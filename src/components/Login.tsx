import { Text, Flex, Button, Input, useColorModeValue } from "@chakra-ui/react";
import type { ClientResponseError } from "pocketbase";
import { useState } from "react";
import toaster from "react-hot-toast";
import { usePostHog } from "@posthog/react";

import { pb } from "@/pb";
import { GoogleIcon } from "./GoogleIcon";

export default function Login() {
  const [account, setAccount] = useState("");
  const bg = useColorModeValue("gray.100", "gray.800");
  const bgsoft = useColorModeValue("gray.50", "gray.700");
  const colorText = useColorModeValue("black", "white");
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
      posthog.captureException(err);
      toaster.error(err.message);
    }
  };

  return (
    <form onSubmit={onEmailLogin}>
      <Flex h="100dvh" alignItems="center" justifyContent="center" bg={bg}>
        <Flex
          p="8"
          w="400px"
          bg={bgsoft}
          boxShadow="lg"
          border="1px solid"
          borderColor={bg}
          borderRadius="lg"
          flexDir="column"
          color={colorText}
          gap="4"
        >
          <Flex
            textAlign="center"
            alignItems="center"
            fontSize="xxx-large"
            fontWeight="bold"
            flexDirection="column"
          >
            🏟️
            <br /> Quiniela
          </Flex>
          <Text mt="-20px" alignSelf="center" color="gray.500">Predice los marcadores. Gana la porra</Text>
          <Input
            fontSize="18px"
            placeholder="Correo electronico"
            onChange={(e) => setAccount(e.target.value.toLowerCase())}
            value={account}
          />
          <Button colorScheme="green" type="submit">
            Hacer login con correo
          </Button>
          <Flex borderTop="1px dashed #aaa" h="1px"></Flex>
          <Button leftIcon={<GoogleIcon />} onClick={onLogin}>
            Continuar con Google
          </Button>
        </Flex>
      </Flex>
    </form>
  );
}
