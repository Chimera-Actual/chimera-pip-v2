import { ReactNode } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Toaster } from '@/components/ui/toaster';
import { Toaster as Sonner } from '@/components/ui/sonner';
import { AuthProvider } from '@/contexts/AuthContext';
import { ThemeProvider } from '@/contexts/theme';
import { TabManagerProvider } from '@/contexts/TabManagerContext';
import { PerformanceProvider } from '@/features/state-management';
import { queryClient } from '@/lib/queryClient';

export function AppProviders({ children }: { children: ReactNode }) {
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
                  {/* Keep global UI INSIDE ThemeProvider so it can read theme */}
                  <Toaster />
                  <Sonner />
                </BrowserRouter>
              </TabManagerProvider>
            </AuthProvider>
          </PerformanceProvider>
        </ThemeProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}