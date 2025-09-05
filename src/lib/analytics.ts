// Analytics service for tracking performance and user behavior

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
    dataLayer?: any[];
  }
}

interface AnalyticsConfig {
  measurementId?: string;
  enabled?: boolean;
  debug?: boolean;
  anonymizeIp?: boolean;
  cookieFlags?: string;
}

interface CustomEvent {
  action: string;
  category?: string;
  label?: string;
  value?: number;
  parameters?: Record<string, any>;
}

interface TimingEvent {
  name: string;
  value: number;
  category?: string;
  label?: string;
}

class AnalyticsManager {
  private initialized = false;
  private config: AnalyticsConfig = {
    enabled: import.meta.env.PROD,
    debug: import.meta.env.DEV,
    anonymizeIp: true,
    cookieFlags: 'SameSite=Strict;Secure',
  };
  private userId: string | null = null;
  private sessionId: string;
  private pageViewStart: number = 0;

  constructor() {
    this.sessionId = this.generateSessionId();
  }

  async initialize(config?: AnalyticsConfig) {
    this.config = { ...this.config, ...config };
    
    const measurementId = config?.measurementId || import.meta.env.VITE_GA_MEASUREMENT_ID;
    
    if (!this.config.enabled || !measurementId || this.initialized) {
      return;
    }

    try {
      // Load Google Analytics script
      const script = document.createElement('script');
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
      document.head.appendChild(script);

      await new Promise((resolve, reject) => {
        script.onload = resolve;
        script.onerror = reject;
      });

      // Initialize gtag
      window.dataLayer = window.dataLayer || [];
      window.gtag = function() {
        window.dataLayer!.push(arguments);
      };

      window.gtag('js', new Date());
      window.gtag('config', measurementId, {
        anonymize_ip: this.config.anonymizeIp,
        cookie_flags: this.config.cookieFlags,
        custom_map: {
          dimension1: 'user_type',
          dimension2: 'session_id',
          dimension3: 'app_version',
        },
      });

      // Set custom dimensions
      this.setCustomDimensions();

      // Track Web Vitals
      this.trackWebVitals();

      this.initialized = true;
      console.info('Analytics initialized successfully');
    } catch (error) {
      console.error('Failed to initialize Analytics:', error);
    }
  }

  private generateSessionId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private setCustomDimensions() {
    if (!window.gtag) return;

    window.gtag('set', {
      user_type: this.userId ? 'registered' : 'anonymous',
      session_id: this.sessionId,
      app_version: import.meta.env.VITE_APP_VERSION || 'unknown',
    });
  }

  // Track page views
  trackPageView(path?: string, title?: string) {
    if (!this.initialized || !window.gtag) return;

    // Track time spent on previous page
    if (this.pageViewStart > 0) {
      const timeSpent = Date.now() - this.pageViewStart;
      this.trackTiming({
        name: 'page_view_duration',
        value: timeSpent,
        category: 'engagement',
      });
    }

    this.pageViewStart = Date.now();

    window.gtag('event', 'page_view', {
      page_path: path || window.location.pathname,
      page_title: title || document.title,
      page_location: window.location.href,
    });
  }

  // Track custom events
  trackEvent(event: CustomEvent) {
    if (!this.initialized || !window.gtag) return;

    window.gtag('event', event.action, {
      event_category: event.category || 'general',
      event_label: event.label,
      value: event.value,
      ...event.parameters,
    });
  }

  // Track user interactions
  trackInteraction(element: string, action: string, value?: number) {
    this.trackEvent({
      action: 'interaction',
      category: 'user_engagement',
      label: `${element}_${action}`,
      value,
    });
  }

  // Track timing events
  trackTiming(timing: TimingEvent) {
    if (!this.initialized || !window.gtag) return;

    window.gtag('event', 'timing_complete', {
      name: timing.name,
      value: Math.round(timing.value),
      event_category: timing.category || 'performance',
      event_label: timing.label,
    });
  }

  // Track errors
  trackError(error: Error | string, fatal: boolean = false) {
    if (!this.initialized || !window.gtag) return;

    const errorMessage = typeof error === 'string' ? error : error.message;
    const errorStack = typeof error === 'object' ? error.stack : undefined;

    window.gtag('event', 'exception', {
      description: errorMessage,
      fatal,
      error_stack: errorStack,
    });
  }

