import { useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export function useSecurity() {
  const { user } = useAuth();

  // Log security events
  const logSecurityEvent = useCallback(async (
    eventType: string, 
    eventData?: Record<string, any>,
    ipAddress?: string,
    userAgent?: string
  ) => {
    if (!user?.id) return;

    try {
      await supabase.functions.invoke('security-monitor', {
        body: {
          userId: user.id,
          eventType,
          eventData: eventData || {},
          ipAddress: ipAddress || 'unknown',
          userAgent: userAgent || navigator.userAgent
        }
      });
    } catch (error) {
      // Handle security event logging error in production
    }
  }, [user?.id]);

  // Monitor suspicious activities
  useEffect(() => {
    if (!user?.id) return;

    // Track failed authentication attempts
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      const response = await originalFetch(...args);
      
      // Monitor authentication related requests
      if (args[0]?.toString().includes('auth') && !response.ok) {
        logSecurityEvent('auth_failure', {
          url: args[0]?.toString(),
          status: response.status,
          timestamp: new Date().toISOString()
        });
      }
      
      return response;
    };

    // Monitor multiple tabs/windows
    let tabCount = 1;
    const handleFocus = () => {
      tabCount++;
      if (tabCount > 3) {
        logSecurityEvent('multiple_tabs_detected', {
          tabCount,
          timestamp: new Date().toISOString()
        });
      }
    };

    const handleBlur = () => {
      tabCount = Math.max(1, tabCount - 1);
    };

    window.addEventListener('focus', handleFocus);
    window.addEventListener('blur', handleBlur);

    // Monitor for potential token access in localStorage/sessionStorage
    const checkForTokenAccess = () => {
      try {
        const storage = { ...localStorage, ...sessionStorage };
        const hasTokenData = Object.keys(storage).some(key => 
          key.includes('token') || key.includes('auth')
        );
        if (hasTokenData) {
          logSecurityEvent('storage_token_access', {
            timestamp: new Date().toISOString()
          });
        }
      } catch (error) {
        // Storage access blocked, this is actually good for security
      }
    };

    // Check for token access periodically
    const tokenCheckInterval = setInterval(checkForTokenAccess, 30000); // Check every 30 seconds

    return () => {
      window.fetch = originalFetch;
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('blur', handleBlur);
      clearInterval(tokenCheckInterval);
    };
  }, [user?.id, logSecurityEvent]);

  // Validate password strength
  const validatePassword = useCallback(async (password: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase
        .rpc('validate_password_strength', { password });

      if (error) {
        // Handle password validation error in production
        return false;
      }

      if (!data) {
        logSecurityEvent('weak_password_attempt', {
          timestamp: new Date().toISOString()
        });
      }

      return data;
    } catch (error) {
      // Handle validation error in production
      return false;
    }
  }, [logSecurityEvent]);

  // Check for suspicious login patterns
  const checkLoginPattern = useCallback(async () => {
    if (!user?.id) return;

    try {
      const { data, error } = await supabase
        .from('security_events')
        .select('*')
        .eq('user_id', user.id)
        .eq('event_type', 'login')
        .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
        .order('created_at', { ascending: false });

      if (error) throw error;

      const loginCount = data?.length || 0;
      if (loginCount > 10) {
        logSecurityEvent('excessive_login_attempts', {
          count: loginCount,
          timestamp: new Date().toISOString()
        });
      }
    } catch (error) {
      // Handle login pattern check error in production
    }
  }, [user?.id, logSecurityEvent]);

  return {
    logSecurityEvent,
    validatePassword,
    checkLoginPattern
  };
}