// Service Worker registration with preview domain guards
const isDev = import.meta.env.DEV;
const isLovablePreview =
  typeof location !== 'undefined' &&
  (/\.lovableproject\.com$/i.test(location.hostname) || 
   /\.lovable\.app$/i.test(location.hostname));

export async function registerAppSW() {
  if (isDev || isLovablePreview) {
    // Never register a service worker in dev or lovable preview
    // to avoid stale cache mismatches for hashed chunks.
    console.info('Service Worker registration skipped (dev/preview environment)');
    return;
  }

  if (!('serviceWorker' in navigator)) {
    console.warn('Service Worker not supported in this browser');
    return;
  }

  try {
    // Dynamically import the service worker manager
    const { serviceWorkerManager } = await import('@/lib/serviceWorker');
    
    await serviceWorkerManager.register({
      enabled: true,
      onUpdate: () => {
        // Use browser notification for service worker updates
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification('Chimera PIP-Boy Update Available', {
            body: 'Click to update to the latest version',
            icon: '/chimera-tec-logo.png',
            tag: 'app-update'
          }).onclick = () => {
            serviceWorkerManager.skipWaiting();
          };
        } else {
          // Fallback to console log if notifications aren't available
          console.info('New app version available! Refresh to update.');
        }
      },
      onSuccess: () => {
        console.info('Service Worker registered successfully');
      },
      onError: (error: Error) => {
        console.error('Service Worker registration failed:', error);
      }
    });
  } catch (error) {
    console.warn('Service Worker registration failed:', error);
  }
}