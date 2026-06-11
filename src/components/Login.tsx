import { Flex, Button, Input, useColorModeValue } from "@chakra-ui/react";
import type { ClientResponseError } from "pocketbase";
import { useState } from "react";
import toaster from "react-hot-toast";

import { pb } from "@/pb";

export default function Login() {
  const [account, setAccount] = useState("");
  const bg = useColorModeValue('gray.100', 'gray.800')
  const bgsoft = useColorModeValue('gray.50', 'gray.700')
  const colorText = useColorModeValue('black', 'white')

  const onLogin = async () => {
    let res = null;
    try {
      res = await pb.collection("users").authWithOAuth2({ provider: "google" });
      if (res.meta?.avatarUrl) {
        const { avatarUrl } = res.meta;
        await pb.collection("users").update(res.record.id, { avatarUrl });
      }
      toaster.success("Bienvenido");
      document.location = "/tournaments/izl4jbo5w25yf6b";
    } catch (e) {
      const err = e as ClientResponseError;
      toaster.error(err.message);
    }
  };

  const onEmailLogin: React.FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();

    try {
      await pb.collection("users").authWithPassword(account, "Ab123456!");
      toaster.success("Bienvenido");
      document.location = "/tournaments/izl4jbo5w25yf6b";
    } catch (e) {
      const err = e as ClientResponseError;
      toaster.error(err.message);
    }
  };

  return (
    <form onSubmit={onEmailLogin}>
      <Flex
        h="100dvh"
        alignItems="center"
        justifyContent="center"
        bg={bg}
      >
        <Flex
          p="6"
          w="300px"
          bg={bgsoft}
          boxShadow="md"
          border="1px solid"
          borderColor={bg}
          flexDir="column"
          color={colorText}
          gap="4"
        >
          <Flex fontSize="xx-large">Quiniela | Login</Flex>
          <Input
            border="1px solid #777"
            placeholder="Email?"
            onChange={(e) => setAccount(e.target.value.toLowerCase())}
            value={account}
          />
          <Button colorScheme="blue" type="submit">
            Hacer login con correo
          </Button>
          <Flex borderTop="1px dashed #555" h="1px"></Flex>
          <Button colorScheme="purple" onClick={onLogin}>
            Login con Google
          </Button>
        </Flex>
      </Flex>
    </form>
  );
}
