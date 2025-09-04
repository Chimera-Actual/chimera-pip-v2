import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HelmetProvider } from 'react-helmet-async'
import { validateEnvironment } from './lib/envValidation'
import { reportError } from './lib/errorReporting'
import App from './App.tsx'
import './index.css'

// Validate environment before starting the app
try {
  validateEnvironment();
} catch (error) {
  reportError('Environment validation failed', { 
    component: 'main',
    stage: 'startup'
  }, error);
  
  // Show user-friendly error in production
  if (import.meta.env?.MODE === 'production') {
    document.body.innerHTML = `
      <div style="padding: 2rem; text-align: center; font-family: monospace; color: #ff4444;">
        <h1>🚨 Configuration Error</h1>
        <p>The application is not properly configured. Please contact support.</p>
        <details style="margin-top: 1rem; text-align: left;">
          <summary>Technical Details</summary>
          <pre style="background: #f5f5f5; padding: 1rem; margin-top: 1rem;">${error}</pre>
        </details>
      </div>
    `;
    throw error;
  }
}

const rootElement = document.getElementById("root");

if (!rootElement) {
  const error = new Error("Root element not found - index.html may be corrupted");
  reportError('Critical startup error', { component: 'main' }, error);
  throw error;
}

createRoot(rootElement).render(
  <StrictMode>
    <HelmetProvider>
      <App />
    </HelmetProvider>
  </StrictMode>
);
