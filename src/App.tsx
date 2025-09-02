import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { VaultLogin } from "@/components/auth/VaultLogin";
import { VaultRegistration } from "@/components/auth/VaultRegistration";
import { CharacterCreation } from "@/components/auth/CharacterCreation";
import { EmailVerification } from "@/components/auth/EmailVerification";
import { Landing } from "./pages/Landing";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
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
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;