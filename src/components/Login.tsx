import { Flex, Button, Input } from "@chakra-ui/react";
import type { ClientResponseError } from "pocketbase";
import { useState } from "react";
import { datadogLogs } from '@datadog/browser-logs';

import { pb } from "@/pb";

export default function Login() {
  const [state, setState] = useState('')

  const onLogin = async () => {
    let res = null;
    try {
      datadogLogs.logger.info("Login-Attemp")
      res = await pb.collection("users").authWithOAuth2({ provider: "google" });
      const { id } = res.record
      datadogLogs.logger.info("Login-Success", { id })
    } catch (e) {
      const err = e as ClientResponseError;
      datadogLogs.logger.error("Login-Failure", { message: err.message })
      alert(err.message);
    }
    if (res?.meta?.avatarUrl) {
      const { avatarUrl } = res.meta;
      await pb.collection("users").update(res.record.id, { avatarUrl });
    }
    document.location = "/";
  };

  const onEmailLogin: React.FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault()

    const data = new FormData(e.currentTarget)
    const form: Record<string, string> = {}
    for (const [key, value] of data.entries()) {
      form[key] = String(value)
    }

    try {
      await pb.collection("users").authWithPassword(form.username, form.password);
    } catch (e) {
      const err = e as ClientResponseError;
      alert(err.message);
    }

    document.location = "/";
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
            : <Button colorScheme="blue" onClick={onLogin}>login with google</Button>
          }
          {state === 'email'
            ? <>
              <Input name="username" placeholder="email" />
              <Input name="password" placeholder="password" type="password" />
            </>
            : null
          }
          {state === 'email'
            ? null
            : <Button colorScheme="gray" onClick={() => setState('email')}>login with email</Button>
          }
          {state === 'email' ? <Button type="submit">Login</Button> : null}
          {state === 'email' ? <Button onClick={() => setState('')}>Home</Button> : null}
        </Flex>
      </Flex>
    </form>
  );
}
