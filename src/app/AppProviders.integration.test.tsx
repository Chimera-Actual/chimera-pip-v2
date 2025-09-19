import { render } from '@testing-library/react';
import { vi, describe, it, expect } from 'vitest';
import { AppProviders } from './AppProviders';
import { PipBoySettingsModal } from '@/components/PipBoy/SettingsModal';

// Mock auth context
vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    user: null,
    profile: null,
    updateProfile: vi.fn(),
  }),
}));

// Mock toast hooks
vi.mock('@/hooks/use-toast', () => ({
  toast: vi.fn(),
}));

// Mock error reporting
vi.mock('@/lib/errors', () => ({
  normalizeError: vi.fn(() => ({
    userMessage: 'Test error',
  })),
}));

describe('AppProviders Integration', () => {
  it('SettingsModal can use useTheme without throwing', () => {
    expect(() => {
      render(
        <AppProviders>
          <PipBoySettingsModal isOpen={true} onClose={() => {}} />
        </AppProviders>
      );
    }).not.toThrow();
  });
});