// UI Constants
export const UI_CONSTANTS = {
  MOBILE_BREAKPOINT: 768,
  TABLET_BREAKPOINT: 1024,
  DESKTOP_BREAKPOINT: 1200,
  MIN_TOUCH_TARGET: 44,
  SIDEBAR_WIDTH: 280,
  HEADER_HEIGHT: 64,
} as const;

export const MODAL_SIZES = {
  SETTINGS_MODAL: 'max-w-4xl h-[85vh] md:h-[80vh]',
  WIDGET_SETTINGS_MODAL: 'max-w-4xl h-[85vh] md:h-[80vh]',
  CATALOG_MODAL: 'max-w-6xl h-[90vh]',
} as const;

export const ANIMATION_DURATIONS = {
  FAST: 150,
  NORMAL: 200,
  SLOW: 300,
  EXTRA_SLOW: 500,
} as const;

export const Z_INDEX = {
  DROPDOWN: 1000,
  MODAL: 2000,
  OVERLAY: 1500,
  TOOLTIP: 3000,
  NOTIFICATION: 4000,
} as const;