import { useCallback, useEffect, useState, useRef } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/contexts/AuthContext';

// Improved multi-tab detection without global fetch override
export function useSecurity() {
  const { user } = useAuth();
  const [tabCount, setTabCount] = useState(1);
  const tabId = useRef(crypto.randomUUID());

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
      console.error('Failed to log security event:', error);
    }
  }, [user?.id]);

  // Robust multi-tab detection using BroadcastChannel
  useEffect(() => {
    if (!user?.id) return;

    const bc = new BroadcastChannel('chimera_presence');
    const peers = new Set<string>();
    let debounceTimer: NodeJS.Timeout;

    const announcePresence = () => {
      bc.postMessage({ type: 'hello', id: tabId.current });
    };

    const announceLeaving = () => {
      bc.postMessage({ type: 'bye', id: tabId.current });
    };

    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === 'hello') {
        peers.add(event.data.id);
        bc.postMessage({ type: 'ack', id: tabId.current });
      } else if (event.data.type === 'ack') {
        peers.add(event.data.id);
      } else if (event.data.type === 'bye') {
        peers.delete(event.data.id);
      }

      // Debounced tab count update to avoid false positives
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        const totalTabs = peers.size + 1; // +1 for current tab
        setTabCount(totalTabs);
        
        if (totalTabs > 3) {
          logSecurityEvent('multiple_tabs_detected', {
            tabCount: totalTabs,
            timestamp: new Date().toISOString()
          });
        }
      }, 1000); // 1 second debounce
    };

    bc.addEventListener('message', handleMessage);
    announcePresence();
    
    window.addEventListener('beforeunload', announceLeaving);
    window.addEventListener('visibilitychange', () => {
      if (!document.hidden) {
        announcePresence();
      }
    });

    return () => {
      announceLeaving();
      bc.removeEventListener('message', handleMessage);
      bc.close();
      window.removeEventListener('beforeunload', announceLeaving);
      clearTimeout(debounceTimer);
    };
  }, [user?.id, logSecurityEvent]);

  // Validate password strength
  const validatePassword = useCallback(async (password: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase
        .rpc('validate_password_strength', { password });

      if (error) {
        console.error('Password validation error:', error);
        return false;
      }

      if (!data) {
        logSecurityEvent('weak_password_attempt', {
          timestamp: new Date().toISOString()
        });
      }

      return data;
    } catch (error) {
      console.error('Password validation failed:', error);
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
      console.error('Login pattern check failed:', error);
    }
  }, [user?.id, logSecurityEvent]);

  return {
    logSecurityEvent,
    validatePassword,
    checkLoginPattern,
    tabCount
  };
}