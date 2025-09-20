import React from 'react';
import { render } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import '@testing-library/jest-dom';
import { DashboardContent } from '../DashboardContent';
import { AppProviders } from '@/app/AppProviders';

// This test validates that hooks are not called inside loops/conditionals
describe('DashboardContent Rules of Hooks', () => {
  it('renders without Rules of Hooks violations', () => {
    // Mock console.error to catch React warnings
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    // If there were Rules of Hooks violations, React would log errors/warnings
    expect(() => {
      render(
        <AppProviders>
          <DashboardContent activeTab="MAIN" />
        </AppProviders>
      );
    }).not.toThrow();

    // Check that no React warnings were logged about hook violations
    const hookWarnings = consoleSpy.mock.calls.filter(call => 
      call.some(arg => 
        typeof arg === 'string' && 
        (arg.includes('Hook') || arg.includes('hook'))
      )
    );
    
    expect(hookWarnings).toHaveLength(0);
    
    consoleSpy.mockRestore();
  });

  it('handles tab switching without hook violations', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    const { rerender } = render(
      <AppProviders>
        <DashboardContent activeTab="MAIN" />
      </AppProviders>
    );

    // Switch to a different tab - this should not cause hook violations
    expect(() => {
      rerender(
        <AppProviders>
          <DashboardContent activeTab="DATA" />
        </AppProviders>
      );
    }).not.toThrow();

    const hookWarnings = consoleSpy.mock.calls.filter(call => 
      call.some(arg => 
        typeof arg === 'string' && 
        (arg.includes('Hook') || arg.includes('hook'))
      )
    );
    
    expect(hookWarnings).toHaveLength(0);
    
    consoleSpy.mockRestore();
  });
});