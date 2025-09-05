// Service Worker registration and management

export interface ServiceWorkerConfig {
  enabled: boolean;
  scope?: string;
  updateInterval?: number;
  onUpdate?: (registration: ServiceWorkerRegistration) => void;
  onSuccess?: (registration: ServiceWorkerRegistration) => void;
  onError?: (error: Error) => void;
}

class ServiceWorkerManager {
  private registration: ServiceWorkerRegistration | null = null;
  private updateInterval: number | null = null;
  private config: ServiceWorkerConfig = {
    enabled: import.meta.env.PROD, // Only enable in production by default
    updateInterval: 60 * 60 * 1000, // Check for updates every hour
  };

  async register(config?: Partial<ServiceWorkerConfig>) {
    this.config = { ...this.config, ...config };

    if (!this.config.enabled || !('serviceWorker' in navigator)) {
      return;
    }

    try {
      // Choose the appropriate service worker file
      const swFile = import.meta.env.PROD ? '/sw-enhanced.js' : '/sw.js';
      
      this.registration = await navigator.serviceWorker.register(swFile, {
        scope: this.config.scope || '/',
      });

      // Check for updates periodically
      if (this.config.updateInterval && this.config.updateInterval > 0) {
        this.updateInterval = window.setInterval(() => {
          this.registration?.update();
        }, this.config.updateInterval);
      }

      // Handle service worker lifecycle events
      this.registration.addEventListener('updatefound', () => {
        const newWorker = this.registration!.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // New service worker is ready to activate
              this.config.onUpdate?.(this.registration!);
              this.showUpdatePrompt();
            }
          });
        }
      });

      // Handle successful registration
      if (this.registration.active) {
        this.config.onSuccess?.(this.registration);
        this.initializeServiceWorkerFeatures();
      }

      // Listen for messages from service worker
      navigator.serviceWorker.addEventListener('message', this.handleServiceWorkerMessage);

    } catch (error) {
      console.error('Service Worker registration failed:', error);
      this.config.onError?.(error as Error);
    }
  }

  private showUpdatePrompt() {
    // Create a custom update prompt
    const shouldUpdate = window.confirm(
      'A new version of the app is available. Would you like to update now?'
    );

    if (shouldUpdate) {
      this.skipWaiting();
    }
  }

  async skipWaiting() {
    if (!this.registration?.waiting) return;

    // Tell the service worker to skip waiting and activate
    this.registration.waiting.postMessage({ type: 'SKIP_WAITING' });

    // Reload the page once the new service worker is active
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      window.location.reload();
    });
  }

  private initializeServiceWorkerFeatures() {
    // Enable periodic background sync
    this.requestBackgroundSync();
    
    // Enable push notifications
    this.requestPushNotifications();
    
    // Start cache cleanup schedule
    this.scheduleCacheCleanup();
  }

  private async requestBackgroundSync() {
    if ('sync' in ServiceWorkerRegistration.prototype && this.registration) {
      try {
        await (this.registration as any).sync.register('sync-offline-actions');
      } catch (error) {
        console.warn('Background sync registration failed:', error);
      }
    }
  }

  private async requestPushNotifications() {
    if ('PushManager' in window && this.registration) {
      try {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
          // Subscribe to push notifications
          const subscription = await this.registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: this.urlBase64ToUint8Array(
              import.meta.env.VITE_VAPID_PUBLIC_KEY || ''
            ),
          });

          // Send subscription to server
          await this.sendSubscriptionToServer(subscription);
        }
      } catch (error) {
        console.warn('Push notification subscription failed:', error);
      }
    }
  }

  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  private async sendSubscriptionToServer(subscription: PushSubscription) {
    // Send the subscription to your server
    try {
      await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(subscription),
      });
    } catch (error) {
      console.warn('Failed to send push subscription to server:', error);
    }
  }

  private scheduleCacheCleanup() {
    // Schedule cache cleanup every 24 hours
    window.setInterval(() => {
      if (navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({
          type: 'CLEANUP_CACHES',
        });
      }
    }, 24 * 60 * 60 * 1000);
  }

  private handleServiceWorkerMessage = (event: MessageEvent) => {
    const { type, ...data } = event.data;

    switch (type) {
      case 'SLOW_REQUEST':
        // Log slow requests for monitoring
        console.warn('Slow request detected:', data.url, `${data.duration}ms`);
        break;

      case 'CACHE_UPDATED':
        // Notify user that content has been cached
        console.info('Content cached for offline use');
        break;

      case 'OFFLINE_ACTION_SYNCED':
        // Notify user that offline actions have been synced
        console.info('Offline actions synced successfully');
        break;

      default:
        break;
    }
  };

  async unregister() {
    if (!this.registration) return;

    try {
      // Clear update interval
      if (this.updateInterval) {
        window.clearInterval(this.updateInterval);
        this.updateInterval = null;
      }

      // Unregister service worker
      const success = await this.registration.unregister();
      if (success) {
        this.registration = null;
        console.info('Service Worker unregistered');
      }
    } catch (error) {
      console.error('Service Worker unregistration failed:', error);
    }
  }

  getRegistration(): ServiceWorkerRegistration | null {
    return this.registration;
  }

  async checkForUpdates() {
    if (this.registration) {
      await this.registration.update();
    }
  }
}

// Export singleton instance
export const serviceWorkerManager = new ServiceWorkerManager();

// Export for direct use
export default serviceWorkerManager;