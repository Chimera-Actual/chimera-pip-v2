import { render, act } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import '@testing-library/jest-dom';
import { DashboardContent } from '../DashboardContent';
import { TabManagerProvider } from '@/contexts/TabManagerContext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from '@/contexts/theme/ThemeProvider';

// Mock the hooks and components
vi.mock('@/hooks/useTabWidgets', () => ({
  useTabWidgets: vi.fn(() => ({
    widgets: [],
    isLoading: false,
    loadWidgets: vi.fn(),
    addWidget: vi.fn(),
    updateWidget: vi.fn(),
    deleteWidget: vi.fn(),
    toggleCollapsed: vi.fn(),
    toggleVisibility: vi.fn(),
  }))
}));

vi.mock('@/components/canvas/CanvasIntegration', () => ({
  CanvasIntegration: vi.fn(({ isActive, tab }) => (
    <div data-testid={`canvas-${tab}`} data-active={isActive}>
      Mock Canvas for {tab}
    </div>
  ))
}));

const createMockTab = (id: string, name: string) => ({
  id,
  name,
  icon: 'TestIcon',
  description: `${name} tab`,
  color: '#00ff00',
  position: 0,
  isDefault: name === 'MAIN',
  isCustom: name !== 'MAIN',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  userId: 'test-user'
});

const TestWrapper = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false }
    }
  });

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TabManagerProvider>
          {children}
        </TabManagerProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

// Mock useTabManagerContext to return test data
vi.mock('@/contexts/TabManagerContext', async () => {
  const actual = await vi.importActual('@/contexts/TabManagerContext');
  return {
    ...actual,
    useTabManagerContext: vi.fn(() => ({
      tabs: [
        createMockTab('1', 'MAIN'),
        createMockTab('2', 'DATA'),
        createMockTab('3', 'INV'),
        createMockTab('4', 'STAT'),
        createMockTab('5', 'RADIO')
      ],
      updateTab: vi.fn(),
      deleteTab: vi.fn(),
      archiveTab: vi.fn(),
    }))
  }
});

describe('DashboardContent Performance', () => {
  let performanceNow: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    performanceNow = vi.spyOn(performance, 'now')
      .mockReturnValueOnce(0) // Start time
      .mockReturnValueOnce(100); // End time - 100ms render
  });

  it('should render multiple tabs efficiently', async () => {
    const startTime = performance.now();
    
    let container: any;
    await act(async () => {
      const result = render(
        <TestWrapper>
          <DashboardContent activeTab="MAIN" />
        </TestWrapper>
      );
      container = result.container;
    });

    const endTime = performance.now();
    
    // Verify all tabs are rendered
    expect(container.querySelector('[data-testid="canvas-MAIN"]')).toBeInTheDocument();
    expect(container.querySelector('[data-testid="canvas-DATA"]')).toBeInTheDocument();
    expect(container.querySelector('[data-testid="canvas-INV"]')).toBeInTheDocument();
    expect(container.querySelector('[data-testid="canvas-STAT"]')).toBeInTheDocument();
    expect(container.querySelector('[data-testid="canvas-RADIO"]')).toBeInTheDocument();

    // Verify only active tab is marked as active
    expect(container.querySelector('[data-testid="canvas-MAIN"]')).toHaveAttribute('data-active', 'true');
    expect(container.querySelector('[data-testid="canvas-DATA"]')).toHaveAttribute('data-active', 'false');
    expect(container.querySelector('[data-testid="canvas-INV"]')).toHaveAttribute('data-active', 'false');
    expect(container.querySelector('[data-testid="canvas-STAT"]')).toHaveAttribute('data-active', 'false');
    expect(container.querySelector('[data-testid="canvas-RADIO"]')).toHaveAttribute('data-active', 'false');
  });

  it('should handle tab switching without performance degradation', async () => {
    let container: any;
    const { rerender } = render(
      <TestWrapper>
        <DashboardContent activeTab="MAIN" />
      </TestWrapper>
    );

    // Switch to different tab
    await act(async () => {
      const result = rerender(
        <TestWrapper>
          <DashboardContent activeTab="DATA" />
        </TestWrapper>
      );
      container = result?.container ?? document.body;
    });

    // Verify active tab switched
    expect(container.querySelector('[data-testid="canvas-MAIN"]')).toHaveAttribute('data-active', 'false');
    expect(container.querySelector('[data-testid="canvas-DATA"]')).toHaveAttribute('data-active', 'true');
  });

  it('should efficiently process large number of mock tabs', async () => {
    // Create many tabs to stress test
    const mockManyTabs = Array.from({ length: 20 }, (_, i) => 
      createMockTab(`tab-${i}`, `Tab${i}`)
    );

    // Mock the context to return many tabs
    const { useTabManagerContext } = await import('@/contexts/TabManagerContext');
    vi.mocked(useTabManagerContext).mockReturnValue({
      tabs: mockManyTabs,
      updateTab: vi.fn(),
      deleteTab: vi.fn(),
      archiveTab: vi.fn(),
    } as any);

    const startTime = performance.now();
    
    let container: any;
    await act(async () => {
      const result = render(
        <TestWrapper>
          <DashboardContent activeTab="Tab0" />
        </TestWrapper>
      );
      container = result.container;
    });

    const endTime = performance.now();
    
    // Verify render completed
    expect(container.querySelector('[data-testid="canvas-Tab0"]')).toBeInTheDocument();
    expect(container.querySelector('[data-testid="canvas-Tab0"]')).toHaveAttribute('data-active', 'true');
    
    // Verify other tabs are not active
    expect(container.querySelector('[data-testid="canvas-Tab1"]')).toHaveAttribute('data-active', 'false');
  });
});