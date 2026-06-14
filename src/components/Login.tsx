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
  const bgsoft = useColorModeValue("gray.50", "gray.900");
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
        pt="38.2%"
        alignItems="center"
        bg={bg}
      >
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
            <Text px={4} rounded="full" bg="green.200">
              🏟️
            </Text>
            <Text mt="-10px">Quiniela</Text>
          </Flex>
          <Text mt="-20px" alignSelf="center" color="gray.500">
            Predice los marcadores. Gana la porra
          </Text>
          <Text color="gray.600">Escribe tu correo</Text>
          <Input
            mt="-15px"
            border="1px solid #000"
            fontSize="18px"
            placeholder="ejemplo@gmail.com"
            onChange={(e) => setAccount(e.target.value.toLowerCase())}
            value={account}
          />
          <Button bg="green.600" color="white" type="submit">
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