  // Track Web Vitals
  private trackWebVitals() {
    if (!this.initialized || !window.gtag) return;

    // Use the Performance Observer API to track Web Vitals
    if ('PerformanceObserver' in window) {
      // Track Largest Contentful Paint
      try {
        const lcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];
          this.trackTiming({
            name: 'LCP',
            value: lastEntry.startTime,
            category: 'Web Vitals',
          });
        });
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
      } catch (e) {
        // LCP not supported
      }

      // Track First Input Delay
      try {
        const fidObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry: any) => {
            if (entry.name === 'first-input') {
              this.trackTiming({
                name: 'FID',
                value: entry.processingStart - entry.startTime,
                category: 'Web Vitals',
              });
            }
          });
        });
        fidObserver.observe({ entryTypes: ['first-input'] });
      } catch (e) {
        // FID not supported
      }

      // Track Cumulative Layout Shift
      let clsValue = 0;
      try {
        const clsObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (!(entry as any).hadRecentInput) {
              clsValue += (entry as any).value;
            }
          }
        });
        clsObserver.observe({ entryTypes: ['layout-shift'] });
        
        // Report CLS when page is hidden
        document.addEventListener('visibilitychange', () => {
          if (document.hidden) {
            this.trackTiming({
              name: 'CLS',
              value: clsValue * 1000, // Convert to milliseconds
              category: 'Web Vitals',
            });
          }
        });
      } catch (e) {
        // CLS not supported
      }
    }

    // Track First Contentful Paint
    if (performance.getEntriesByType) {
      const paintEntries = performance.getEntriesByType('paint');
      paintEntries.forEach((entry) => {
        if (entry.name === 'first-contentful-paint') {
          this.trackTiming({
            name: 'FCP',
            value: entry.startTime,
            category: 'Web Vitals',
          });
        }
      });
    }
  }

  // Set user ID for tracking
  setUserId(userId: string | null) {
    this.userId = userId;
    
    if (!this.initialized || !window.gtag) return;

    if (userId) {
      window.gtag('set', { user_id: userId });
    }
    
    this.setCustomDimensions();
  }

  // Track user properties
  setUserProperties(properties: Record<string, any>) {
    if (!this.initialized || !window.gtag) return;

    window.gtag('set', { user_properties: properties });
  }

  // Track conversions
  trackConversion(conversionId: string, value?: number, currency?: string) {
    if (!this.initialized || !window.gtag) return;

    window.gtag('event', 'conversion', {
      send_to: conversionId,
      value,
      currency: currency || 'USD',
    });
  }

  // Track e-commerce events
  trackPurchase(transactionData: {
    transactionId: string;
    value: number;
    currency?: string;
    items?: Array<{
      id: string;
      name: string;
      category?: string;
      quantity?: number;
      price?: number;
    }>;
  }) {
    if (!this.initialized || !window.gtag) return;

    window.gtag('event', 'purchase', {
      transaction_id: transactionData.transactionId,
      value: transactionData.value,
      currency: transactionData.currency || 'USD',
      items: transactionData.items,
    });
  }

  // Track search
  trackSearch(searchTerm: string, resultsCount?: number) {
    this.trackEvent({
      action: 'search',
      category: 'engagement',
      label: searchTerm,
      value: resultsCount,
    });
  }

  // Track social interactions
  trackSocial(network: string, action: string, target?: string) {
    this.trackEvent({
      action: 'social',
      category: 'social',
      label: network,
      parameters: {
        social_network: network,
        social_action: action,
        social_target: target,
      },
    });
  }

  // Track file downloads
  trackDownload(fileName: string, fileType?: string) {
    this.trackEvent({
      action: 'file_download',
      category: 'downloads',
      label: fileName,
      parameters: {
        file_name: fileName,
        file_extension: fileType,
      },
    });
  }

  // Track video engagement
  trackVideo(action: 'play' | 'pause' | 'complete', videoTitle: string, currentTime?: number) {
    this.trackEvent({
      action: `video_${action}`,
      category: 'video',
      label: videoTitle,
      value: currentTime,
    });
  }

  // Track scroll depth
  private scrollDepthTracked = new Set<number>();
  
  trackScrollDepth() {
    const depths = [25, 50, 75, 90, 100];
    
    window.addEventListener('scroll', () => {
      const scrollPercentage = (window.scrollY + window.innerHeight) / document.documentElement.scrollHeight * 100;
      
      depths.forEach(depth => {
        if (scrollPercentage >= depth && !this.scrollDepthTracked.has(depth)) {
          this.scrollDepthTracked.add(depth);
          this.trackEvent({
            action: 'scroll',
            category: 'engagement',
            label: `${depth}%`,
            value: depth,
          });
        }
      });
    });
  }

  // Opt out of tracking
  optOut() {
    if (!window.gtag) return;

    window.gtag('consent', 'update', {
      analytics_storage: 'denied',
    });
  }

  // Opt in to tracking
  optIn() {
    if (!window.gtag) return;

    window.gtag('consent', 'update', {
      analytics_storage: 'granted',
    });
  }
}

// Export singleton instance
export const analyticsManager = new AnalyticsManager();

// React hooks for analytics
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export function usePageTracking() {
  const location = useLocation();

  useEffect(() => {
    analyticsManager.trackPageView(location.pathname);
  }, [location]);
}

export function useEventTracking() {
  return analyticsManager.trackEvent.bind(analyticsManager);
}

export function useAnalytics() {
  return {
    trackEvent: analyticsManager.trackEvent.bind(analyticsManager),
    trackTiming: analyticsManager.trackTiming.bind(analyticsManager),
    trackError: analyticsManager.trackError.bind(analyticsManager),
    trackInteraction: analyticsManager.trackInteraction.bind(analyticsManager),
    trackSearch: analyticsManager.trackSearch.bind(analyticsManager),
    setUserId: analyticsManager.setUserId.bind(analyticsManager),
    setUserProperties: analyticsManager.setUserProperties.bind(analyticsManager),
  };
}

// Export for direct use
export default analyticsManager;