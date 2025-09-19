import React, { Suspense, lazy } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Routes, Route } from "react-router-dom";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { ErrorBoundary } from "@/components/common/ErrorBoundary";
import { LoadingSuspense } from "@/components/ui/LoadingSuspense";

// Lazy load auth components
const VaultLogin = lazy(() => import("@/components/auth/VaultLogin").then(m => ({ default: m.VaultLogin })));
const VaultRegistration = lazy(() => import("@/components/auth/VaultRegistration").then(m => ({ default: m.VaultRegistration })));
const CharacterCreation = lazy(() => import("@/components/auth/CharacterCreation").then(m => ({ default: m.CharacterCreation })));
const EmailVerification = lazy(() => import("@/components/auth/EmailVerification").then(m => ({ default: m.EmailVerification })));
const AuthMethodSelector = lazy(() => import("@/components/auth/AuthMethodSelector").then(m => ({ default: m.AuthMethodSelector })));

// Lazy load pages
const Landing = lazy(() => import("./pages/Landing").then(m => ({ default: m.Landing })));
const Index = lazy(() => import("./pages/Index"));

const NotFound = lazy(() => import("./pages/NotFound"));

// Providers are now handled in AppProviders

// Fallback component for when app fails to load
const AppErrorFallback = ({ error }: { error?: Error }) => (
  <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white p-4">
    <div className="max-w-md w-full bg-gray-800 rounded-lg p-6 shadow-xl">
      <h1 className="text-2xl font-bold mb-4 text-red-400">Application Error</h1>
      <p className="mb-4 text-gray-300">
        The application failed to load. This might be due to missing configuration or network issues.
      </p>
      {error && (
        <details className="mb-4">
          <summary className="cursor-pointer text-gray-400 hover:text-gray-200">
            Error Details
          </summary>
          <pre className="mt-2 text-xs overflow-auto max-h-40 p-2 bg-gray-900 rounded text-red-300">
            {error.message || error.toString()}
          </pre>
        </details>
      )}
      <button
        onClick={() => window.location.reload()}
        className="w-full py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
      >
        Reload Application
      </button>
    </div>
  </div>
);

// Loading fallback component
const LoadingFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-pip-bg-primary">
    <div className="text-center text-primary">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
      <p className="text-lg font-mono">INITIALIZING PIP-BOY INTERFACE</p>
    </div>
  </div>
);

const App = () => {
  try {
    return (
      <ErrorBoundary onError={(error, errorInfo) => {
        console.error('App Error Boundary:', error, errorInfo);
      }}>
        <div className="min-h-screen bg-background font-mono antialiased">
          <LoadingSuspense fallback={<LoadingFallback />} useBootSequence>
            <Routes>
              {/* Public Landing Page */}
              <Route path="/welcome" element={<Landing />} />
              
              {/* Authentication Routes */}
              <Route path="/auth" element={<AuthMethodSelector />} />
              <Route path="/auth/login" element={<VaultLogin />} />
              <Route path="/auth/register" element={<VaultRegistration />} />
              <Route path="/auth/verify" element={<EmailVerification />} />
              <Route 
                path="/auth/character" 
                element={
                  <ProtectedRoute>
                    <CharacterCreation />
                  </ProtectedRoute>
                } 
              />
              
              {/* Protected Dashboard Route */}
              <Route 
                path="/" 
                element={
                  <ProtectedRoute requiresCharacter={true}>
                    <ErrorBoundary>
                      <Index />
                    </ErrorBoundary>
                  </ProtectedRoute>
                } 
              />
              
              {/* Catch-all route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </LoadingSuspense>
          
          {/* Toast notifications */}
          <Toaster />
          <Sonner />
        </div>
      </ErrorBoundary>
    );
  } catch (error) {
    console.error('App initialization error:', error);
    return <AppErrorFallback error={error as Error} />;
  }
};

export default App;