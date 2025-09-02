import React, { Suspense } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { WidgetProvider } from "@/contexts/WidgetContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { VaultLogin } from "@/components/auth/VaultLogin";
import { VaultRegistration } from "@/components/auth/VaultRegistration";
import { CharacterCreation } from "@/components/auth/CharacterCreation";
import { EmailVerification } from "@/components/auth/EmailVerification";
import { Landing } from "./pages/Landing";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import ErrorBoundary from "@/components/common/ErrorBoundary";
import LoadingSpinner from "@/components/common/LoadingSpinner";

const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <WidgetProvider>
            <ErrorBoundary>
              <BrowserRouter>
                <div className="min-h-screen bg-background font-sans antialiased">
                  <Suspense fallback={
                    <div className="min-h-screen flex items-center justify-center bg-pip-bg-primary">
                      <LoadingSpinner size="lg" text="INITIALIZING PIP-BOY INTERFACE" />
                    </div>
                  }>
                    <Routes>
                      {/* Public Landing Page */}
                      <Route path="/welcome" element={<Landing />} />
                      
                      {/* Authentication Routes */}
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
          </WidgetProvider>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;