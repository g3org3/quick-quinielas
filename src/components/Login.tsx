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
  from { opacity: 0; transform: translateY(22px); }
  to   { opacity: 1; transform: translateY(0); }
`;

const pulse = keyframes`
  0%, 100% { opacity: 0.6; transform: scale(1); }
  50%       { opacity: 1;   transform: scale(1.08); }
`;

const float = keyframes`
  0%, 100% { transform: translateY(0px); }
  50%       { transform: translateY(-5px); }
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

  // ── Page background ────────────────────────────────────────────────
  const pageBg = useColorModeValue("#f0f4f1", "#060d09");

  // Richer ambient glows: large emerald bloom top-center + teal accent bottom-right
  const glow = useColorModeValue(
    [
      "radial-gradient(ellipse 100% 65% at 50% -8%, rgba(56,161,105,0.24) 0%, transparent 70%)",
      "radial-gradient(ellipse 55% 40% at 92% 105%, rgba(20,184,166,0.13) 0%, transparent 70%)",
    ].join(", "),
    [
      "radial-gradient(ellipse 100% 60% at 50% -8%, rgba(74,222,128,0.30) 0%, transparent 65%)",
      "radial-gradient(ellipse 55% 40% at 92% 105%, rgba(20,184,166,0.20) 0%, transparent 70%)",
      "radial-gradient(ellipse 40% 30% at 8% 50%, rgba(34,197,94,0.08) 0%, transparent 60%)",
    ].join(", ")
  );

  const dots = useColorModeValue(
    "radial-gradient(rgba(26,32,44,0.06) 1px, transparent 1px)",
    "radial-gradient(rgba(255,255,255,0.04) 1px, transparent 1px)"
  );

  // ── Decorative corner rings ────────────────────────────────────────
  const cornerRingOuter = useColorModeValue(
    "rgba(56,161,105,0.10)",
    "rgba(74,222,128,0.07)"
  );
  const cornerRingInner = useColorModeValue(
    "rgba(56,161,105,0.16)",
    "rgba(74,222,128,0.11)"
  );

  // ── Card ──────────────────────────────────────────────────────────
  const cardBg = useColorModeValue("white", "#0f1f14");
  const cardBorderColor = useColorModeValue(
    "rgba(56,161,105,0.14)",
    "rgba(74,222,128,0.18)"
  );
  const cardShadow = useColorModeValue(
    "0 24px 60px -20px rgba(26,70,50,0.28), 0 8px 20px -10px rgba(26,70,50,0.10)",
    "0 24px 60px -20px rgba(0,0,0,0.80), 0 4px 20px -8px rgba(74,222,128,0.07)"
  );
  // Top-edge shimmer line (via linear-gradient on borderTop via sx)
  const cardTopShimmer = useColorModeValue(
    "linear-gradient(to right, transparent, rgba(56,161,105,0.40), transparent)",
    "linear-gradient(to right, transparent, rgba(74,222,128,0.55), transparent)"
  );

  // ── Typography ────────────────────────────────────────────────────
  const colorText = useColorModeValue("gray.800", "#e8f5ed");
  const mutedText = useColorModeValue("gray.500", "#557a63");
  const taglineColor = useColorModeValue("green.600", "#4ade80");
  const headingGradient = useColorModeValue(
    "linear(to-br, gray.800, gray.500)",
    "linear(to-br, #e8f5ed, #a3d9b4)"
  );

  // ── Logo ring ─────────────────────────────────────────────────────
  const ringColor = useColorModeValue(
    "rgba(56,161,105,0.38)",
    "rgba(74,222,128,0.32)"
  );
  const ballShadow = useColorModeValue(
    "0 8px 24px -6px rgba(56,161,105,0.55)",
    "0 8px 32px -6px rgba(74,222,128,0.52)"
  );

  // ── Floating label ────────────────────────────────────────────────
  const labelBg = useColorModeValue("white", "#0f1f14");
  const labelColor = useColorModeValue("gray.400", "#496257");
  const labelFloatedColor = useColorModeValue("green.600", "#4ade80");

  // ── Input ─────────────────────────────────────────────────────────
  const inputBg = useColorModeValue("gray.50", "rgba(74,222,128,0.04)");
  const inputBorder = useColorModeValue("gray.200", "rgba(74,222,128,0.15)");
  const inputHoverBorder = useColorModeValue("green.300", "rgba(74,222,128,0.30)");
  const inputFocusBorder = useColorModeValue("green.400", "rgba(74,222,128,0.60)");
  const inputFocusShadow = useColorModeValue(
    "0 0 0 3px rgba(56,161,105,0.18)",
    "0 0 0 3px rgba(74,222,128,0.16)"
  );

  // ── Submit button hover shadow ────────────────────────────────────
  const submitHoverShadow = useColorModeValue(
    "0 14px 30px -8px rgba(56,161,105,0.65)",
    "0 14px 34px -8px rgba(74,222,128,0.55)"
  );

  // ── Divider ───────────────────────────────────────────────────────
  const dividerColor = useColorModeValue("gray.200", "rgba(74,222,128,0.12)");

  // ── Google button ─────────────────────────────────────────────────
  const googleBg = useColorModeValue("white", "rgba(255,255,255,0.03)");
  const googleBorder = useColorModeValue("gray.200", "rgba(74,222,128,0.17)");
  const googleHoverBg = useColorModeValue("gray.50", "rgba(74,222,128,0.07)");
  const googleHoverBorder = useColorModeValue("green.300", "rgba(74,222,128,0.34)");
  const googleHoverShadow = useColorModeValue(
    "0 8px 20px -8px rgba(0,0,0,0.12)",
    "0 8px 24px -8px rgba(0,0,0,0.45)"
  );

  // ── Handlers ──────────────────────────────────────────────────────
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
        position="relative"
        overflow="hidden"
      >
        {/* Decorative corner rings */}
        <Box
          position="absolute"
          top="-70px"
          right="-70px"
          w="240px"
          h="240px"
          borderRadius="full"
          border="1px solid"
          borderColor={cornerRingOuter}
          pointerEvents="none"
        />
        <Box
          position="absolute"
          top="-25px"
          right="-25px"
          w="130px"
          h="130px"
          borderRadius="full"
          border="1px solid"
          borderColor={cornerRingInner}
          pointerEvents="none"
        />

        {/* Card */}
        <Flex
          w="full"
          maxW="390px"
          p={{ base: "8", sm: "10" }}
          bg={cardBg}
          borderRadius="2xl"
          border="1px solid"
          borderColor={cardBorderColor}
          boxShadow={cardShadow}
          flexDir="column"
          color={colorText}
          gap="5"
          animation={`${rise} 0.55s cubic-bezier(0.16, 1, 0.3, 1)`}
          position="relative"
          overflow="hidden"
          sx={{
            "&::before": {
              content: '""',
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: "1px",
              background: cardTopShimmer,
            },
          }}
        >
          {/* ── Logo ────────────────────────────────────────────── */}
          <Flex flexDir="column" alignItems="center" gap="3" mb="1">
            <Box position="relative" w="72px" h="72px">
              {/* Pulsing ring */}
              <Box
                position="absolute"
                inset="-10px"
                borderRadius="full"
                border="1.5px solid"
                borderColor={ringColor}
                animation={`${pulse} 2.6s ease-in-out infinite`}
                pointerEvents="none"
              />
              {/* Ball */}
              <Flex
                w="72px"
                h="72px"
                alignItems="center"
                justifyContent="center"
                fontSize="32px"
                lineHeight="1"
                borderRadius="full"
                bgGradient="linear(145deg, #22c55e, #15803d)"
                boxShadow={ballShadow}
                animation={`${float} 3.2s ease-in-out infinite`}
              >
                ⚽
              </Flex>
            </Box>

            <Flex flexDir="column" alignItems="center" gap="1">
              <Heading
                size="2xl"
                letterSpacing="-0.04em"
                fontWeight="800"
                bgGradient={headingGradient}
                bgClip="text"
              >
                Quiniela
              </Heading>
              <Text
                fontSize="sm"
                color={taglineColor}
                fontStyle="italic"
                letterSpacing="0.01em"
              >
                Predice los marcadores. Gana la porra.
              </Text>
            </Flex>
          </Flex>

          {/* ── Email input ─────────────────────────────────────── */}
          <FormControl>
            <Box position="relative">
              <FormLabel
                htmlFor="login-email"
                position="absolute"
                left="5"
                top={floated ? "-2.5" : "3"}
                px="1.5"
                m="0"
                zIndex="1"
                bg={labelBg}
                borderRadius="sm"
                fontSize={floated ? "xs" : "sm"}
                fontWeight={floated ? "600" : "400"}
                color={floated ? labelFloatedColor : labelColor}
                pointerEvents="none"
                transition="all 0.18s cubic-bezier(0.16, 1, 0.3, 1)"
              >
                Correo electrónico
              </FormLabel>
              <Input
                id="login-email"
                type="email"
                size="lg"
                h="12"
                px="5"
                borderRadius="full"
                bg={inputBg}
                borderColor={inputBorder}
                focusBorderColor={inputFocusBorder}
                _hover={{ borderColor: inputHoverBorder }}
                _focus={{ boxShadow: inputFocusShadow }}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                onChange={(e) => setAccount(e.target.value.toLowerCase())}
                value={account}
                transition="all 0.18s ease"
              />
            </Box>
          </FormControl>

          {/* ── Submit button ───────────────────────────────────── */}
          <Button
            type="submit"
            size="lg"
            h="12"
            borderRadius="full"
            bgGradient="linear(135deg, #22c55e, #15803d)"
            color="white"
            fontWeight="700"
            letterSpacing="0.01em"
            border="none"
            _hover={{
              bgGradient: "linear(135deg, #16a34a, #14532d)",
              transform: "translateY(-2px)",
              boxShadow: submitHoverShadow,
            }}
            _active={{
              transform: "translateY(0) scale(0.98)",
              boxShadow: "none",
            }}
            transition="all 0.18s cubic-bezier(0.16, 1, 0.3, 1)"
          >
            Entrar con correo
          </Button>

          {/* ── Divider with diamond accents ────────────────────── */}
          <HStack spacing="3" my="-1">
            <Divider borderColor={dividerColor} />
            <HStack spacing="2" flexShrink={0} alignItems="center">
              <Box
                w="5px"
                h="5px"
                transform="rotate(45deg)"
                bg={dividerColor}
                flexShrink={0}
              />
              <Text
                fontSize="10px"
                color={mutedText}
                textTransform="uppercase"
                letterSpacing="widest"
                fontWeight="600"
                lineHeight="1"
              >
                o
              </Text>
              <Box
                w="5px"
                h="5px"
                transform="rotate(45deg)"
                bg={dividerColor}
                flexShrink={0}
              />
            </HStack>
            <Divider borderColor={dividerColor} />
          </HStack>

          {/* ── Google button ────────────────────────────────────── */}
          <Button
            onClick={onLogin}
            size="lg"
            h="12"
            borderRadius="full"
            variant="outline"
            bg={googleBg}
            borderColor={googleBorder}
            leftIcon={<GoogleIcon />}
            fontWeight="500"
            color={colorText}
            _hover={{
              bg: googleHoverBg,
              borderColor: googleHoverBorder,
              transform: "translateY(-2px)",
              boxShadow: googleHoverShadow,
            }}
            _active={{ transform: "translateY(0) scale(0.98)" }}
            transition="all 0.18s cubic-bezier(0.16, 1, 0.3, 1)"
          >
            Continuar con Google
          </Button>

          {/* ── Footer tagline ───────────────────────────────────── */}
          <Text
            fontSize="xs"
            color={mutedText}
            textAlign="center"
            fontStyle="italic"
            mt="-1"
          >
            Tu quiniela, tus pronósticos, tu gloria.
          </Text>
        </Flex>
      </Flex>
    </form>
  );
}
