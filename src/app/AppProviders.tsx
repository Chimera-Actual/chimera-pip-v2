import { ReactNode } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { TooltipProvider } from '@/components/ui/tooltip';
import { AuthProvider } from '@/contexts/AuthContext';
import { ThemeProvider } from '@/components/enhanced/ThemeProvider';
import { TabManagerProvider } from '@/contexts/TabManagerContext';
import { PerformanceProvider } from '@/features/state-management';
import { queryClient } from '@/lib/queryClient';

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        {/* IMPORTANT: AuthProvider MUST wrap any consumer of useAuth */}
        <AuthProvider>
          <ThemeProvider>
            <TabManagerProvider>
              <PerformanceProvider enableByDefault={import.meta.env.DEV}>
                <BrowserRouter>{children}</BrowserRouter>
              </PerformanceProvider>
            </TabManagerProvider>
          </ThemeProvider>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}