import { useCallback, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/contexts/AuthContext';

export interface AnalyticsEvent {
  eventName: string;
  properties?: Record<string, any>;
}

export function useAnalytics() {
  const { user } = useAuth();
  const sessionId = useRef<string>(crypto.randomUUID());
  const eventQueue = useRef<AnalyticsEvent[]>([]);
  const flushTimeout = useRef<NodeJS.Timeout>();

  // Track an analytics event
  const track = useCallback(async (eventName: string, properties?: Record<string, any>) => {
    if (!user?.id) return;

    const event: AnalyticsEvent = {
      eventName,
      properties: {
        ...properties,
        timestamp: new Date().toISOString(),
        url: window.location.pathname,
        userAgent: navigator.userAgent,
        referrer: document.referrer
      }
    };

    // Add to queue for batching
    eventQueue.current.push(event);

    // Flush queue after a short delay to batch events
    if (flushTimeout.current) {
      clearTimeout(flushTimeout.current);
    }

    flushTimeout.current = setTimeout(async () => {
      await flushEvents();
    }, 1000);

  }, [user?.id]);

  // Flush queued events to the backend
  const flushEvents = useCallback(async () => {
    if (!user?.id || eventQueue.current.length === 0) return;

    const eventsToSend = [...eventQueue.current];
    eventQueue.current = [];

    try {
      for (const event of eventsToSend) {
        await supabase.functions.invoke('analytics-tracker', {
          body: {
            userId: user.id,
            eventName: event.eventName,
            eventProperties: event.properties,
            sessionId: sessionId.current
          }
        });
      }
    } catch (error) {
      console.error('Error flushing analytics events:', error);
      // Re-add failed events back to queue
      eventQueue.current.unshift(...eventsToSend);
    }
  }, [user?.id]);

  // Track page views automatically
  useEffect(() => {
    if (!user?.id) return;

    track('page_view', {
      path: window.location.pathname,
      search: window.location.search,
      hash: window.location.hash
    });
  }, [user?.id, track]);

  // Track session start
  useEffect(() => {
    if (!user?.id) return;

    track('session_start', {
      sessionId: sessionId.current
    });

    // Track session end on beforeunload
    const handleBeforeUnload = () => {
      track('session_end', {
        sessionId: sessionId.current,
        duration: Date.now() - performance.timeOrigin
      });
      flushEvents();
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      handleBeforeUnload();
    };
  }, [user?.id, track, flushEvents]);

  // Predefined tracking functions for common events
  const trackWidgetAction = useCallback((widgetType: string, action: string, properties?: Record<string, any>) => {
    track('widget_action', {
      widgetType,
      action,
      ...properties
    });
  }, [track]);

  const trackTabSwitch = useCallback((fromTab: string, toTab: string) => {
    track('tab_switch', {
      fromTab,
      toTab
    });
  }, [track]);

  const trackPerformance = useCallback((metric: string, value: number, properties?: Record<string, any>) => {
    track('performance_metric', {
      metric,
      value,
      ...properties
    });
  }, [track]);

  const trackError = useCallback((error: Error, context?: string) => {
    track('error', {
      message: error.message,
      stack: error.stack,
      context
    });
  }, [track]);

  return {
    track,
    trackWidgetAction,
    trackTabSwitch,
    trackPerformance,
    trackError,
    flushEvents
  };
}