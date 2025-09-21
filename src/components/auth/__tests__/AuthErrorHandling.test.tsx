import React from 'react';
import { render } from '@testing-library/react';
import { screen, fireEvent, waitFor } from '@testing-library/dom';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import { VaultLogin } from '../VaultLogin';
import { VaultRegistration } from '../VaultRegistration';
import { PasswordResetModal } from '../PasswordResetModal';
import { supabase } from '@/lib/supabaseClient';

// Mock Supabase client
const mockSupabaseAuth = {
  signInWithPassword: vi.fn(),
  signUp: vi.fn(),
  resetPasswordForEmail: vi.fn(),
  onAuthStateChange: vi.fn(() => ({ 
    data: { subscription: { unsubscribe: vi.fn() } } 
  })),
  getSession: vi.fn(() => Promise.resolve({ data: { session: null } })),
};

vi.mock('@/lib/supabaseClient', () => ({
  supabase: {
    auth: mockSupabaseAuth,
    from: vi.fn(() => ({ select: vi.fn() })),
  }
}));

// Mock error reporting
vi.mock('@/lib/errorReporting', () => ({
  reportError: vi.fn(),
}));

// Use the mocked auth object directly

describe('Auth Error Handling', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock successful auth state setup
    mockSupabaseAuth.onAuthStateChange.mockReturnValue({
      data: { subscription: { unsubscribe: vi.fn() } }
    } as any);
    
    mockSupabaseAuth.getSession.mockResolvedValue({
      data: { session: null },
      error: null
    } as any);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  const renderWithAuth = (component: React.ReactElement) => {
    return render(
      <BrowserRouter>
        <AuthProvider>
          {component}
        </AuthProvider>
      </BrowserRouter>
    );
  };

  describe('Network Failure Scenarios', () => {
    it('should show fallback toast for login network errors', async () => {
      mockSupabaseAuth.signInWithPassword.mockRejectedValue(new Error('Network error'));
      
      renderWithAuth(<VaultLogin />);
      
      const emailInput = screen.getByPlaceholderText('your.email@chimera-tec.com');
      const passwordInput = screen.getByPlaceholderText('Enter your access code');
      const loginButton = screen.getByRole('button', { name: /ACCESS VAULT/i });
      
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.click(loginButton);
      
      await waitFor(() => {
        expect(screen.getByText('TRANSMISSION FAILURE')).toBeInTheDocument();
        expect(screen.getByText('Connection lost. Please retry access.')).toBeInTheDocument();
      });
    });

    it('should show fallback toast for registration network errors', async () => {
      mockSupabaseAuth.signUp.mockRejectedValue(new Error('Network error'));
      
      renderWithAuth(<VaultRegistration />);
      
      const emailInput = screen.getByPlaceholderText('your.email@chimera-tec.com');
      const passwordInput = screen.getByPlaceholderText('Create your access code');
      const confirmPasswordInput = screen.getByPlaceholderText('Confirm your access code');
      const registerButton = screen.getByRole('button', { name: /JOIN VAULT PROGRAM/i });
      
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'Password123!' } });
      fireEvent.change(confirmPasswordInput, { target: { value: 'Password123!' } });
      
      fireEvent.click(registerButton);
      
      await waitFor(() => {
        expect(screen.getByText('TRANSMISSION FAILURE')).toBeInTheDocument();
        expect(screen.getByText('Connection lost. Please retry registration.')).toBeInTheDocument();
      });
    });

    it('should show fallback toast for password reset network errors', async () => {
      mockSupabaseAuth.resetPasswordForEmail.mockRejectedValue(new Error('Network error'));
      
      render(
        <BrowserRouter>
          <PasswordResetModal>
            <button>Open Modal</button>
          </PasswordResetModal>
        </BrowserRouter>
      );
      
      // Open the modal
      fireEvent.click(screen.getByText('Open Modal'));
      
      await waitFor(() => {
        expect(screen.getByText('ACCESS CODE RESET')).toBeInTheDocument();
      });
      
      const emailInput = screen.getByPlaceholderText('your.email@chimera-tec.com');
      const resetButton = screen.getByRole('button', { name: /REQUEST NEW ACCESS CODES/i });
      
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.click(resetButton);
      
      await waitFor(() => {
        expect(screen.getByText('TRANSMISSION FAILURE')).toBeInTheDocument();
        expect(screen.getByText('Unable to send reset codes. Check connection and retry.')).toBeInTheDocument();
      });
    });
  });

  describe('Supabase Error Scenarios', () => {
    it('should handle specific auth errors in login', async () => {
      mockSupabaseAuth.signInWithPassword.mockResolvedValue({
        data: { user: null, session: null },
        error: { message: 'Invalid login credentials' }
      } as any);
      
      renderWithAuth(<VaultLogin />);
      
      const emailInput = screen.getByPlaceholderText('your.email@chimera-tec.com');
      const passwordInput = screen.getByPlaceholderText('Enter your access code');
      const loginButton = screen.getByRole('button', { name: /ACCESS VAULT/i });
      
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } });
      fireEvent.click(loginButton);
      
      await waitFor(() => {
        expect(screen.getByText('ACCESS DENIED')).toBeInTheDocument();
        expect(screen.getByText('Invalid credentials. Please verify your access codes.')).toBeInTheDocument();
      });
    });

    it('should handle account lockout after multiple failed attempts', async () => {
      mockSupabaseAuth.signInWithPassword.mockResolvedValue({
        data: { user: null, session: null },
        error: { message: 'Invalid login credentials' }
      } as any);
      
      renderWithAuth(<VaultLogin />);
      
      const emailInput = screen.getByPlaceholderText('your.email@chimera-tec.com');
      const passwordInput = screen.getByPlaceholderText('Enter your access code');
      const loginButton = screen.getByRole('button', { name: /ACCESS VAULT/i });
      
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } });
      
      // Simulate 5 failed attempts
      for (let i = 0; i < 5; i++) {
        fireEvent.click(loginButton);
        await waitFor(() => {
          expect(screen.getByText('ACCESS DENIED')).toBeInTheDocument();
        });
      }
      
      // 6th attempt should show lockout
      fireEvent.click(loginButton);
      
      await waitFor(() => {
        expect(screen.getByText('ACCOUNT LOCKED')).toBeInTheDocument();
      });
    });

    it('should handle user already exists error in registration', async () => {
      mockSupabaseAuth.signUp.mockResolvedValue({
        data: { user: null, session: null },
        error: { message: 'User already registered' }
      } as any);
      
      renderWithAuth(<VaultRegistration />);
      
      const emailInput = screen.getByPlaceholderText('your.email@chimera-tec.com');
      const passwordInput = screen.getByPlaceholderText('Create your access code');
      const confirmPasswordInput = screen.getByPlaceholderText('Confirm your access code');
      const registerButton = screen.getByRole('button', { name: /JOIN VAULT PROGRAM/i });
      
      fireEvent.change(emailInput, { target: { value: 'existing@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'Password123!' } });
      fireEvent.change(confirmPasswordInput, { target: { value: 'Password123!' } });
      
      fireEvent.click(registerButton);
      
      await waitFor(() => {
        expect(screen.getByText('ACCESS DENIED')).toBeInTheDocument();
        expect(screen.getByText('User already registered')).toBeInTheDocument();
      });
    });
  });

  describe('Success Messages', () => {
    it('should show success message for successful login', async () => {
      mockSupabaseAuth.signInWithPassword.mockResolvedValue({
        data: {
          user: { id: '1', email: 'test@example.com' },
          session: { access_token: 'token' }
        },
        error: null
      } as any);
      
      renderWithAuth(<VaultLogin />);
      
      const emailInput = screen.getByPlaceholderText('your.email@chimera-tec.com');
      const passwordInput = screen.getByPlaceholderText('Enter your access code');
      const loginButton = screen.getByRole('button', { name: /ACCESS VAULT/i });
      
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.click(loginButton);
      
      await waitFor(() => {
        expect(screen.getByText('VAULT ACCESS GRANTED')).toBeInTheDocument();
        expect(screen.getByText('Welcome back to the vault!')).toBeInTheDocument();
      });
    });

    it('should show success message for successful registration', async () => {
      mockSupabaseAuth.signUp.mockResolvedValue({
        data: {
          user: { id: '1', email: 'test@example.com' },
          session: null
        },
        error: null
      } as any);
      
      renderWithAuth(<VaultRegistration />);
      
      const emailInput = screen.getByPlaceholderText('your.email@chimera-tec.com');
      const passwordInput = screen.getByPlaceholderText('Create your access code');
      const confirmPasswordInput = screen.getByPlaceholderText('Confirm your access code');
      const registerButton = screen.getByRole('button', { name: /JOIN VAULT PROGRAM/i });
      
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'Password123!' } });
      fireEvent.change(confirmPasswordInput, { target: { value: 'Password123!' } });
      
      fireEvent.click(registerButton);
      
      await waitFor(() => {
        expect(screen.getByText('VAULT REGISTRATION INITIATED')).toBeInTheDocument();
        expect(screen.getByText('Check your email for verification instructions.')).toBeInTheDocument();
      });
    });
  });
});