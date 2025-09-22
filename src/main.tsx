import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import App from './App.tsx'
import './index.css'
import { AppProviders } from '@/app/AppProviders'
import { setupSessionListener } from '@/lib/auth/session'
import { BootErrorBoundary } from '@/components/system/BootErrorBoundary'

const CHUNK_RELOAD_STORAGE_KEY = 'chimera:chunk-reload'

function setupChunkReloadGuard() {
  if (typeof window === 'undefined' || !import.meta.env.PROD) {
    return
  }

  let storage: Storage | undefined
  try {
    storage = window.sessionStorage
  } catch (error) {
    console.warn('Chunk reload guard: sessionStorage unavailable', error)
  }

  const clearReloadFlag = () => {
    try {
      storage?.removeItem(CHUNK_RELOAD_STORAGE_KEY)
    } catch (error) {
      console.warn('Chunk reload guard: unable to clear flag', error)
    }
  }

  // If we reloaded previously due to a chunk error, clear the flag on successful boot.
  clearReloadFlag()

  window.addEventListener('vite:preloadError', (event) => {
    const alreadyReloaded = (() => {
      try {
        return storage?.getItem(CHUNK_RELOAD_STORAGE_KEY) === 'true'
      } catch (error) {
        console.warn('Chunk reload guard: unable to read flag', error)
        return false
      }
    })()

    const customEvent = event as CustomEvent<{ href?: string; message?: string }>
    console.warn('Chunk preload error detected, refreshing application once.', customEvent.detail)

    if (!alreadyReloaded) {
      if (typeof (event as any).preventDefault === 'function') {
        (event as any).preventDefault()
      }

      try {
        storage?.setItem(CHUNK_RELOAD_STORAGE_KEY, 'true')
      } catch (error) {
        console.warn('Chunk reload guard: unable to persist flag', error)
      }

      window.location.reload()
      return
    }

    clearReloadFlag()
    console.error('Chunk preload error persisted after forced reload.', customEvent.detail)
  })
}

setupChunkReloadGuard()

// Load performance monitoring in development
if (import.meta.env.DEV) {
  import('./lib/wdyr.ts');
}

const rootElement = document.getElementById("root");

console.log("🔍 Debug: Root element found:", !!rootElement);

if (!rootElement) {
  console.error("❌ Root element not found");
  throw new Error("Root element not found");
}

console.log("🚀 Starting app initialization");

// Setup session monitoring
setupSessionListener();

console.log("📡 Session listener setup complete");

// Render the app with properly ordered providers
console.log("🎨 Rendering app with providers");
createRoot(rootElement).render(
  <StrictMode>
    <BootErrorBoundary>
      <AppProviders>
        <App />
        {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
      </AppProviders>
    </BootErrorBoundary>
  </StrictMode>
);

console.log("✅ App render initiated");

// Load optional modules after app renders
if (import.meta.env.PROD) {
  // Dynamically load production-only modules
  Promise.all([
    import('react-helmet-async').catch(() => null),
    import('./lib/sentry').catch(() => null),
    import('./lib/analytics').catch(() => null)
  ]).then(([helmetModule, sentryModule, analyticsModule]) => {
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
  }).catch(console.warn);
}

// Register Service Worker with preview domain guards
if (import.meta.env.PROD) {
  import('./registerSW').then(({ registerAppSW }) => {
    registerAppSW().catch(console.warn);
  });
}