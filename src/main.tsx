import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HelmetProvider } from 'react-helmet-async'
import App from './App.tsx'
import './index.css'
import serviceWorkerManager from './lib/serviceWorker'
import sentryManager from './lib/sentry'
import analyticsManager from './lib/analytics'
import { toast } from 'sonner'

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Root element not found");
}

// Initialize Sentry for error tracking
sentryManager.initialize({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  environment: import.meta.env.MODE,
  enabled: import.meta.env.PROD,
  tracesSampleRate: import.meta.env.PROD ? 0.1 : 1.0,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
});

// Initialize Analytics for performance metrics
analyticsManager.initialize({
  measurementId: import.meta.env.VITE_GA_MEASUREMENT_ID,
  enabled: import.meta.env.PROD,
  debug: import.meta.env.DEV,
  anonymizeIp: true,
});

// Register service worker
serviceWorkerManager.register({
  enabled: import.meta.env.PROD, // Only in production
  onUpdate: () => {
    toast('New version available!', {
      description: 'Click to update to the latest version',
      action: {
        label: 'Update',
        onClick: () => serviceWorkerManager.skipWaiting()
      },
      duration: Infinity,
    });
  },
  onSuccess: () => {
    if (import.meta.env.PROD) {
      console.info('Service Worker registered successfully');
    }
  },
  onError: (error) => {
    console.error('Service Worker registration failed:', error);
    sentryManager.captureError(error);
  }
});

createRoot(rootElement).render(
  <StrictMode>
    <HelmetProvider>
      <App />
    </HelmetProvider>
  </StrictMode>
);
