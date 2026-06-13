import {
  useColorMode,
  useColorModeValue,
  IconButton,
  IconButtonProps,
} from "@chakra-ui/react";
import { AnimatePresence, motion } from "framer-motion";
import { FaMoon, FaSun } from "react-icons/fa";

type ColorModeSwitcherProps = Omit<IconButtonProps, "aria-label">;

export default function ColorModeSwitcher(props: ColorModeSwitcherProps) {
  const { colorMode, toggleColorMode } = useColorMode();
  const text = useColorModeValue("dark", "light");
  const SwitchIcon = useColorModeValue(FaMoon, FaSun);
  const onToggleColorMode = () => {
    const meta = document.querySelectorAll(
      'meta[name="theme-color"]',
    )[0] as unknown;
    if (
      meta &&
      typeof meta === "object" &&
      "content" in meta &&
      colorMode === "light"
    ) {
      meta.content = "#000";
    }
    if (
      meta &&
      typeof meta === "object" &&
      "content" in meta &&
      colorMode === "dark"
    ) {
      meta.content = "#fff";
    }
    toggleColorMode();
  };

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        style={{ display: "inline-block" }}
        key={useColorModeValue("light", "dark")}
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 20, opacity: 0 }}
        transition={{ duration: 0.2 }}
      >
        <IconButton
          size="md"
          fontSize="lg"
          variant="ghost"
          color={useColorModeValue("black", "white")}
          _hover={{ background: "whiteAlpha.300" }}
          _active={{ background: "whiteAlpha.500" }}
          marginLeft="2"
          onClick={onToggleColorMode}
          icon={<SwitchIcon />}
          aria-label={`Switch to ${text} mode`}
          {...props}
        />
      </motion.div>
    </AnimatePresence>
  );
}
