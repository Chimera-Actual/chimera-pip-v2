import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface UserPresence {
  userId: string;
  status: 'online' | 'away' | 'offline';
  lastSeen: string;
  sessionData?: Record<string, any>;
}

export function usePresence() {
  const { user } = useAuth();
  const [presenceList, setPresenceList] = useState<UserPresence[]>([]);
  const [onlineCount, setOnlineCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Update user's own presence
  const updatePresence = useCallback(async (status: 'online' | 'away' | 'offline', sessionData?: Record<string, any>) => {
    if (!user?.id) return;

    try {
      await supabase.functions.invoke('presence-manager', {
        body: {
          userId: user.id,
          status,
          sessionData
        }
      });
    } catch (error) {
      console.error('Error updating presence:', error);
    }
  }, [user?.id]);

  // Load initial presence data
  useEffect(() => {
    const loadPresence = async () => {
      try {
        const { data, error } = await supabase
          .from('user_presence')
          .select(`
            user_id,
            status,
            last_seen,
            session_data
          `)
          .eq('status', 'online')
          .gte('last_seen', new Date(Date.now() - 5 * 60 * 1000).toISOString());

        if (error) throw error;

        const presence: UserPresence[] = data.map(p => ({
          userId: p.user_id,
          status: p.status as 'online' | 'away' | 'offline',
          lastSeen: p.last_seen,
          sessionData: p.session_data as Record<string, any> || {}
        }));

        setPresenceList(presence);
        setOnlineCount(presence.length);
      } catch (error) {
        console.error('Error loading presence:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadPresence();
  }, []);

  // Set up real-time subscriptions
  useEffect(() => {
    const channel = supabase
      .channel('presence-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_presence'
        },
        (payload) => {
          console.log('Presence change:', payload);
          
          if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
            const newPresence: UserPresence = {
              userId: payload.new.user_id,
              status: payload.new.status,
              lastSeen: payload.new.last_seen,
              sessionData: payload.new.session_data as Record<string, any> || {}
            };

            setPresenceList(prev => {
              const filtered = prev.filter(p => p.userId !== newPresence.userId);
              if (newPresence.status === 'online') {
                return [...filtered, newPresence];
              }
              return filtered;
            });
          } else if (payload.eventType === 'DELETE') {
            setPresenceList(prev => prev.filter(p => p.userId !== payload.old.user_id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Update online count when presence list changes
  useEffect(() => {
    setOnlineCount(presenceList.filter(p => p.status === 'online').length);
  }, [presenceList]);

  // Auto-update presence when user is active
  useEffect(() => {
    if (!user?.id) return;

    const updateActivity = () => updatePresence('online');
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        updatePresence('online');
      } else {
        updatePresence('away');
      }
    };

    // Set initial presence
    updatePresence('online');

    // Update presence every 2 minutes
    const interval = setInterval(updateActivity, 2 * 60 * 1000);

    // Handle tab visibility changes
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Handle beforeunload to set offline status
    const handleBeforeUnload = () => updatePresence('offline');
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      updatePresence('offline');
    };
  }, [user?.id, updatePresence]);

  return {
    presenceList,
    onlineCount,
    isLoading,
    updatePresence
  };
}