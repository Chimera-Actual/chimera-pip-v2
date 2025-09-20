import { supabase } from '@/lib/supabaseClient';
import { toast } from '@/hooks/use-toast';

export interface AuthValidationResult {
  isValid: boolean;
  user: { id: string } | null;
  error?: string;
}

/**
 * Validates current authentication state and shows appropriate error messages
 */
export const validateAuthentication = async (expectedUserId?: string): Promise<AuthValidationResult> => {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error) {
      toast({
        title: 'Authentication Error',
        description: 'Unable to verify your login status. Please try again.',
        variant: 'destructive',
      });
      return { isValid: false, user: null, error: error.message };
    }

    if (!user) {
      toast({
        title: 'Authentication Required',
        description: 'Please log in to continue.',
        variant: 'destructive',
      });
      return { isValid: false, user: null, error: 'No authenticated user' };
    }

    // If expected user ID is provided, verify it matches
    if (expectedUserId && user.id !== expectedUserId) {
      toast({
        title: 'Session Mismatch',
        description: 'Your session has changed. Please refresh the page.',
        variant: 'destructive',
      });
      return { isValid: false, user: null, error: 'User ID mismatch' };
    }

    return { isValid: true, user: { id: user.id } };
  } catch (error) {
    toast({
      title: 'Authentication Error',
      description: 'Failed to verify authentication. Please try again.',
      variant: 'destructive',
    });
    return { 
      isValid: false, 
      user: null, 
      error: error instanceof Error ? error.message : 'Unknown authentication error' 
    };
  }
};

/**
 * Validates that a user owns a resource before allowing operations
 */
export const validateResourceOwnership = async (
  resourceUserId: string, 
  currentUserId?: string
): Promise<boolean> => {
  const authResult = await validateAuthentication(currentUserId);
  
  if (!authResult.isValid || !authResult.user) {
    return false;
  }

  if (authResult.user.id !== resourceUserId) {
    toast({
      title: 'Access Denied',
      description: 'You do not have permission to modify this resource.',
      variant: 'destructive',
    });
    return false;
  }

  return true;
};

/**
 * Higher-order function that wraps database operations with authentication checks
 */
export const withAuth = <T extends any[], R>(
  operation: (...args: T) => Promise<R>,
  operationName: string = 'operation'
) => {
  return async (...args: T): Promise<R | null> => {
    const authResult = await validateAuthentication();
    
    if (!authResult.isValid) {
      console.warn(`${operationName} blocked - authentication failed:`, authResult.error);
      return null;
    }

    try {
      return await operation(...args);
    } catch (error) {
      console.error(`${operationName} failed:`, error);
      throw error;
    }
  };
};

/**
 * Session timeout detection and handling
 */
export const handleSessionTimeout = (error: any): boolean => {
  if (error?.message?.includes('JWT') || 
      error?.message?.includes('token') || 
      error?.code === 'PGRST301') {
    toast({
      title: 'Session Expired',
      description: 'Your session has expired. Please log in again.',
      variant: 'destructive',
    });
    return true;
  }
  return false;
};