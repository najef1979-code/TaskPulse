/**
 * Material Design 3 Design Tokens for TaskPulse
 * Based on Material Design 3 Guidelines
 */

// Color System
export const colors = {
  // Primary color (Blue)
  primary: {
    10: '#E1F0FF',
    20: '#B3DCFF',
    30: '#81C1FF',
    40: '#4AA8FF',
    50: '#1A8FFF',
    60: '#0074E8',
    70: '#005AC1',
    80: '#00459A',
    90: '#002B64',
    95: '#001842',
    98: '#000E2B',
    99: '#00060D',
  },

  // Secondary color (Teal)
  secondary: {
    10: '#D5F4F3',
    20: '#A7EEC8',
    30: '#79D2AD',
    40: '#4CB691',
    50: '#269B76',
    60: '#007E5C',
    70: '#005D45',
    80: '#003F30',
    90: '#00281F',
    95: '#001818',
    98: '#000E11',
    99: '#000504',
  },

  // Surface colors
  surface: {
    1: '#FDFBFF',
    2: '#F7F3FA',
    3: '#F2EEF5',
    4: '#EDE9F0',
    5: '#E8E4EB',
  },

  // Background colors
  background: {
    1: '#FDFBFF',
    2: '#F7F3FA',
  },

  // Error color (Red)
  error: {
    10: '#FFF0F0',
    20: '#FFD6D6',
    30: '#FFB3B3',
    40: '#FF8A8A',
    50: '#FF5A5A',
    60: '#DE3737',
    70: '#B3261E',
    80: '#8C1D18',
    90: '#6B1210',
    95: '#490806',
    98: '#2C0405',
    99: '#180000',
  },

  // Outline colors
  outline: {
    variant: '#79747E',
    focus: '#322F35',
    hover: '#1C1B1F',
  },

  // Text colors
  text: {
    primary: '#1C1B1F',
    secondary: '#49454F',
    tertiary: '#49454F',
    disabled: '#7B7980',
    inverse: '#F3F3FA',
  },

  // Priority colors
  priority: {
    low: '#006C4C',
    medium: '#7D5260',
    high: '#981B1B',
    critical: '#BA1A1A',
  },
};

// Typography Scale
export const typography = {
  // Display
  displayLarge: {
    fontSize: '57px',
    lineHeight: '64px',
    fontWeight: 400,
  },
  displayMedium: {
    fontSize: '45px',
    lineHeight: '52px',
    fontWeight: 400,
  },
  displaySmall: {
    fontSize: '36px',
    lineHeight: '44px',
    fontWeight: 400,
  },

  // Headline
  headlineLarge: {
    fontSize: '32px',
    lineHeight: '40px',
    fontWeight: 400,
  },
  headlineMedium: {
    fontSize: '28px',
    lineHeight: '36px',
    fontWeight: 400,
  },
  headlineSmall: {
    fontSize: '24px',
    lineHeight: '32px',
    fontWeight: 400,
  },

  // Title
  titleLarge: {
    fontSize: '22px',
    lineHeight: '28px',
    fontWeight: 400,
  },
  titleMedium: {
    fontSize: '16px',
    lineHeight: '24px',
    fontWeight: 500,
    letterSpacing: '0.15px',
  },
  titleSmall: {
    fontSize: '14px',
    lineHeight: '20px',
    fontWeight: 500,
    letterSpacing: '0.1px',
  },

  // Body
  bodyLarge: {
    fontSize: '16px',
    lineHeight: '24px',
    fontWeight: 400,
    letterSpacing: '0.5px',
  },
  bodyMedium: {
    fontSize: '14px',
    lineHeight: '20px',
    fontWeight: 400,
    letterSpacing: '0.25px',
  },
  bodySmall: {
    fontSize: '12px',
    lineHeight: '16px',
    fontWeight: 400,
    letterSpacing: '0.4px',
  },

  // Label
  labelLarge: {
    fontSize: '14px',
    lineHeight: '20px',
    fontWeight: 500,
    letterSpacing: '0.1px',
  },
  labelMedium: {
    fontSize: '12px',
    lineHeight: '16px',
    fontWeight: 500,
    letterSpacing: '0.5px',
  },
  labelSmall: {
    fontSize: '11px',
    lineHeight: '16px',
    fontWeight: 500,
    letterSpacing: '0.5px',
  },
};

// Spacing Scale
export const spacing = {
  xs: '4px',
  sm: '8px',
  md: '12px',
  lg: '16px',
  xl: '24px',
  xxl: '32px',
  xxxl: '48px',
};

// Border Radius
export const borderRadius = {
  xs: '4px',
  sm: '8px',
  md: '12px',
  lg: '16px',
  xl: '20px',
  xxl: '24px',
  full: '9999px',
};

// Elevation (Shadows)
export const elevation = {
  level0: 'none',
  level1: '0px 1px 2px rgba(0, 0, 0, 0.3), 0px 1px 3px 1px rgba(0, 0, 0, 0.15)',
  level2: '0px 1px 2px rgba(0, 0, 0, 0.3), 0px 2px 6px 2px rgba(0, 0, 0, 0.15)',
  level3: '0px 4px 8px 3px rgba(0, 0, 0, 0.15), 0px 1px 3px rgba(0, 0, 0, 0.3)',
  level4: '0px 6px 10px 4px rgba(0, 0, 0, 0.15), 0px 2px 3px rgba(0, 0, 0, 0.3)',
  level5: '0px 8px 12px 6px rgba(0, 0, 0, 0.15), 0px 4px 4px rgba(0, 0, 0, 0.3)',
};

// State Layer Opacity
export const stateLayer = {
  hover: 0.08,
  focus: 0.12,
  press: 0.12,
  drag: 0.16,
};

// Animation Duration
export const duration = {
  short1: 50,
  short2: 100,
  short3: 150,
  short4: 200,
  medium1: 250,
  medium2: 300,
  medium3: 350,
  medium4: 400,
  long1: 450,
  long2: 500,
  long3: 550,
  long4: 600,
};

// Animation Easing
export const easing = {
  standard: 'cubic-bezier(0.2, 0.0, 0, 1.0)',
  emphasized: 'cubic-bezier(0.2, 0.0, 0, 1.0)',
  emphasizedDecelerate: 'cubic-bezier(0.05, 0.7, 0.1, 1.0)',
  emphasizedAccelerate: 'cubic-bezier(0.3, 0.0, 0.8, 0.15)',
  legacy: 'cubic-bezier(0.4, 0.0, 0.2, 1)',
};

// Button variants
export const buttonVariants = {
  filled: {
    backgroundColor: colors.primary[60],
    color: colors.text.inverse,
    elevation: elevation.level0,
    hoverElevation: elevation.level1,
    focusElevation: elevation.level1,
  },
  tonal: {
    backgroundColor: colors.primary[90],
    color: colors.primary[30],
    elevation: elevation.level0,
    hoverElevation: elevation.level1,
    focusElevation: elevation.level1,
  },
  outlined: {
    backgroundColor: 'transparent',
    color: colors.primary[60],
    border: `1px solid ${colors.outline.variant}`,
    elevation: elevation.level0,
  },
  text: {
    backgroundColor: 'transparent',
    color: colors.primary[60],
    elevation: elevation.level0,
  },
  elevated: {
    backgroundColor: colors.primary[90],
    color: colors.primary[30],
    elevation: elevation.level1,
    hoverElevation: elevation.level2,
    focusElevation: elevation.level3,
  },
};

export default {
  colors,
  typography,
  spacing,
  borderRadius,
  elevation,
  stateLayer,
  duration,
  easing,
  buttonVariants,
};