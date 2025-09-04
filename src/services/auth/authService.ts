// Authentication Service - Centralized auth operations
import { supabase } from '@/integrations/supabase/client';
import { LoginCredentials, RegisterCredentials, AuthUser, AuthSession } from './types';
import { ApiResponse } from '../api/types';
import { errorHandler } from '../api/errorHandler';
import { reportError } from '@/lib/errorReporting';

class AuthenticationService {
  // Sign in with email and password
  async signIn(credentials: LoginCredentials): Promise<ApiResponse<AuthSession>> {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password,
      });

      if (error) throw error;

      if (!data.user || !data.session) {
        throw new Error('Authentication failed');
      }

      return {
        success: true,
        data: {
          user: data.user as AuthUser,
          access_token: data.session.access_token,
          refresh_token: data.session.refresh_token,
          expires_at: data.session.expires_at || 0,
          expires_in: data.session.expires_in || 0,
        },
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return errorHandler.handleApiError(error, { operation: 'signIn' });
    }
  }

  // Sign up with email and password
  async signUp(credentials: RegisterCredentials): Promise<ApiResponse<AuthSession>> {
    try {
      const { data, error } = await supabase.auth.signUp({
        email: credentials.email,
        password: credentials.password,
        options: {
          data: {
            username: credentials.username,
          },
        },
      });

      if (error) throw error;

      if (!data.user) {
        throw new Error('Registration failed');
      }

      return {
        success: true,
        data: {
          user: data.user as AuthUser,
          access_token: data.session?.access_token || '',
          refresh_token: data.session?.refresh_token || '',
          expires_at: data.session?.expires_at || 0,
          expires_in: data.session?.expires_in || 0,
        },
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return errorHandler.handleApiError(error, { operation: 'signUp' });
    }
  }

  // Sign out
  async signOut(): Promise<ApiResponse<void>> {
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) throw error;

      return {
        success: true,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return errorHandler.handleApiError(error, { operation: 'signOut' });
    }
  }

  // Get current user
  async getCurrentUser(): Promise<ApiResponse<AuthUser | null>> {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      
      if (error) throw error;

      return {
        success: true,
        data: user as AuthUser | null,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return errorHandler.handleApiError(error, { operation: 'getCurrentUser' });
    }
  }

  // Reset password
  async resetPassword(email: string): Promise<ApiResponse<void>> {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      
      if (error) throw error;

      return {
        success: true,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return errorHandler.handleApiError(error, { operation: 'resetPassword' });
    }
  }

  // Update password
  async updatePassword(newPassword: string): Promise<ApiResponse<AuthUser>> {
    try {
      const { data, error } = await supabase.auth.updateUser({
        password: newPassword,
      });
      
      if (error) throw error;

      return {
        success: true,
        data: data.user as AuthUser,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return errorHandler.handleApiError(error, { operation: 'updatePassword' });
    }
  }

  // Listen to auth state changes
  onAuthStateChange(callback: (user: AuthUser | null) => void) {
    return supabase.auth.onAuthStateChange((event, session) => {
      callback(session?.user as AuthUser | null);
    });
  }
}

export const authService = new AuthenticationService();