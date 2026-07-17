import { Flex, Text, useColorModeValue } from "@chakra-ui/react";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";

// Funny World Cup themed messages shown while the tournament loads.
// Each message has its own emoji, shown as the main animated icon.
const MESSAGES = [
  { emoji: "⚽", text: "Inflando los balones..." },
  { emoji: "🌱", text: "Cortando el césped del estadio..." },
  { emoji: "🧤", text: "Calentando al portero..." },
  { emoji: "📺", text: "Revisando el VAR..." },
  { emoji: "🎤", text: "Cantando el himno..." },
  { emoji: "🍿", text: "Vendiendo palomitas..." },
  { emoji: "🖌️", text: "Pintando las líneas de la cancha..." },
  { emoji: "🔭", text: "Buscando la pelota fuera del estadio..." },
  { emoji: "🌊", text: "Preparando la ola en las gradas..." },
  { emoji: "🤫", text: "Sobornando al árbitro..." },
];

export default function TournamentLoading() {
  const color = useColorModeValue("gray.600", "gray.300");
  const [index, setIndex] = useState(() =>
    Math.floor(Math.random() * MESSAGES.length),
  );

  useEffect(() => {
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % MESSAGES.length);
    }, 1800);
    return () => clearInterval(id);
  }, []);

  const message = MESSAGES[index];

  return (
    <Flex
      flexDir="column"
      flex="1"
      justifyContent="center"
      alignItems="center"
      px="4"
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.4 }}
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "24px",
          }}
        >
          <motion.div
            animate={{ y: [0, -16, 0] }}
            transition={{
              y: { repeat: Infinity, duration: 1, ease: "easeInOut" },
            }}
            style={{
              fontSize: "72px",
              lineHeight: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {message.emoji}
          </motion.div>
          <Text
            color={color}
            fontWeight="bold"
            fontSize="xl"
            textAlign="center"
          >
            {message.text}
          </Text>
        </motion.div>
      </AnimatePresence>
    </Flex>
  );
}
