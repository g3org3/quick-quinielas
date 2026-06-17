import { extendTheme, type ThemeConfig } from '@chakra-ui/react'
import { defineStyle, defineStyleConfig } from '@chakra-ui/react'

const config: ThemeConfig = {
  initialColorMode: 'system',
  useSystemColorMode: true,
}

// Custom Button variant: green.200 background in light mode, green.700 in dark mode.
const primary = defineStyle((props) => {
  const isDark = props.colorMode === 'dark'

  return {
    bg: isDark ? 'green.700' : 'green.200',
    color: isDark ? 'green.50' : 'green.900',
    // Short ease transition for color + tactile press feedback
    transitionProperty: 'background-color, transform',
    transitionDuration: '150ms',
    transitionTimingFunction: 'ease',
    _hover: {
      bg: isDark ? 'green.600' : 'green.300',
      _disabled: {
        bg: isDark ? 'green.700' : 'green.200',
      },
    },
    _active: {
      bg: isDark ? 'green.500' : 'green.400',
      transform: 'scale(0.97)',
    },
    // Honor reduced-motion: drop the scale + transition
    '@media (prefers-reduced-motion: reduce)': {
      transitionDuration: '0s',
      _active: { transform: 'none' },
    },
  }
})

// Secondary Button variant: solid blue, mirrors the primary's green styling.
const secondary = defineStyle((props) => {
  const isDark = props.colorMode === 'dark'

  return {
    bg: isDark ? 'blue.700' : 'blue.200',
    color: isDark ? 'blue.50' : 'blue.900',
    // Short ease transition for color + tactile press feedback
    transitionProperty: 'background-color, transform',
    transitionDuration: '150ms',
    transitionTimingFunction: 'ease',
    _hover: {
      bg: isDark ? 'blue.600' : 'blue.300',
      _disabled: {
        bg: isDark ? 'blue.700' : 'blue.200',
      },
    },
    _active: {
      bg: isDark ? 'blue.500' : 'blue.400',
      transform: 'scale(0.97)',
    },
    // Honor reduced-motion: drop the scale + transition
    '@media (prefers-reduced-motion: reduce)': {
      transitionDuration: '0s',
      _active: { transform: 'none' },
    },
  }
})

const Button = defineStyleConfig({
  variants: { primary, secondary },
})

export const theme = extendTheme({
  config,
  components: { Button },
})
