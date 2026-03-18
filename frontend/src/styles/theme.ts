export const theme = {
  colors: {
    // Brand
    navbarStart: '#1a1a3e',
    navbarEnd: '#2d1b69',

    // Surfaces
    bg: '#f4f5f7',
    surface: '#ffffff',
    surfaceAlt: '#fafbfc',
    surfaceHover: '#ebecf0',
    cellBg: '#f0f1f4',

    // Text
    text: '#172b4d',
    textSecondary: '#6b778c',
    textMuted: '#a5adba',
    textInverse: 'rgba(255, 255, 255, 0.9)',

    // Borders
    border: '#dfe1e6',
    borderLight: '#d6d6d6',

    // Primary / Accent
    primary: '#4A90D9',
    primaryLight: '#e4f0ff',
    primaryFocus: 'rgba(74, 144, 217, 0.3)',
    primaryHover: '#4c9aff',

    // Semantic
    danger: '#e74c3c',
    success: '#2ecc71',
    warning: '#f39c12',

    // Holiday
    holidayBg: '#fff3cd',
    holidayText: '#856404',

    // Card
    cardShadow: 'rgba(0, 0, 0, 0.08)',
    cardShadowHover: 'rgba(0, 0, 0, 0.12)',
    cardShadowDrag: 'rgba(0, 0, 0, 0.15)',
  },
  radii: {
    sm: '3px',
    md: '4px',
    lg: '6px',
    xl: '8px',
  },
  shadows: {
    sm: '0 1px 3px rgba(0, 0, 0, 0.08)',
    md: '0 2px 8px rgba(0, 0, 0, 0.1)',
    lg: '0 8px 24px rgba(0, 0, 0, 0.2)',
    navbar: '0 2px 8px rgba(0, 0, 0, 0.2)',
  },
  fontSizes: {
    xs: '11px',
    sm: '12px',
    md: '13px',
    base: '14px',
    lg: '15px',
    xl: '20px',
  },
  sizes: {
    cellMinHeight: '130px',
    cellMinHeightWeek: '300px',
  },
  breakpoints: {
    mobile: '480px',
    tablet: '768px',
  },
} as const;

export type Theme = typeof theme;
