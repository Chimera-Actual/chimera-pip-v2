// Safe fetch wrapper with centralized security logging
import { supabase } from '@/lib/supabaseClient';

interface SafeFetchOptions extends RequestInit {
  logSecurityEvents?: boolean;
  userId?: string;
}

export async function safeFetch(
  url: string | URL | Request, 
  options: SafeFetchOptions = {}
): Promise<Response> {
  const { logSecurityEvents = true, userId, ...fetchOptions } = options;
  
  try {
    const response = await fetch(url, fetchOptions);
    
    // Log security events for auth-related failures
    if (logSecurityEvents && userId && url.toString().includes('auth') && !response.ok) {
      try {
        await supabase.functions.invoke('security-monitor', {
          body: {
            userId,
            eventType: 'auth_failure',
            eventData: {
              url: url.toString(),
              status: response.status,
              timestamp: new Date().toISOString()
            }
          }
        });
      } catch (logError) {
        console.error('Failed to log security event:', logError);
      }
    }
    
    return response;
  } catch (error) {
    // Log network errors for auth endpoints
    if (logSecurityEvents && userId && url.toString().includes('auth')) {
      try {
        await supabase.functions.invoke('security-monitor', {
          body: {
            userId,
            eventType: 'auth_network_error',
            eventData: {
              url: url.toString(),
              error: error instanceof Error ? error.message : 'Unknown error',
              timestamp: new Date().toISOString()
            }
          }
        });
      } catch (logError) {
        console.error('Failed to log security event:', logError);
      }
    }
    
    throw error;
  }
}

export default safeFetch;