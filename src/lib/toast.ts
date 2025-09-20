/**
 * Unified toast utility wrapper around shadcn-ui toasts
 * 
 * This provides a stable API for toast notifications across the app.
 * All toasts use the shadcn-ui system for consistent theming.
 */
import { toast as shadcnToast } from '@/hooks/use-toast';

export interface ToastOptions {
  title?: string;
  description?: string;
  variant?: 'default' | 'destructive';
}

/**
 * Show a success toast
 */
export const success = (message: string, options?: Omit<ToastOptions, 'variant'>) => {
  return shadcnToast({
    title: options?.title || 'Success',
    description: options?.description || message,
    variant: 'default',
  });
};

/**
 * Show an error toast
 */
export const error = (message: string, options?: Omit<ToastOptions, 'variant'>) => {
  return shadcnToast({
    title: options?.title || 'Error',
    description: options?.description || message,
    variant: 'destructive',
  });
};

/**
 * Show an info toast
 */
export const info = (message: string, options?: Omit<ToastOptions, 'variant'>) => {
  return shadcnToast({
    title: options?.title || 'Info',
    description: options?.description || message,
    variant: 'default',
  });
};

/**
 * Main toast function (compatible with existing shadcn usage)
 */
export const toast = shadcnToast;

// Named exports for different toast types (shadcn-compatible API)
export default {
  success,
  error,
  info,
  toast: shadcnToast,
};