// UI Constants

export const BREAKPOINTS = {
  MOBILE: 768,
  TABLET: 1024,
  DESKTOP: 1200,
  LARGE: 1440,
} as const;

export const INTERACTION_DELAYS = {
  LONG_PRESS: 500,
  DEBOUNCE_SYNC: 1000,
  DEBOUNCE_SEARCH: 300,
  ANIMATION: 200,
  TOOLTIP_DELAY: 750,
  HOVER_DELAY: 100,
  FOCUS_DELAY: 50,
} as const;

export const ANIMATION_DURATIONS = {
  FAST: 150,
  NORMAL: 200,
  SLOW: 300,
  VERY_SLOW: 500,
} as const;

export const Z_INDEX = {
  DROPDOWN: 1000,
  STICKY: 1020,
  FIXED: 1030,
  MODAL_BACKDROP: 1040,
  MODAL: 1050,
  POPOVER: 1060,
  TOOLTIP: 1070,
  TOAST: 1080,
} as const;

export const MODAL_SIZES = {
  SMALL: 'max-w-md',
  MEDIUM: 'max-w-lg',
  LARGE: 'max-w-2xl',
  EXTRA_LARGE: 'max-w-4xl',
  FULL_SCREEN: 'max-w-full h-screen',
  SETTINGS_MODAL: 'max-w-4xl h-[85vh] md:h-[80vh]',
  WIDGET_SETTINGS_MODAL: 'max-w-4xl h-[85vh] md:h-[80vh]',
  CATALOG_MODAL: 'max-w-6xl h-[90vh]',
} as const;

export const GRID_SYSTEMS = {
  COLUMNS_12: 12,
  COLUMNS_16: 16,
  COLUMNS_24: 24,
} as const;

export const SPACING = {
  XS: 4,
  SM: 8,
  MD: 16,
  LG: 24,
  XL: 32,
  XXL: 48,
} as const;

export const TOUCH_TARGETS = {
  MIN_SIZE: 44, // Minimum touch target size
  PREFERRED_SIZE: 48, // Preferred touch target size
} as const;

export const ACCESSIBILITY = {
  FOCUS_VISIBLE_OUTLINE: '2px solid hsl(var(--ring))',
  SCREEN_READER_ONLY: 'sr-only',
  ARIA_EXPANDED: 'aria-expanded',
  ARIA_HIDDEN: 'aria-hidden',
  ARIA_LABEL: 'aria-label',
  ARIA_LABELLEDBY: 'aria-labelledby',
  ARIA_DESCRIBEDBY: 'aria-describedby',
} as const;