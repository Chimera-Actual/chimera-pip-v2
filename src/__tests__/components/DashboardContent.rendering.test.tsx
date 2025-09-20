import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { DashboardContent } from '@/components/PipBoy/DashboardContent';
import * as tabContentModule from '@/components/PipBoy/TabContent';

// Mock TabContent to track rendering
vi.mock('@/components/PipBoy/TabContent', () => ({
  TabContent: vi.fn(({ tab, active }) => {
    if (!active) return null;
    return <div data-testid={`tab-content-${tab.id}`}>Active Tab: {tab.id}</div>;
  })
}));

// Mock tab manager context
vi.mock('@/contexts/TabManagerContext', () => ({
  useTabManager: vi.fn(() => ({
    tabs: [
      { id: 'MAIN', name: 'STAT', assignment: 'MAIN' },
      { id: 'INVENTORY', name: 'INV', assignment: 'INVENTORY' },
      { id: 'DATA', name: 'DATA', assignment: 'DATA' }
    ],
    activeTabId: 'MAIN'
  }))
}));

// Mock other dependencies
vi.mock('@/components/PipBoy/DashboardHeaderSection', () => ({
  DashboardHeaderSection: () => <div data-testid="dashboard-header">Header</div>
}));

vi.mock('@/components/PipBoy/DashboardModals', () => ({
  DashboardModals: () => <div data-testid="dashboard-modals">Modals</div>
}));

vi.mock('@/components/widgets/WidgetSelectorModal', () => ({
  WidgetSelectorModal: () => <div data-testid="widget-selector">Widget Selector</div>
}));

describe('DashboardContent rendering optimization', () => {
  const MockTabContent = tabContentModule.TabContent as any;

  it('should only render active tab content', () => {
    render(<DashboardContent activeTab="MAIN" />);

    // Check that TabContent was called for all tabs but only active one rendered
    expect(MockTabContent).toHaveBeenCalledTimes(3); // All tabs
    
    // Verify only active tab content is in DOM
    expect(screen.getByTestId('tab-content-MAIN')).toBeInTheDocument();
    expect(screen.queryByTestId('tab-content-INVENTORY')).not.toBeInTheDocument();
    expect(screen.queryByTestId('tab-content-DATA')).not.toBeInTheDocument();
  });

  it('should render different content when active tab changes', () => {
    const { rerender } = render(<DashboardContent activeTab="MAIN" />);
    
    expect(screen.getByTestId('tab-content-MAIN')).toBeInTheDocument();
    expect(screen.queryByTestId('tab-content-INVENTORY')).not.toBeInTheDocument();
    
    rerender(<DashboardContent activeTab="INVENTORY" />);
    
    expect(screen.queryByTestId('tab-content-MAIN')).not.toBeInTheDocument();
    expect(screen.getByTestId('tab-content-INVENTORY')).toBeInTheDocument();
  });

  it('should pass correct active prop to TabContent components', () => {
    render(<DashboardContent activeTab="INVENTORY" />);

    // Verify the calls to TabContent with correct active props
    const calls = MockTabContent.mock.calls;
    
    expect(calls[0][0]).toMatchObject({ tab: expect.objectContaining({ id: 'MAIN' }), active: false });
    expect(calls[1][0]).toMatchObject({ tab: expect.objectContaining({ id: 'INVENTORY' }), active: true });
    expect(calls[2][0]).toMatchObject({ tab: expect.objectContaining({ id: 'DATA' }), active: false });
  });

  it('should not cause hook rule violations', () => {
    // This test verifies no console errors are generated from hook usage
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    const consoleWarn = vi.spyOn(console, 'warn').mockImplementation(() => {});

    render(<DashboardContent activeTab="MAIN" />);

    expect(consoleError).not.toHaveBeenCalledWith(
      expect.stringMatching(/Rules of Hooks|rendered more hooks|hook.*called conditionally/)
    );
    expect(consoleWarn).not.toHaveBeenCalledWith(
      expect.stringMatching(/Rules of Hooks|rendered more hooks|hook.*called conditionally/)
    );

    consoleError.mockRestore();
    consoleWarn.mockRestore();
  });
});