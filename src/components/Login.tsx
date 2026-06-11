import { Box, Button, Flex, Input, Text } from "@chakra-ui/react";
import { motion } from "framer-motion";
import type { ClientResponseError } from "pocketbase";
import { useState } from "react";
import toaster from 'react-hot-toast'

import { pb } from "@/pb";

const archivo = "'Archivo', system-ui, sans-serif";
const volt = "#C8F542";

const MotionFlex = motion(Flex);
const MotionBox = motion(Box);

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
};

const item = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } },
};

export default function Login() {
  const [account, setAccount] = useState('')

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
    e.preventDefault()

    try {
      await pb.collection("users").authWithPassword(account, "Ab123456!");
      toaster.success("Bienvenido");
      document.location = "/";
    } catch (e) {
      const err = e as ClientResponseError;
      toaster.error(err.message);
    }
  }

  return (
    <form onSubmit={onEmailLogin}>
      <Flex
        minH="100dvh"
        alignItems="center"
        justifyContent="center"
        position="relative"
        overflow="hidden"
        px="5"
        bg="#07120C"
        bgImage="radial-gradient(ellipse 80% 50% at 50% -10%, rgba(200,245,66,0.13), transparent 70%),
          radial-gradient(ellipse 60% 40% at 85% 110%, rgba(31,97,56,0.35), transparent 70%)"
        fontFamily={archivo}
      >
        {/* pitch markings */}
        <Box
          position="absolute"
          w="90vmin"
          h="90vmin"
          left="-45vmin"
          top="50%"
          transform="translateY(-50%)"
          borderRadius="full"
          border="2px solid rgba(255,255,255,0.05)"
          pointerEvents="none"
        />
        <Box
          position="absolute"
          top="0"
          bottom="0"
          left="50%"
          borderLeft="2px solid rgba(255,255,255,0.04)"
          pointerEvents="none"
        />
        <Box
          position="absolute"
          w="60vmin"
          h="60vmin"
          right="-30vmin"
          bottom="-30vmin"
          borderRadius="full"
          border="2px solid rgba(255,255,255,0.05)"
          pointerEvents="none"
        />
        {/* grain */}
        <Box
          position="absolute"
          inset="0"
          opacity="0.5"
          pointerEvents="none"
          bgImage={`url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.05'/%3E%3C/svg%3E")`}
        />

        <MotionFlex
          variants={container}
          initial="hidden"
          animate="show"
          flexDir="column"
          w="100%"
          maxW="380px"
          position="relative"
          bg="rgba(10, 22, 14, 0.88)"
          backdropFilter="blur(12px)"
          border="1px solid rgba(200,245,66,0.18)"
          borderRadius="2xl"
          boxShadow="0 40px 80px -20px rgba(0,0,0,0.7), 0 0 120px -40px rgba(200,245,66,0.25)"
          overflow="hidden"
        >
          <Flex
            bg={volt}
            color="#07120C"
            px="6"
            py="1.5"
            justifyContent="space-between"
            alignItems="center"
            fontSize="xs"
            fontWeight="800"
            letterSpacing="0.18em"
            textTransform="uppercase"
          >
            <Text>● En vivo</Text>
            <Text>Mundial 2026</Text>
          </Flex>

          <Flex flexDir="column" p={{ base: 6, sm: 8 }} gap="4">
            <MotionBox variants={item}>
              <Text
                as="h1"
                fontSize="5xl"
                lineHeight="0.95"
                fontWeight="900"
                fontStyle="italic"
                textTransform="uppercase"
                letterSpacing="-0.02em"
                color="white"
              >
                La{" "}
                <Box as="span" color={volt}>
                  Quiniela
                </Box>
              </Text>
              <Text mt="3" color="whiteAlpha.600" fontSize="sm" fontWeight="500" letterSpacing="0.02em">
                Pronostica los marcadores y presume con tus amigos.
              </Text>
            </MotionBox>

            <MotionBox variants={item} h="1px" bg="whiteAlpha.200" my="1" />

            <MotionBox variants={item}>
              <Button
                type="button"
                onClick={onLogin}
                w="100%"
                size="lg"
                bg="white"
                color="#07120C"
                fontFamily={archivo}
                fontWeight="800"
                textTransform="uppercase"
                letterSpacing="0.08em"
                borderRadius="lg"
                _hover={{ bg: "#f2f2f2", transform: "translateY(-2px)", boxShadow: "0 12px 30px -10px rgba(255,255,255,0.35)" }}
                _active={{ transform: "translateY(0)" }}
                transition="all 0.2s ease"
              >
                Entrar con Google
              </Button>
            </MotionBox>
            <MotionBox variants={item}>
              <Text
                mb="2"
                fontSize="xs"
                fontWeight="800"
                letterSpacing="0.18em"
                textTransform="uppercase"
                color="whiteAlpha.500"
              >
                Tu correo
              </Text>
              <Input
                placeholder="tu@correo.com"
                onChange={(e) => setAccount(e.target.value.toLowerCase())}
                value={account}
                size="lg"
                fontFamily={archivo}
                color="white"
                bg="rgba(255,255,255,0.04)"
                border="1px solid"
                borderColor="whiteAlpha.300"
                borderRadius="lg"
                _placeholder={{ color: "whiteAlpha.400" }}
                _hover={{ borderColor: "whiteAlpha.400" }}
                _focusVisible={{ borderColor: volt, boxShadow: `0 0 0 1px ${volt}` }}
              />
            </MotionBox>
            <MotionBox variants={item}>
              <Button
                type="submit"
                w="100%"
                size="lg"
                bg={volt}
                color="#07120C"
                fontFamily={archivo}
                fontWeight="800"
                textTransform="uppercase"
                letterSpacing="0.08em"
                borderRadius="lg"
                _hover={{ bg: "#d9ff5c", transform: "translateY(-2px)", boxShadow: "0 12px 30px -10px rgba(200,245,66,0.5)" }}
                _active={{ transform: "translateY(0)" }}
                transition="all 0.2s ease"
              >
                Acceder
              </Button>
            </MotionBox>

            <MotionBox variants={item}>
              <Text
                textAlign="center"
                fontSize="xs"
                color="whiteAlpha.400"
                fontWeight="600"
                letterSpacing="0.14em"
                textTransform="uppercase"
              >
                90 minutos · 48 equipos · una quiniela
              </Text>
            </MotionBox>
          </Flex>
        </MotionFlex>
      </Flex>
    </form>
  );
}
