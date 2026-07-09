import { extendTheme, type ThemeConfig } from '@chakra-ui/react'
import { defineStyle, defineStyleConfig } from '@chakra-ui/react'

const config: ThemeConfig = {
  initialColorMode: 'system',
  useSystemColorMode: true,
}

// Custom Button variant: the single solid brand action per view (see guide.md §3).
const primary = defineStyle((props) => {
  const isDark = props.colorMode === 'dark'

  return {
    bg: isDark ? 'brand.700' : 'brand.200',
    color: isDark ? 'brand.50' : 'brand.900',
    // Short ease transition for color + tactile press feedback
    transitionProperty: 'background-color, transform',
    transitionDuration: '150ms',
    transitionTimingFunction: 'ease',
    _hover: {
      bg: isDark ? 'brand.600' : 'brand.300',
      _disabled: {
        bg: isDark ? 'brand.700' : 'brand.200',
      },
    },
    _active: {
      bg: isDark ? 'brand.500' : 'brand.400',
      transform: 'scale(0.97)',
    },
    // Honor reduced-motion: drop the scale + transition
    '@media (prefers-reduced-motion: reduce)': {
      transitionDuration: '0s',
      _active: { transform: 'none' },
    },
  }
})

// Secondary actions are quiet: gray outline, no accent color (guide.md §3).
const secondary = defineStyle(() => {
  return {
    bg: 'transparent',
    borderWidth: '1px',
    borderColor: 'border.subtle',
    color: 'text.secondary',
    transitionProperty: 'background-color, transform',
    transitionDuration: '150ms',
    transitionTimingFunction: 'ease',
    _hover: {
      bg: 'surface.subtle',
      _disabled: { bg: 'transparent' },
    },
    _active: {
      bg: 'surface.subtle',
      transform: 'scale(0.97)',
    },
    '@media (prefers-reduced-motion: reduce)': {
      transitionDuration: '0s',
      _active: { transform: 'none' },
    },
  }
})

const Button = defineStyleConfig({
  baseStyle: { fontWeight: 'bold', rounded: 'xl' },
  variants: { primary, secondary },
})

export const theme = extendTheme({
  config,
  fonts: {
    heading: `'Archivo', 'Inter', sans-serif`,
    body: `'Inter', sans-serif`,
    mono: `'JetBrains Mono', monospace`,
  },
  colors: {
    // ONE accent ramp (guide.md §2) so colorScheme="brand" works everywhere.
    brand: {
      50: '#EBF7EF',
      100: '#D3EEDD',
      200: '#A9DDBC',
      300: '#7CC99A',
      400: '#4BAE74',
      500: '#178A47',
      600: '#0F7239',
      700: '#0B5C2E',
      800: '#084723',
      900: '#053218',
    },
    // gold = bonus/reward badges (never red/pink for positives)
    gold: { 50: '#FDF3D7', 200: '#F0D890', 700: '#8A6206' },
  },
  semanticTokens: {
    colors: {
      'text.primary': { default: 'gray.900', _dark: 'gray.50' },
      'text.secondary': { default: 'gray.600', _dark: 'gray.300' },
      'text.muted': { default: 'gray.500', _dark: 'gray.400' },
      surface: { default: 'white', _dark: 'gray.800' },
      'surface.subtle': { default: 'gray.50', _dark: 'gray.700' },
      'border.subtle': { default: 'gray.200', _dark: 'gray.600' },
      'status.open': { default: 'green.500', _dark: 'green.300' },
      'status.closed': { default: 'orange.500', _dark: 'orange.300' },
    },
  },
  shadows: {
    outline: '0 0 0 3px var(--chakra-colors-brand-100)', // focus ring in accent
  },
  components: { Button },
})
