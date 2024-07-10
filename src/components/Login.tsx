import { Flex, Button, Input } from "@chakra-ui/react";
import type { ClientResponseError } from "pocketbase";
import { useState } from "react";
import { datadogLogs } from '@datadog/browser-logs';
import toaster from 'react-hot-toast'

import { pb } from "@/pb";

export default function Login() {
  const [state, setState] = useState('')
  const [account, setAccount] = useState('')

  const onLogin = async () => {
    let res = null;
    try {
      datadogLogs.logger.info("Login-Attemp")
      res = await pb.collection("users").authWithOAuth2({ provider: "google" });
      const { id } = res.record
      if (res.meta?.avatarUrl) {
        const { avatarUrl } = res.meta;
        await pb.collection("users").update(res.record.id, { avatarUrl });
      }
      toaster.success("Bienvenido");
      datadogLogs.logger.info("Login-Success", { id })
      document.location = "/";
    } catch (e) {
      const err = e as ClientResponseError;
      datadogLogs.logger.error("Login-Failure", { message: err.message })
      toaster.error(err.message);
    }
  };

  const onEmailLogin: React.FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault()

    try {
      datadogLogs.logger.info("Login-Attemp", { account })
      await pb.collection("users").authWithPassword(account, "Ab123456!");
      datadogLogs.logger.info("Login-Success", { account })
      toaster.success("Bienvenido");
      document.location = "/";
    } catch (e) {
      const err = e as ClientResponseError;
      datadogLogs.logger.error("Login-Failure", { message: err.message })
      toaster.error(err.message);
    }
  }

  return (
    <form onSubmit={onEmailLogin}>
      <Flex h="100dvh" alignItems="center" justifyContent="center" bg="gray.100">
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
          {state === 'email'
            ? null
            : <Button colorScheme="purple" onClick={onLogin}>Login con Google</Button>
          }
          {state === 'email'
            ? <>
              <Input placeholder="Email?" onChange={(e) => setAccount(e.target.value)} value={account} />
            </>
            : null
          }
          {state === 'email'
            ? null
            : <Button colorScheme="gray" onClick={() => setState('email')}>No Pude Hacer Login, Ayuda!</Button>
          }
          {state === 'email' ? <Button colorScheme="blue" type="submit">Acceder</Button> : null}
          {state === 'email' ? <Button onClick={() => setState('')}>regresar</Button> : null}
        </Flex>
      </Flex>
    </form>
  );
}
