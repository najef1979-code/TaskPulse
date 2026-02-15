/**
 * Fintech Design Tokens for TaskPulse Experimental Dashboard
 * Based on the provided design specifications
 */

  // Color Palettes
export const colors = {
  // Primary: Pulse Blue family
  primary: {
    50: '#EFF6FF',
    100: '#DBEAFE',
    200: '#BFDBFE',
    300: '#93C5FD',
    400: '#60A5FA',
    500: '#3B82F6',
    600: '#2563EB',
    700: '#1D4ED8',
    800: '#1E40AF',
    900: '#1E3A8A',
  },

  // Secondary: Pulse Indigo family
  secondary: {
    50: '#EEF2FF',
    100: '#E0E7FF',
    200: '#C7D2FE',
    300: '#A5B4FC',
    400: '#818CF8',
    500: '#6366F1',
    600: '#4F46E5',
    700: '#4338CA',
    800: '#3730A3',
    900: '#312E81',
  },

  // Light mode grays
  grayLight: {
    50: '#F9FAFB',
    100: '#F3F4F6',
    200: '#E5E7EB',
    300: '#D1D5DB',
    400: '#9CA3AF',
    500: '#6B7280',
    600: '#4B5563',
    700: '#374151',
    800: '#1F2937',
    900: '#111827',
  },

  // Dark mode grays
  grayDark: {
    50: '#18181B',
    100: '#1F1F23',
    200: '#27272A',
    300: '#3F3F46',
    400: '#52525B',
    500: '#71717A',
    600: '#A1A1AA',
    700: '#D4D4D8',
    800: '#E4E4E7',
    900: '#FAFAFA',
  },

  // Semantic accents
  semantic: {
    progress: {
      bg: 'rgba(6, 182, 212, 0.1)',
      text: '#0E7490',
    },
    review: {
      bg: 'rgba(79, 70, 229, 0.1)',
      text: '#4338CA',
    },
    todo: {
      bg: 'rgba(107, 114, 128, 0.1)',
      text: '#4B5563',
    },
    done: {
      bg: 'rgba(34, 197, 94, 0.1)',
      text: '#166534',
    },
    urgent: '#F59E0B',
  },

  // Gradients
  gradients: {
    cardMedia: 'linear-gradient(135deg, #818CF8 0%, #22D3EE 100%)',
    avatar: 'linear-gradient(135deg, #4F46E5 0%, #06B6D4 100%)',
  },
};

// Typography Scale
export const typography = {
  xs: '12px',
  sm: '14px',
  base: '16px',
  lg: '18px',
  xl: '20px',
  '2xl': '24px',
  weights: {
    regular: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
  family: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
};

// Spacing
export const spacing = {
  xs: '4px',
  sm: '8px',
  md: '12px',
  lg: '16px',
  xl: '24px',
  '2xl': '32px',
  '3xl': '48px',
};

// Border Radius
export const radius = {
  sm: '6px',
  md: '10px',
  lg: '14px',
  xl: '20px',
  full: '9999px',
};

// Shadows/Elevation
export const shadow = {
  cardLight: '0 2px 8px rgba(0, 0, 0, 0.05)',
  cardHoverLight: '0 6px 20px rgba(0, 0, 0, 0.08)',
  cardDark: '0 2px 8px rgba(0, 0, 0, 0.4)',
  cardHoverDark: '0 6px 20px rgba(0, 0, 0, 0.6)',
};

// Border
export const border = {
  width: '1px',
  style: 'solid',
};

// Transitions
export const transition = {
  fast: '150ms ease',
  normal: '200ms ease',
  slow: '250ms ease',
};

// Breakpoints
export const breakpoints = {
  xs: '0px',
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
};

// Layout
export const layout = {
  sidebar: {
    collapsed: '56px',
    expanded: '240px',
  },
  header: {
    height: '64px',
  },
  column: {
    width: '300px',
    gap: '24px',
  },
  card: {
    padding: '16px',
    gap: '12px',
  },
};

// Light mode theme
export const lightTheme = {
  background: colors.grayLight[50],
  sidebar: {
    bg: '#FFFFFF',
    border: colors.grayLight[200],
  },
  header: {
    bg: 'transparent',
    textPrimary: colors.grayLight[900],
    textSecondary: colors.grayLight[500],
  },
  column: {
    title: colors.grayLight[800],
    meta: colors.grayLight[500],
  },
  card: {
    bg: '#FFFFFF',
    border: colors.grayLight[200],
    shadow: shadow.cardLight,
    hoverShadow: shadow.cardHoverLight,
    title: colors.grayLight[900],
    description: colors.grayLight[500],
  },
  buttonPrimary: {
    bg: colors.grayLight[900],
    text: '#FFFFFF',
    hover: colors.grayLight[800],
  },
  text: {
    primary: colors.grayLight[900],
    secondary: colors.grayLight[500],
    tertiary: colors.grayLight[400],
  },
};

// Dark mode theme
export const darkTheme = {
  background: colors.grayDark[50],
  sidebar: {
    bg: colors.grayDark[100],
    border: colors.grayDark[200],
  },
  header: {
    bg: 'transparent',
    textPrimary: colors.grayDark[900],
    textSecondary: colors.grayDark[600],
  },
  column: {
    title: colors.grayDark[800],
    meta: colors.grayDark[500],
  },
  card: {
    bg: colors.grayDark[100],
    border: colors.grayDark[200],
    shadow: shadow.cardDark,
    hoverShadow: shadow.cardHoverDark,
    title: colors.grayDark[900],
    description: colors.grayDark[600],
  },
  buttonPrimary: {
    bg: colors.primary[600],
    text: '#FFFFFF',
    hover: colors.primary[500],
  },
  text: {
    primary: colors.grayDark[900],
    secondary: colors.grayDark[600],
    tertiary: colors.grayDark[500],
  },
};

// Helper function to get theme based on mode
export const getTheme = (isDark) => (isDark ? darkTheme : lightTheme);

// Helper function to get color by path
export const getColor = (theme, path) => {
  const keys = path.split('.');
  let value = theme;
  for (const key of keys) {
    value = value?.[key];
  }
  return value;
};

export default {
  colors,
  typography,
  spacing,
  radius,
  shadow,
  border,
  transition,
  breakpoints,
  layout,
  lightTheme,
  darkTheme,
  getTheme,
  getColor,
};