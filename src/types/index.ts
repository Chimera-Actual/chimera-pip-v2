// Centralized type definitions for the application

export interface BaseEntity {
  id: string;
  created_at: string;
  updated_at: string;
}

export interface UserEntity extends BaseEntity {
  user_id: string;
}

// Re-export common types
export type { UserProfile, TabConfig } from '@/services/db';
export type { TabConfiguration } from '@/types/tabManagement';
export type { 
  BaseWidgetSettings, 
  BaseWidgetProps, 
  WidgetTemplateProps,
  WidgetSize,
  WidgetTheme 
} from '@/types/widget';

// API Response types
export interface ApiResponse<T = unknown> {
  data: T | null;
  error: string | null;
  success: boolean;
  timestamp?: string;
}

// Theme types
export type ColorScheme = 'green' | 'amber' | 'blue' | 'red' | 'white';

export interface ThemeConfig {
  colorScheme: ColorScheme;
  soundEnabled: boolean;
  glowIntensity: number;
  scanLineIntensity: number;
  backgroundScanLines: boolean;
  scrollingScanLines: 'off' | 'normal' | 'random';
}

// Form types
export interface FormState<T = Record<string, unknown>> {
  data: T;
  errors: Partial<Record<keyof T, string>>;
  isValid: boolean;
  isSubmitting: boolean;
}

// Navigation types
export interface NavItem {
  id: string;
  label: string;
  href: string;
  icon?: string;
  disabled?: boolean;
}

// Pagination types
export interface PaginationState {
  page: number;
  pageSize: number;
  total: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

// Search/Filter types
export interface FilterState {
  query: string;
  category?: string;
  tags: string[];
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}