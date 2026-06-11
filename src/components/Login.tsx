import { Flex, Button, Input } from "@chakra-ui/react";
import type { ClientResponseError } from "pocketbase";
import { useState } from "react";
import toaster from "react-hot-toast";

import { pb } from "@/pb";

export default function Login() {
  const [account, setAccount] = useState("");

  const onLogin = async () => {
    let res = null;
    try {
      res = await pb.collection("users").authWithOAuth2({ provider: "google" });
      if (res.meta?.avatarUrl) {
        const { avatarUrl } = res.meta;
        await pb.collection("users").update(res.record.id, { avatarUrl });
      }
      toaster.success("Bienvenido");
      document.location = "/";
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
      document.location = "/";
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
        bg="gray.100"
      >
        <Flex
          p="6"
          w="300px"
          bg="gray.50"
          boxShadow="md"
          border="1px solid"
          borderColor="gray.100"
          flexDir="column"
          color="black"
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
