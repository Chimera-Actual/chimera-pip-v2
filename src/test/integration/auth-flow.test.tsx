import { render } from '@testing-library/react';
import { screen, fireEvent, waitFor } from '@testing-library/dom';
import { BrowserRouter } from 'react-router-dom';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { AppProviders } from '@/app/AppProviders';
import { VaultLogin } from '@/components/auth/VaultLogin';

// Mock the entire supabase client
vi.mock('@/lib/supabaseClient', () => ({
  supabase: {
    auth: {
      signInWithPassword: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn(),
      onAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe: vi.fn() } } })),
      getSession: vi.fn(() => Promise.resolve({ data: { session: null } })),
    },
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn(),
    })),
  },
}));

// Mock the quick access vault
vi.mock('@/lib/quickaccess/vault', () => ({
  loadQuickAccess: vi.fn(),
  saveQuickAccess: vi.fn(),
  deleteQuickAccess: vi.fn(),
  createQuickAccessRecord: vi.fn(),
  recordToEncryptedData: vi.fn(),
}));

// Mock navigation
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal() as any;
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Mock error reporting
vi.mock('@/lib/errorReporting', () => ({
  reportError: vi.fn(),
}));

describe('Auth Flow Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockNavigate.mockClear();
  });

  const renderLoginWithProviders = () => {
    return render(
      <AppProviders>
        <VaultLogin />
      </AppProviders>
    );
  };

  describe('Login Success Flow', () => {
    it('should show success toast and navigate on successful login', async () => {
      const { supabase } = await import('@/lib/supabaseClient');
      
      // Mock successful login
      vi.mocked(supabase.auth.signInWithPassword).mockResolvedValue({
        data: { user: { id: 'user-1', email: 'test@example.com' }, session: { access_token: 'token' } },
        error: null,
      } as any);

      renderLoginWithProviders();

      // Fill out the form
      const emailInput = screen.getByLabelText(/vault email/i);
      const passwordInput = screen.getByLabelText(/access code/i);
      const loginButton = screen.getByRole('button', { name: /initiate vault access/i });

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.click(loginButton);

      // Should show loading state
      expect(screen.getByText(/initiating vault access/i)).toBeInTheDocument();
      expect(loginButton).toBeDisabled();

      // Wait for success
      await waitFor(() => {
        expect(screen.getByText(/vault access granted/i)).toBeInTheDocument();
      });

      // Should navigate to main page
      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/');
      });
    });
  });

  describe('Login Failure Flow', () => {
    it('should show error toast on invalid credentials', async () => {
      const { supabase } = await import('@/lib/supabaseClient');
      
      // Mock failed login
      vi.mocked(supabase.auth.signInWithPassword).mockResolvedValue({
        data: { user: null, session: null },
        error: { message: 'Invalid login credentials' },
      } as any);

      renderLoginWithProviders();

      // Fill out the form
      const emailInput = screen.getByLabelText(/vault email/i);
      const passwordInput = screen.getByLabelText(/access code/i);
      const loginButton = screen.getByRole('button', { name: /initiate vault access/i });

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } });
      fireEvent.click(loginButton);

      // Wait for error toast
      await waitFor(() => {
        expect(screen.getByText(/access denied/i)).toBeInTheDocument();
      });

      // Should not navigate
      expect(mockNavigate).not.toHaveBeenCalled();
    });

    it('should show network failure toast on connection error', async () => {
      const { supabase } = await import('@/lib/supabaseClient');
      
      // Mock network error
      vi.mocked(supabase.auth.signInWithPassword).mockRejectedValue(new Error('Network error'));

      renderLoginWithProviders();

      // Fill out the form and submit
      const emailInput = screen.getByLabelText(/vault email/i);
      const passwordInput = screen.getByLabelText(/access code/i);
      const loginButton = screen.getByRole('button', { name: /initiate vault access/i });

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.click(loginButton);

      // Wait for network failure toast
      await waitFor(() => {
        expect(screen.getByText(/transmission failure/i)).toBeInTheDocument();
      });

      // Should not navigate
      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });

  describe('Form Validation', () => {
    it('should show validation errors for empty fields', async () => {
      renderLoginWithProviders();

      const loginButton = screen.getByRole('button', { name: /initiate vault access/i });
      fireEvent.click(loginButton);

      await waitFor(() => {
        expect(screen.getByText(/vault email is required/i)).toBeInTheDocument();
        expect(screen.getByText(/access code is required/i)).toBeInTheDocument();
      });

      // Should not attempt login
      const { supabase } = await import('@/lib/supabaseClient');
      expect(supabase.auth.signInWithPassword).not.toHaveBeenCalled();
    });

    it('should validate email format', async () => {
      renderLoginWithProviders();

      const emailInput = screen.getByLabelText(/vault email/i);
      const loginButton = screen.getByRole('button', { name: /initiate vault access/i });

      fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
      fireEvent.click(loginButton);

      await waitFor(() => {
        expect(screen.getByText(/please enter a valid email address/i)).toBeInTheDocument();
      });
    });
  });
});