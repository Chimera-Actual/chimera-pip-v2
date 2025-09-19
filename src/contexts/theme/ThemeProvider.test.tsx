import { render } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { ThemeProvider, useTheme } from '@/contexts/theme';
import { useAuth } from '@/contexts/AuthContext';

// Mock dependencies
vi.mock('@/contexts/AuthContext');
vi.mock('@/hooks/use-toast');
vi.mock('@/lib/errors');

function TestComponent() {
  const { colorScheme } = useTheme();
  return <div data-testid="theme-ok">{colorScheme}</div>;
}

describe('ThemeProvider', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('provides theme context to consumers', () => {
    vi.mocked(useAuth).mockReturnValue({ 
      user: null, 
      profile: null,
      updateProfile: vi.fn()
    } as any);

    const rendered = render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );
    
    expect(rendered.getByTestId('theme-ok')).toBeInTheDocument();
    expect(rendered.getByTestId('theme-ok')).toHaveTextContent('green');
  });

  it('throws error when useTheme is used outside provider', () => {
    // Suppress error boundary console errors for this test
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    expect(() => {
      render(<TestComponent />);
    }).toThrow('useTheme must be used within a ThemeProvider');
    
    consoleSpy.mockRestore();
  });
});