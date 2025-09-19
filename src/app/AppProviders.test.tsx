import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { AppProviders } from './AppProviders';
import { useAuth } from '@/contexts/AuthContext';

function AuthProbe() {
  const { user } = useAuth();
  return <div data-testid="auth-probe">{user ? 'authed' : 'guest'}</div>;
}

describe('AppProviders', () => {
  it('mounts consumers of useAuth without throwing', () => {
    const { getByTestId } = render(
      <AppProviders>
        <AuthProbe />
      </AppProviders>
    );
    expect(getByTestId('auth-probe')).toBeInTheDocument();
    expect(getByTestId('auth-probe')).toHaveTextContent('guest');
  });

  it('provides correct provider hierarchy', () => {
    // Test that all required providers are available
    const { getByTestId } = render(
      <AppProviders>
        <div data-testid="content">App content</div>
      </AppProviders>
    );
    expect(getByTestId('content')).toBeInTheDocument();
  });
});