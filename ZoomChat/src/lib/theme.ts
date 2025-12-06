// Global Theme Configuration - Pink + Sky Blue Heart Gradient
export const theme = {
  colors: {
    primary: '#4f8aff',
    secondary: '#ff9ad4',
    bgSoft: 'rgba(255, 255, 255, 0.7)',
    bgGlass: 'rgba(255, 255, 255, 0.4)',
    textPrimary: '#1f2937',
    textSecondary: '#6b7280',
    textMuted: '#9ca3af',
    white: '#ffffff',
    pink: {
      light: '#ffd6e0',
      main: '#ff9ad4',
      dark: '#ff6bb5',
    },
    sky: {
      light: '#cfe9ff',
      main: '#4f8aff',
      dark: '#2563eb',
    },
  },
  gradients: {
    heart: 'linear-gradient(120deg, #ff9ad4, #4f8aff)',
    heartReverse: 'linear-gradient(120deg, #4f8aff, #ff9ad4)',
    soft: 'linear-gradient(135deg, #ffd6e0, #cfe9ff)',
    vibrant: 'linear-gradient(135deg, #ff9ad4, #7fd3ff)',
    romantic: 'linear-gradient(to right, #ff9ad4, #ffd6e0)',
    sky: 'linear-gradient(to right, #4f8aff, #7fd3ff)',
  },
  shadows: {
    sm: '0 2px 4px rgba(0, 0, 0, 0.05)',
    md: '0 4px 12px rgba(0, 0, 0, 0.08)',
    lg: '0 8px 24px rgba(0, 0, 0, 0.12)',
    xl: '0 12px 32px rgba(0, 0, 0, 0.15)',
    glow: '0 0 24px rgba(79, 138, 255, 0.3)',
    glowPink: '0 0 24px rgba(255, 154, 212, 0.3)',
  },
  spacing: {
    xs: '0.25rem', // 4px
    sm: '0.5rem', // 8px
    md: '1rem', // 16px
    lg: '1.5rem', // 24px
    xl: '2rem', // 32px
    '2xl': '3rem', // 48px
    '3xl': '4rem', // 64px
  },
  borderRadius: {
    sm: '0.5rem', // 8px
    md: '0.75rem', // 12px
    lg: '1rem', // 16px
    xl: '1.5rem', // 24px
    '2xl': '2rem', // 32px
    full: '9999px',
  },
  typography: {
    h1: {
      fontSize: 'clamp(2rem, 5vw, 3.5rem)',
      fontWeight: '700',
      lineHeight: '1.2',
      letterSpacing: '-0.02em',
    },
    h2: {
      fontSize: 'clamp(1.5rem, 4vw, 2.5rem)',
      fontWeight: '600',
      lineHeight: '1.3',
      letterSpacing: '-0.01em',
    },
    h3: {
      fontSize: 'clamp(1.25rem, 3vw, 1.875rem)',
      fontWeight: '600',
      lineHeight: '1.4',
    },
    body: {
      fontSize: 'clamp(0.875rem, 2vw, 1rem)',
      fontWeight: '400',
      lineHeight: '1.6',
    },
    caption: {
      fontSize: 'clamp(0.75rem, 1.5vw, 0.875rem)',
      fontWeight: '400',
      lineHeight: '1.5',
      color: '#9ca3af',
    },
  },
  breakpoints: {
    mobile: '640px',
    tablet: '768px',
    laptop: '1024px',
    desktop: '1280px',
    wide: '1536px',
  },
  animations: {
    transition: 'all 0.2s ease-in-out',
    transitionSlow: 'all 0.3s ease-in-out',
    hover: 'transform 0.2s ease-in-out',
  },
  zIndex: {
    dropdown: 1000,
    modal: 2000,
    tooltip: 3000,
    notification: 4000,
  },
} as const;

export type Theme = typeof theme;
