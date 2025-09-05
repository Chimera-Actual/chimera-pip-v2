import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Root element not found");
}

// Render the app immediately
createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>
);

// Load optional modules after app renders
if (import.meta.env.PROD) {
  // Dynamically load production-only modules
  Promise.all([
    import('react-helmet-async').catch(() => null),
    import('./lib/serviceWorker').catch(() => null),
    import('./lib/sentry').catch(() => null),
    import('./lib/analytics').catch(() => null),
    import('sonner').catch(() => null)
  ]).then(([helmetModule, swModule, sentryModule, analyticsModule, sonnerModule]) => {
    // Initialize Sentry if available
    if (sentryModule?.default) {
      try {
        sentryModule.default.initialize({
          dsn: import.meta.env.VITE_SENTRY_DSN,
          environment: import.meta.env.MODE,
          enabled: true,
          tracesSampleRate: 0.1,
          replaysSessionSampleRate: 0.1,
          replaysOnErrorSampleRate: 1.0,
        });
      } catch (e) {
        console.warn('Sentry initialization failed:', e);
      }
    }

    // Initialize Analytics if available
    if (analyticsModule?.default) {
      try {
        analyticsModule.default.initialize({
          measurementId: import.meta.env.VITE_GA_MEASUREMENT_ID,
          enabled: true,
          debug: false,
          anonymizeIp: true,
        });
      } catch (e) {
        console.warn('Analytics initialization failed:', e);
      }
    }

    // Register Service Worker if available
    if (swModule?.default && sonnerModule?.toast) {
      try {
        swModule.default.register({
          enabled: true,
          onUpdate: () => {
            sonnerModule.toast('New version available!', {
              description: 'Click to update to the latest version',
              action: {
                label: 'Update',
                onClick: () => swModule.default.skipWaiting()
              },
              duration: Infinity,
            });
          },
          onSuccess: () => {
            console.info('Service Worker registered successfully');
          },
          onError: (error: Error) => {
            console.error('Service Worker registration failed:', error);
          }
        });
      } catch (e) {
        console.warn('Service Worker registration failed:', e);
      }
    }
  }).catch(console.warn);
}