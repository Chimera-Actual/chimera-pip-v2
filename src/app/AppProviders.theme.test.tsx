import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { AppProviders } from './AppProviders';
import { useTheme } from '@/contexts/theme';

function ThemeProbe() {
  const { colorScheme } = useTheme();
  return <div data-testid="theme-probe">{colorScheme ?? 'none'}</div>;
}

describe('AppProviders Theme Integration', () => {
  it('mounts a useTheme consumer without throwing', () => {
    const { getByTestId } = render(
      <AppProviders>
        <ThemeProbe />
      </AppProviders>
    );
    expect(getByTestId('theme-probe')).toBeInTheDocument();
  });

  it('provides theme context to nested components', () => {
    const { getByTestId } = render(
      <AppProviders>
        <ThemeProbe />
      </AppProviders>
    );
    const probe = getByTestId('theme-probe');
    expect(probe).toBeInTheDocument();
    // Should have some theme value, not 'none'
    expect(probe.textContent).not.toBe('none');
  });
});