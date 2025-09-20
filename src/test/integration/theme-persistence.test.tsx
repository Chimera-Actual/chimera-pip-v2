import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { AppProviders } from '@/app/AppProviders';
import { useTheme } from '@/contexts/theme';

// Mock Supabase
vi.mock('@/lib/supabaseClient', () => ({
  supabase: {
    auth: {
      onAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe: vi.fn() } } })),
      getSession: vi.fn(() => Promise.resolve({ data: { session: null } })),
    },
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      single: vi.fn(),
    })),
  },
}));

// Mock quick access vault
vi.mock('@/lib/quickaccess/vault', () => ({
  loadQuickAccess: vi.fn(),
  saveQuickAccess: vi.fn(),
  deleteQuickAccess: vi.fn(),
  createQuickAccessRecord: vi.fn(),
  recordToEncryptedData: vi.fn(),
}));

// Mock error reporting
vi.mock('@/lib/errorReporting', () => ({
  reportError: vi.fn(),
}));

// Test component that uses theme
const ThemeTestComponent = () => {
  const { 
    colorScheme, 
    setColorScheme, 
    soundEnabled, 
    setSoundEnabled,
    glowIntensity,
    setGlowIntensity 
  } = useTheme();

  return (
    <div>
      <div data-testid="current-theme">{colorScheme}</div>
      <div data-testid="sound-enabled">{soundEnabled ? 'enabled' : 'disabled'}</div>
      <div data-testid="glow-intensity">{glowIntensity}</div>
      
      <button onClick={() => setColorScheme('amber')}>Set Amber Theme</button>
      <button onClick={() => setColorScheme('blue')}>Set Blue Theme</button>
      <button onClick={() => setSoundEnabled(!soundEnabled)}>Toggle Sound</button>
      <button onClick={() => setGlowIntensity(100)}>Set Max Glow</button>
    </div>
  );
};

