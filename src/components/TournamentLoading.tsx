import { Flex, Text, useColorModeValue } from "@chakra-ui/react";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

// Funny World Cup themed messages shown while the tournament loads.
const MESSAGES = [
  "Inflando los balones... ⚽",
  "Cortando el césped del estadio... 🌱",
  "Calentando al portero... 🧤",
  "Revisando el VAR... 📺",
  "Cantando el himno... 🎤",
  "Vendiendo palomitas... 🍿",
  "Pintando las líneas de la cancha... 🖌️",
  "Buscando la pelota fuera del estadio... 🔭",
  "Preparando la ola en las gradas... 🌊",
  "Sobornando al árbitro... 🤫",
];

const MotionText = motion(Text);

export default function TournamentLoading() {
  const color = useColorModeValue("gray.600", "gray.300");
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % MESSAGES.length);
    }, 1800);
    return () => clearInterval(id);
  }, []);

  return (
    <Flex
      flexDir="column"
      flex="1"
      justifyContent="center"
      alignItems="center"
      gap="6"
      px="4"
    >
      <motion.div
        animate={{ rotate: 360, y: [0, -16, 0] }}
        transition={{
          rotate: { repeat: Infinity, duration: 2, ease: "linear" },
          y: { repeat: Infinity, duration: 1, ease: "easeInOut" },
        }}
        style={{ fontSize: "72px", lineHeight: 1 }}
      >
        ⚽
      </motion.div>
      <MotionText
        key={index}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.4 }}
        color={color}
        fontWeight="bold"
        fontSize="xl"
        textAlign="center"
      >
        {MESSAGES[index]}
      </MotionText>
    </Flex>
  );
}
