import React, { Suspense, lazy } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { WidgetProvider } from "@/contexts/WidgetContext";
import { CanvasProvider } from "@/contexts/CanvasContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { PerformanceProvider, OptimizedWidgetProvider } from "@/features/state-management";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import ErrorBoundary from "@/components/common/ErrorBoundary";
import LoadingSpinner from "@/components/common/LoadingSpinner";

// Lazy load auth components
const VaultLogin = lazy(() => import("@/components/auth/VaultLogin").then(m => ({ default: m.VaultLogin })));
const VaultRegistration = lazy(() => import("@/components/auth/VaultRegistration").then(m => ({ default: m.VaultRegistration })));
const CharacterCreation = lazy(() => import("@/components/auth/CharacterCreation").then(m => ({ default: m.CharacterCreation })));
const EmailVerification = lazy(() => import("@/components/auth/EmailVerification").then(m => ({ default: m.EmailVerification })));
const AuthMethodSelector = lazy(() => import("@/components/auth/AuthMethodSelector").then(m => ({ default: m.AuthMethodSelector })));
const PinLogin = lazy(() => import("@/components/auth/PinLogin").then(m => ({ default: m.PinLogin })));
const PatternLogin = lazy(() => import("@/components/auth/PatternLogin").then(m => ({ default: m.PatternLogin })));
const BiometricLogin = lazy(() => import("@/components/auth/BiometricLogin").then(m => ({ default: m.BiometricLogin })));

// Lazy load pages
const Landing = lazy(() => import("./pages/Landing").then(m => ({ default: m.Landing })));
const Index = lazy(() => import("./pages/Index"));
const WidgetDemo = lazy(() => import("./pages/WidgetDemo"));
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <ThemeProvider>
          <AuthProvider>
            <WidgetProvider>
              <CanvasProvider>
                <OptimizedWidgetProvider>
                  <PerformanceProvider enableByDefault={import.meta.env.DEV}>
                  <ErrorBoundary>
                <BrowserRouter>
                  <div className="min-h-screen bg-background font-pip-mono antialiased">
                    <Suspense fallback={
                      <div className="min-h-screen flex items-center justify-center bg-pip-bg-primary">
                        <LoadingSpinner size="lg" text="INITIALIZING PIP-BOY INTERFACE" />
                      </div>
                    }>
                      <Routes>
                        {/* Public Landing Page */}
                        <Route path="/welcome" element={<Landing />} />
                        
                        {/* Demo Page - Public */}
                        <Route path="/demo" element={<WidgetDemo />} />
                        
                        {/* Authentication Routes */}
                        <Route path="/auth" element={<AuthMethodSelector />} />
                        <Route path="/auth/login" element={<VaultLogin />} />
                        <Route path="/auth/pin" element={<PinLogin />} />
                        <Route path="/auth/pattern" element={<PatternLogin />} />
                        <Route path="/auth/biometric" element={<BiometricLogin />} />
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
                              <Index />
                            </ProtectedRoute>
                          } 
                        />
                        
                        {/* Catch-all route */}
                        <Route path="*" element={<NotFound />} />
                      </Routes>
                    </Suspense>
                    
                    {/* Toast notifications */}
                    <Toaster />
                    <Sonner />
                  </div>
                </BrowserRouter>
                  </ErrorBoundary>
                </PerformanceProvider>
              </OptimizedWidgetProvider>
              </CanvasProvider>
            </WidgetProvider>
          </AuthProvider>
        </ThemeProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;