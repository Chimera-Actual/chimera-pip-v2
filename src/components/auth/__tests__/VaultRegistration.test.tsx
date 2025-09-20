import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import { VaultRegistration } from '../VaultRegistration';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

// Mock dependencies
vi.mock('@/contexts/AuthContext');
vi.mock('@/hooks/use-toast');
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => vi.fn(),
  };
});

const mockUseAuth = vi.mocked(useAuth);
const mockUseToast = vi.mocked(useToast);

describe('VaultRegistration', () => {
  const mockSignUp = vi.fn();
  const mockToast = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    
    mockUseAuth.mockReturnValue({
      signUp: mockSignUp,
    } as any);
    
    mockUseToast.mockReturnValue({
      toast: mockToast,
      dismiss: vi.fn(),
      toasts: [],
    });
  });

  const renderComponent = () => {
    return render(
      <BrowserRouter>
        <VaultRegistration />
      </BrowserRouter>
    );
  };

  describe('Registration Flow', () => {
    it('should show loading state during registration', async () => {
      mockSignUp.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));
      
      renderComponent();
      
      const emailInput = screen.getByPlaceholderText('your.email@chimera-tec.com');
      const passwordInput = screen.getByPlaceholderText('Create your access code');
      const confirmPasswordInput = screen.getByPlaceholderText('Confirm your access code');
      const registerButton = screen.getByRole('button', { name: /JOIN VAULT PROGRAM/i });
      
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'Password123!' } });
      fireEvent.change(confirmPasswordInput, { target: { value: 'Password123!' } });
      
      fireEvent.click(registerButton);
      
      await waitFor(() => {
        expect(screen.getByText('PROCESSING APPLICATION...')).toBeInTheDocument();
        expect(registerButton).toBeDisabled();
      });
    });

    it('should handle network failure with fallback toast', async () => {
      mockSignUp.mockRejectedValue(new Error('Network error'));
      
      renderComponent();
      
      const emailInput = screen.getByPlaceholderText('your.email@chimera-tec.com');
      const passwordInput = screen.getByPlaceholderText('Create your access code');
      const confirmPasswordInput = screen.getByPlaceholderText('Confirm your access code');
      const registerButton = screen.getByRole('button', { name: /JOIN VAULT PROGRAM/i });
      
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'Password123!' } });
      fireEvent.change(confirmPasswordInput, { target: { value: 'Password123!' } });
      
      fireEvent.click(registerButton);
      
      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith({
          title: "TRANSMISSION FAILURE",
          description: "Connection lost. Please retry registration.",
          variant: "destructive",
        });
      });
    });

    it('should handle successful registration', async () => {
      mockSignUp.mockResolvedValue({ error: null });
      
      renderComponent();
      
      const emailInput = screen.getByPlaceholderText('your.email@chimera-tec.com');
      const passwordInput = screen.getByPlaceholderText('Create your access code');
      const confirmPasswordInput = screen.getByPlaceholderText('Confirm your access code');
      const registerButton = screen.getByRole('button', { name: /JOIN VAULT PROGRAM/i });
      
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'Password123!' } });
      fireEvent.change(confirmPasswordInput, { target: { value: 'Password123!' } });
      
      fireEvent.click(registerButton);
      
      await waitFor(() => {
        expect(mockSignUp).toHaveBeenCalledWith('test@example.com', 'Password123!');
      });
    });
  });

  describe('Password Strength Validation', () => {
    it('should disable submit button for weak passwords', async () => {
      renderComponent();
      
      const passwordInput = screen.getByPlaceholderText('Create your access code');
      const registerButton = screen.getByRole('button', { name: /JOIN VAULT PROGRAM/i });
      
      fireEvent.change(passwordInput, { target: { value: 'weak' } });
      
      await waitFor(() => {
        expect(registerButton).toBeDisabled();
        expect(screen.getByText('INSUFFICIENT')).toBeInTheDocument();
      });
    });

    it('should show password strength indicator', async () => {
      renderComponent();
      
      const passwordInput = screen.getByPlaceholderText('Create your access code');
      
      fireEvent.change(passwordInput, { target: { value: 'Password123!' } });
      
      await waitFor(() => {
        expect(screen.getByText('HIGH')).toBeInTheDocument();
        expect(screen.getByText('At least 8 characters')).toBeInTheDocument();
        expect(screen.getByText('Uppercase letter')).toBeInTheDocument();
        expect(screen.getByText('Number')).toBeInTheDocument();
        expect(screen.getByText('Special character')).toBeInTheDocument();
      });
    });

    it('should validate password confirmation match', async () => {
      renderComponent();
      
      const passwordInput = screen.getByPlaceholderText('Create your access code');
      const confirmPasswordInput = screen.getByPlaceholderText('Confirm your access code');
      const registerButton = screen.getByRole('button', { name: /JOIN VAULT PROGRAM/i });
      
      fireEvent.change(passwordInput, { target: { value: 'Password123!' } });
      fireEvent.change(confirmPasswordInput, { target: { value: 'Different123!' } });
      fireEvent.click(registerButton);
      
      await waitFor(() => {
        expect(screen.getByText('Access codes do not match')).toBeInTheDocument();
      });
    });
  });

  describe('Form Validation', () => {
    it('should show validation errors for invalid inputs', async () => {
      renderComponent();
      
      const registerButton = screen.getByRole('button', { name: /JOIN VAULT PROGRAM/i });
      fireEvent.click(registerButton);
      
      await waitFor(() => {
        expect(screen.getByText('Email address is required')).toBeInTheDocument();
        expect(screen.getByText('Access code is required')).toBeInTheDocument();
      });
    });

    it('should validate email format', async () => {
      renderComponent();
      
      const emailInput = screen.getByPlaceholderText('your.email@chimera-tec.com');
      const registerButton = screen.getByRole('button', { name: /JOIN VAULT PROGRAM/i });
      
      fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
      fireEvent.click(registerButton);
      
      await waitFor(() => {
        expect(screen.getByText('Invalid email address')).toBeInTheDocument();
      });
    });

    it('should validate password minimum length', async () => {
      renderComponent();
      
      const passwordInput = screen.getByPlaceholderText('Create your access code');
      const registerButton = screen.getByRole('button', { name: /JOIN VAULT PROGRAM/i });
      
      fireEvent.change(passwordInput, { target: { value: '123' } });
      fireEvent.click(registerButton);
      
      await waitFor(() => {
        expect(screen.getByText('Access code must be at least 8 characters')).toBeInTheDocument();
      });
    });
  });
});