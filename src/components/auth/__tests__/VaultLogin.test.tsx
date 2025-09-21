import React from 'react';
import { render } from '@testing-library/react';
import { screen, fireEvent, waitFor } from '@testing-library/dom';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import { VaultLogin } from '../VaultLogin';
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

describe('VaultLogin', () => {
  const mockSignIn = vi.fn();
  const mockQuickUnlockWithIdPin = vi.fn();
  const mockToast = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    
    mockUseAuth.mockReturnValue({
      signIn: mockSignIn,
      quickUnlockWithIdPin: mockQuickUnlockWithIdPin,
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
        <VaultLogin />
      </BrowserRouter>
    );
  };

  describe('Standard Login', () => {
    it('should show loading state during login', async () => {
      mockSignIn.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));
      
      renderComponent();
      
      const emailInput = screen.getByPlaceholderText('your.email@chimera-tec.com');
      const passwordInput = screen.getByPlaceholderText('Enter your access code');
      const loginButton = screen.getByRole('button', { name: /ACCESS VAULT/i });
      
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.click(loginButton);
      
      await waitFor(() => {
        expect(screen.getByText('ACCESSING VAULT...')).toBeInTheDocument();
        expect(loginButton).toBeDisabled();
      });
    });

    it('should handle network failure with fallback toast', async () => {
      mockSignIn.mockRejectedValue(new Error('Network error'));
      
      renderComponent();
      
      const emailInput = screen.getByPlaceholderText('your.email@chimera-tec.com');
      const passwordInput = screen.getByPlaceholderText('Enter your access code');
      const loginButton = screen.getByRole('button', { name: /ACCESS VAULT/i });
      
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.click(loginButton);
      
      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith({
          title: "TRANSMISSION FAILURE",
          description: "Connection lost. Please retry access.",
          variant: "destructive",
        });
      });
    });

    it('should handle successful login', async () => {
      mockSignIn.mockResolvedValue({ error: null });
      
      renderComponent();
      
      const emailInput = screen.getByPlaceholderText('your.email@chimera-tec.com');
      const passwordInput = screen.getByPlaceholderText('Enter your access code');
      const loginButton = screen.getByRole('button', { name: /ACCESS VAULT/i });
      
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.click(loginButton);
      
      await waitFor(() => {
        expect(mockSignIn).toHaveBeenCalledWith('test@example.com', 'password123');
      });
    });
  });

  describe('Quick Access Login', () => {
    it('should show specific error toasts for quick access failures', async () => {
      mockQuickUnlockWithIdPin.mockRejectedValue(new Error('Device not found'));
      
      renderComponent();
      
      // Switch to quick access tab
      const quickAccessTab = screen.getByRole('tab', { name: /Quick Access/i });
      fireEvent.click(quickAccessTab);
      
      // Get quick access form elements via the QuickAccessLogin component
      await waitFor(() => {
        expect(screen.getByText('Quick Access')).toBeInTheDocument();
      });
      
      // Mock the QuickAccessLogin onSubmit prop call
      const quickAccessOnSubmit = mockUseAuth().quickUnlockWithIdPin;
      
      try {
        await quickAccessOnSubmit('123456789', '1234');
      } catch (error) {
        // This would be handled in the component
      }
      
      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith({
          title: 'Device Not Enrolled',
          description: 'This device is not set up for Quick Access. Please use standard login and set up Quick Access in Settings.',
          variant: 'destructive',
        });
      });
    });

    it('should handle session expired errors', async () => {
      mockQuickUnlockWithIdPin.mockRejectedValue(new Error('Session expired'));
      
      renderComponent();
      
      // Switch to quick access tab
      const quickAccessTab = screen.getByRole('tab', { name: /Quick Access/i });
      fireEvent.click(quickAccessTab);
      
      // Mock the error handling that would occur in the component
      try {
        await mockQuickUnlockWithIdPin('123456789', '1234');
      } catch (error) {
        // Component would handle this
      }
      
      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith({
          title: 'Session Expired',
          description: 'Your saved session has expired. Please log in normally and re-enroll Quick Access.',
          variant: 'destructive',
        });
      });
    });
  });

  describe('Form Validation', () => {
    it('should show validation errors for invalid inputs', async () => {
      renderComponent();
      
      const loginButton = screen.getByRole('button', { name: /ACCESS VAULT/i });
      fireEvent.click(loginButton);
      
      await waitFor(() => {
        expect(screen.getByText('Email address is required')).toBeInTheDocument();
        expect(screen.getByText('Access code is required')).toBeInTheDocument();
      });
    });

    it('should validate email format', async () => {
      renderComponent();
      
      const emailInput = screen.getByPlaceholderText('your.email@chimera-tec.com');
      const loginButton = screen.getByRole('button', { name: /ACCESS VAULT/i });
      
      fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
      fireEvent.click(loginButton);
      
      await waitFor(() => {
        expect(screen.getByText('Invalid email address')).toBeInTheDocument();
      });
    });

    it('should validate password minimum length', async () => {
      renderComponent();
      
      const emailInput = screen.getByPlaceholderText('your.email@chimera-tec.com');
      const passwordInput = screen.getByPlaceholderText('Enter your access code');
      const loginButton = screen.getByRole('button', { name: /ACCESS VAULT/i });
      
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: '123' } });
      fireEvent.click(loginButton);
      
      await waitFor(() => {
        expect(screen.getByText('Access code must be at least 6 characters')).toBeInTheDocument();
      });
    });
  });
});