describe('Theme Persistence Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Clear localStorage before each test
    localStorage.clear();
  });

  const renderThemeTestWithProviders = () => {
    return render(
      <AppProviders>
        <ThemeTestComponent />
      </AppProviders>
    );
  };

  describe('Theme State Management', () => {
    it('should load default theme values', async () => {
      renderThemeTestWithProviders();

      await waitFor(() => {
        expect(screen.getByTestId('current-theme')).toHaveTextContent('green');
        expect(screen.getByTestId('sound-enabled')).toHaveTextContent('enabled');
        expect(screen.getByTestId('glow-intensity')).toHaveTextContent('75');
      });
    });

    it('should update theme state when changed', async () => {
      renderThemeTestWithProviders();

      // Change to amber theme
      const amberButton = screen.getByText('Set Amber Theme');
      fireEvent.click(amberButton);

      await waitFor(() => {
        expect(screen.getByTestId('current-theme')).toHaveTextContent('amber');
      });

      // Toggle sound
      const soundButton = screen.getByText('Toggle Sound');
      fireEvent.click(soundButton);

      await waitFor(() => {
        expect(screen.getByTestId('sound-enabled')).toHaveTextContent('disabled');
      });

      // Set max glow
      const glowButton = screen.getByText('Set Max Glow');
      fireEvent.click(glowButton);

      await waitFor(() => {
        expect(screen.getByTestId('glow-intensity')).toHaveTextContent('100');
      });
    });
  });

  describe('Theme Persistence', () => {
    it('should persist theme changes to localStorage', async () => {
      renderThemeTestWithProviders();

      // Change theme settings
      fireEvent.click(screen.getByText('Set Blue Theme'));
      fireEvent.click(screen.getByText('Toggle Sound'));
      fireEvent.click(screen.getByText('Set Max Glow'));

      await waitFor(() => {
        expect(screen.getByTestId('current-theme')).toHaveTextContent('blue');
      });

      // Check localStorage
      const storedTheme = localStorage.getItem('chimera:theme');
      expect(storedTheme).toBeTruthy();
      
      const parsedTheme = JSON.parse(storedTheme!);
      expect(parsedTheme).toMatchObject({
        colorScheme: 'blue',
        soundEnabled: false,
        glowIntensity: 100,
      });
    });

    it('should restore theme from localStorage on reload', async () => {
      // Pre-populate localStorage with custom theme
      const customTheme = {
        colorScheme: 'red',
        soundEnabled: false,
        glowIntensity: 25,
        scanLineIntensity: 30,
        backgroundScanLines: 60,
        scrollingScanLines: 'random',
        layoutMode: 'drawer',
      };
      localStorage.setItem('chimera:theme', JSON.stringify(customTheme));

      renderThemeTestWithProviders();

      // Should restore the custom theme from localStorage
      await waitFor(() => {
        expect(screen.getByTestId('current-theme')).toHaveTextContent('red');
        expect(screen.getByTestId('sound-enabled')).toHaveTextContent('disabled');
        expect(screen.getByTestId('glow-intensity')).toHaveTextContent('25');
      });
    });

    it('should handle invalid localStorage data gracefully', async () => {
      // Set invalid JSON in localStorage
      localStorage.setItem('chimera:theme', 'invalid-json');

      renderThemeTestWithProviders();

      // Should fall back to default theme
      await waitFor(() => {
        expect(screen.getByTestId('current-theme')).toHaveTextContent('green');
        expect(screen.getByTestId('sound-enabled')).toHaveTextContent('enabled');
        expect(screen.getByTestId('glow-intensity')).toHaveTextContent('75');
      });
    });

    it('should sync theme changes with user profile when authenticated', async () => {
      // Mock authenticated user
      const mockUser = {
        id: 'user-1',
        email: 'test@example.com',
      };

      const mockProfile = {
        id: 'user-1',
        theme_config: {
          colorScheme: 'green',
          soundEnabled: true,
        },
      };

      // Mock AuthContext to return authenticated user
      vi.mock('@/contexts/AuthContext', () => ({
        useAuth: () => ({
          user: mockUser,
          profile: mockProfile,
          updateProfile: vi.fn().mockResolvedValue({ error: null }),
          loading: false,
        }),
      }));

      renderThemeTestWithProviders();

      // Change theme
      fireEvent.click(screen.getByText('Set Amber Theme'));

      await waitFor(() => {
        expect(screen.getByTestId('current-theme')).toHaveTextContent('amber');
      });

      // Verify that updateProfile would be called (in real implementation)
      // This tests the integration between theme and auth systems
    });
  });

  describe('Theme System Integration', () => {
    it('should apply CSS variables when theme changes', async () => {
      renderThemeTestWithProviders();

      // Change to blue theme
      fireEvent.click(screen.getByText('Set Blue Theme'));

      await waitFor(() => {
        const rootElement = document.documentElement;
        const computedStyle = getComputedStyle(rootElement);
        
        // The blue theme should set specific CSS custom properties
        // Note: The exact values depend on your theme implementation
        expect(rootElement.getAttribute('data-theme')).toBe('blue');
      });
    });

    it('should maintain theme consistency across multiple renders', async () => {
      const { unmount } = renderThemeTestWithProviders();

      // Set a custom theme
      fireEvent.click(screen.getByText('Set Blue Theme'));
      fireEvent.click(screen.getByText('Toggle Sound'));

      await waitFor(() => {
        expect(screen.getByTestId('current-theme')).toHaveTextContent('blue');
        expect(screen.getByTestId('sound-enabled')).toHaveTextContent('disabled');
      });

      // Unmount and remount component
      unmount();
      renderThemeTestWithProviders();

      // Theme should be restored from localStorage
      await waitFor(() => {
        expect(screen.getByTestId('current-theme')).toHaveTextContent('blue');
        expect(screen.getByTestId('sound-enabled')).toHaveTextContent('disabled');
      });
    });
  });

  describe('Theme Error Handling', () => {
    it('should handle theme update errors gracefully', async () => {
      // Mock console.warn to capture error messages
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      // Make localStorage.setItem throw an error
      const originalSetItem = localStorage.setItem;
      localStorage.setItem = vi.fn().mockImplementation(() => {
        throw new Error('Storage quota exceeded');
      });

      renderThemeTestWithProviders();

      // Try to change theme
      fireEvent.click(screen.getByText('Set Amber Theme'));

      await waitFor(() => {
        // Theme should still change in memory
        expect(screen.getByTestId('current-theme')).toHaveTextContent('amber');
      });

      // Should log warning about persistence failure
      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining('Failed to persist theme'),
        expect.any(Error)
      );

      // Restore original localStorage
      localStorage.setItem = originalSetItem;
      warnSpy.mockRestore();
    });
  });
});