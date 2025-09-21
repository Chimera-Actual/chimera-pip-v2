import { ReactNode } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from '@/contexts/AuthContext';
import { ThemeProvider } from '@/contexts/theme';
import { TabManagerProvider } from '@/contexts/TabManagerContext';
import { PerformanceProvider } from '@/features/state-management';
import { queryClient } from '@/lib/queryClient';

export function AppProviders({ children }: { children: ReactNode }) {
  console.log("🔧 AppProviders: Initializing providers");
  
  try {
    console.log("🔧 AppProviders: Creating provider tree...");
    return (
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          {/* Provider order: Theme → Performance → Auth → TabManager */}
          <ThemeProvider>
            <PerformanceProvider enableByDefault={import.meta.env.DEV}>
              <AuthProvider>
                <TabManagerProvider>
                  <BrowserRouter>
                    {children}
                    {/* Unified toast system using shadcn-ui toasts */}
                    <Toaster />
                  </BrowserRouter>
                </TabManagerProvider>
              </AuthProvider>
            </PerformanceProvider>
          </ThemeProvider>
        </TooltipProvider>
      </QueryClientProvider>
    );
  } catch (error) {
    console.error("❌ AppProviders error:", error);
    throw error;
  }
}