import {
  Box,
  Button,
  Divider,
  Flex,
  FormControl,
  FormLabel,
  HStack,
  Heading,
  Input,
  Text,
  keyframes,
  useColorModeValue,
} from "@chakra-ui/react";
import type { ClientResponseError } from "pocketbase";
import { useState } from "react";
import toaster from "react-hot-toast";

import { pb } from "@/pb";

const rise = keyframes`
  from { opacity: 0; transform: translateY(14px); }
  to { opacity: 1; transform: translateY(0); }
`;

const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
    <path
      fill="#EA4335"
      d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
    />
    <path
      fill="#4285F4"
      d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
    />
    <path
      fill="#FBBC05"
      d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
    />
    <path
      fill="#34A853"
      d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
    />
  </svg>
);

export default function Login() {
  const [account, setAccount] = useState("");
  const [focused, setFocused] = useState(false);
  const floated = focused || account.length > 0;

  const pageBg = useColorModeValue("#f4f7f5", "#0c120f");
  const glow = useColorModeValue(
    "radial-gradient(ellipse 80% 55% at 50% -10%, rgba(56, 161, 105, 0.18), transparent), radial-gradient(ellipse 60% 45% at 85% 110%, rgba(49, 130, 206, 0.10), transparent)",
    "radial-gradient(ellipse 80% 55% at 50% -10%, rgba(56, 161, 105, 0.22), transparent), radial-gradient(ellipse 60% 45% at 85% 110%, rgba(49, 130, 206, 0.12), transparent)"
  );
  const dots = useColorModeValue(
    "radial-gradient(rgba(26, 32, 44, 0.07) 1px, transparent 1px)",
    "radial-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px)"
  );
  const cardBg = useColorModeValue("white", "gray.800");
  const cardBorder = useColorModeValue("blackAlpha.100", "whiteAlpha.200");
  const cardShadow = useColorModeValue(
    "0 20px 50px -16px rgba(26, 70, 50, 0.25)",
    "0 20px 50px -16px rgba(0, 0, 0, 0.6)"
  );
  const colorText = useColorModeValue("gray.800", "whiteAlpha.900");
  const mutedText = useColorModeValue("gray.500", "gray.400");
  const labelColor = useColorModeValue("gray.500", "gray.400");
  const labelFloatedColor = useColorModeValue("green.600", "green.300");
  const inputBorder = useColorModeValue("gray.300", "whiteAlpha.300");
  const googleBg = useColorModeValue("white", "whiteAlpha.100");
  const googleHoverBg = useColorModeValue("gray.50", "whiteAlpha.200");

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
        px="4"
        bg={pageBg}
        backgroundImage={`${glow}, ${dots}`}
        backgroundSize="auto, 22px 22px"
      >
        <Flex
          w="full"
          maxW="380px"
          p={{ base: "7", sm: "9" }}
          bg={cardBg}
          borderRadius="2xl"
          border="1px solid"
          borderColor={cardBorder}
          boxShadow={cardShadow}
          flexDir="column"
          color={colorText}
          gap="5"
          animation={`${rise} 0.5s ease-out`}
        >
          <Flex flexDir="column" alignItems="center" gap="3" mb="1">
            <Flex
              w="14"
              h="14"
              alignItems="center"
              justifyContent="center"
              fontSize="3xl"
              borderRadius="full"
              bgGradient="linear(to-br, green.400, green.600)"
              boxShadow="0 8px 20px -6px rgba(56, 161, 105, 0.55)"
            >
              ⚽
            </Flex>
            <Flex flexDir="column" alignItems="center" gap="1">
              <Heading size="lg" letterSpacing="tight">
                Quiniela
              </Heading>
              <Text fontSize="sm" color={mutedText}>
                Predice los marcadores. Gana la porra.
              </Text>
            </Flex>
          </Flex>

          <FormControl>
            <Box position="relative">
              <FormLabel
                htmlFor="login-email"
                position="absolute"
                left="3"
                top={floated ? "-2.5" : "2.5"}
                px="1.5"
                m="0"
                zIndex="1"
                bg={cardBg}
                borderRadius="sm"
                fontSize={floated ? "xs" : "md"}
                fontWeight={floated ? "semibold" : "normal"}
                color={floated ? labelFloatedColor : labelColor}
                pointerEvents="none"
                transition="all 0.15s ease-out"
              >
                Correo electrónico
              </FormLabel>
              <Input
                id="login-email"
                type="email"
                size="lg"
                borderRadius="lg"
                borderColor={inputBorder}
                focusBorderColor="green.400"
                _hover={{ borderColor: "green.300" }}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                onChange={(e) => setAccount(e.target.value.toLowerCase())}
                value={account}
              />
            </Box>
          </FormControl>

          <Button
            type="submit"
            size="lg"
            colorScheme="green"
            borderRadius="lg"
            bgGradient="linear(to-b, green.400, green.500)"
            _hover={{
              bgGradient: "linear(to-b, green.500, green.600)",
              transform: "translateY(-1px)",
              boxShadow: "0 10px 22px -8px rgba(56, 161, 105, 0.6)",
            }}
            _active={{ transform: "translateY(0) scale(0.98)", boxShadow: "none" }}
            transition="all 0.15s ease-out"
          >
            Entrar con correo
          </Button>

          <HStack spacing="3">
            <Divider borderColor={inputBorder} />
            <Text fontSize="xs" color={mutedText} whiteSpace="nowrap" textTransform="uppercase" letterSpacing="widest">
              o continúa con
            </Text>
            <Divider borderColor={inputBorder} />
          </HStack>

          <Button
            onClick={onLogin}
            size="lg"
            variant="outline"
            borderRadius="lg"
            borderColor={inputBorder}
            bg={googleBg}
            leftIcon={<GoogleIcon />}
            fontWeight="medium"
            _hover={{ bg: googleHoverBg, transform: "translateY(-1px)" }}
            _active={{ transform: "translateY(0) scale(0.98)" }}
            transition="all 0.15s ease-out"
          >
            Google
          </Button>

          <Text fontSize="xs" color={mutedText} textAlign="center">
            Tu quiniela, tus pronósticos, tu gloria.
          </Text>
        </Flex>
      </Flex>
    </form>
  );
}
