// Authentication Context
export { AuthProvider, useAuth } from './AuthContext';
export type { UserProfile } from './AuthContext';

// Theme Context
export { ThemeProvider, useTheme } from './theme';
export type { ColorScheme, ScrollingScanLineMode, LayoutMode, ThemeConfig } from './theme';

// Tab Manager Context
export { TabManagerProvider, useTabManagerContext } from './TabManagerContext';