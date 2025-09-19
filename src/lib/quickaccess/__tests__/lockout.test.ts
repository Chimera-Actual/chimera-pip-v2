/**
 * Tests for Quick Access lockout system
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { 
  getLockoutState,
  isLockedOut,
  getRemainingLockoutTime,
  recordFailedAttempt,
  resetLockout,
  getAttemptsRemaining,
  formatLockoutTime,
  clearAllLockouts
} from '../lockout';

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  key: vi.fn(),
  length: 0,
};

// Mock Object.keys for clearAllLockouts test
const mockObjectKeys = vi.fn();

beforeEach(() => {
  vi.clearAllMocks();
  Object.defineProperty(global, 'localStorage', {
    value: localStorageMock,
    writable: true
  });
  Object.defineProperty(Object, 'keys', {
    value: mockObjectKeys,
    writable: true
  });
});

describe('Quick Access Lockout', () => {
  const numericId = '12345';

  describe('getLockoutState', () => {
    it('should return default state when no data exists', () => {
      localStorageMock.getItem.mockReturnValue(null);
      
      const state = getLockoutState(numericId);
      
      expect(state).toEqual({
        attempts: 0,
        lockedUntil: 0,
        lastAttempt: 0
      });
    });

    it('should return stored state when data exists', () => {
      const storedState = {
        attempts: 3,
        lockedUntil: Date.now() + 60000,
        lastAttempt: Date.now() - 1000
      };
      
      localStorageMock.getItem.mockReturnValue(JSON.stringify(storedState));
      
      const state = getLockoutState(numericId);
      
      expect(state).toEqual(storedState);
    });

    it('should handle corrupted data gracefully', () => {
      localStorageMock.getItem.mockReturnValue('invalid json');
      
      const state = getLockoutState(numericId);
      
      expect(state).toEqual({
        attempts: 0,
        lockedUntil: 0,
        lastAttempt: 0
      });
    });
  });

  describe('isLockedOut', () => {
    it('should return false when not locked', () => {
      localStorageMock.getItem.mockReturnValue(JSON.stringify({
        attempts: 2,
        lockedUntil: Date.now() - 1000, // Past time
        lastAttempt: Date.now() - 5000
      }));
      
      expect(isLockedOut(numericId)).toBe(false);
    });

    it('should return true when locked', () => {
      localStorageMock.getItem.mockReturnValue(JSON.stringify({
        attempts: 5,
        lockedUntil: Date.now() + 60000, // Future time
        lastAttempt: Date.now() - 1000
      }));
      
      expect(isLockedOut(numericId)).toBe(true);
    });
  });

  describe('getRemainingLockoutTime', () => {
    it('should return 0 when not locked', () => {
      localStorageMock.getItem.mockReturnValue(JSON.stringify({
        attempts: 2,
        lockedUntil: Date.now() - 1000,
        lastAttempt: Date.now() - 5000
      }));
      
      expect(getRemainingLockoutTime(numericId)).toBe(0);
    });

    it('should return remaining time when locked', () => {
      const lockoutTime = 60000; // 1 minute
      localStorageMock.getItem.mockReturnValue(JSON.stringify({
        attempts: 5,
        lockedUntil: Date.now() + lockoutTime,
        lastAttempt: Date.now() - 1000
      }));
      
      const remaining = getRemainingLockoutTime(numericId);
      expect(remaining).toBeGreaterThan(lockoutTime - 1000);
      expect(remaining).toBeLessThanOrEqual(lockoutTime);
    });
  });

  describe('recordFailedAttempt', () => {
    it('should increment attempt count', () => {
      localStorageMock.getItem.mockReturnValue(JSON.stringify({
        attempts: 2,
        lockedUntil: 0,
        lastAttempt: Date.now() - 1000
      }));
      
      const newState = recordFailedAttempt(numericId);
      
      expect(newState.attempts).toBe(3);
      expect(localStorageMock.setItem).toHaveBeenCalled();
    });

    it('should trigger lockout after 5 attempts', () => {
      localStorageMock.getItem.mockReturnValue(JSON.stringify({
        attempts: 4,
        lockedUntil: 0,
        lastAttempt: Date.now() - 1000
      }));
      
      const newState = recordFailedAttempt(numericId);
      
      expect(newState.attempts).toBe(5);
      expect(newState.lockedUntil).toBeGreaterThan(Date.now());
    });

    it('should reset attempts after 24 hours', () => {
      const dayAgo = Date.now() - (25 * 60 * 60 * 1000); // 25 hours ago
      localStorageMock.getItem.mockReturnValue(JSON.stringify({
        attempts: 3,
        lockedUntil: 0,
        lastAttempt: dayAgo
      }));
      
      const newState = recordFailedAttempt(numericId);
      
      expect(newState.attempts).toBe(1); // Reset to 1 (current attempt)
    });

    it('should apply exponential backoff for repeated lockouts', () => {
      localStorageMock.getItem.mockReturnValue(JSON.stringify({
        attempts: 6, // Already locked once
        lockedUntil: 0,
        lastAttempt: Date.now() - 1000
      }));
      
      const newState = recordFailedAttempt(numericId);
      
      expect(newState.attempts).toBe(7);
      expect(newState.lockedUntil).toBeGreaterThan(Date.now());
      
      // Should be longer than base lockout due to exponential backoff
      const lockoutDuration = newState.lockedUntil - Date.now();
      expect(lockoutDuration).toBeGreaterThan(5 * 60 * 1000); // More than 5 minutes
    });
  });

  describe('resetLockout', () => {
    it('should remove lockout data', () => {
      resetLockout(numericId);
      
      const expectedKey = `chimera:qa:lockout:${numericId}`;
      expect(localStorageMock.removeItem).toHaveBeenCalledWith(expectedKey);
    });
  });

  describe('getAttemptsRemaining', () => {
    it('should return correct remaining attempts', () => {
      localStorageMock.getItem.mockReturnValue(JSON.stringify({
        attempts: 3,
        lockedUntil: 0,
        lastAttempt: Date.now() - 1000
      }));
      
      const remaining = getAttemptsRemaining(numericId);
      expect(remaining).toBe(2); // 5 - 3 = 2
    });

    it('should return 0 when attempts exceeded', () => {
      localStorageMock.getItem.mockReturnValue(JSON.stringify({
        attempts: 6,
        lockedUntil: Date.now() + 60000,
        lastAttempt: Date.now() - 1000
      }));
      
      const remaining = getAttemptsRemaining(numericId);
      expect(remaining).toBe(0);
    });
  });

  describe('formatLockoutTime', () => {
    it('should format seconds correctly', () => {
      expect(formatLockoutTime(30000)).toBe('30s');
      expect(formatLockoutTime(1000)).toBe('1s');
    });

    it('should format minutes correctly', () => {
      expect(formatLockoutTime(60000)).toBe('1m');
      expect(formatLockoutTime(90000)).toBe('2m');
      expect(formatLockoutTime(300000)).toBe('5m');
    });

    it('should format hours correctly', () => {
      expect(formatLockoutTime(3600000)).toBe('1h');
      expect(formatLockoutTime(7200000)).toBe('2h');
    });

    it('should round up partial units', () => {
      expect(formatLockoutTime(1500)).toBe('2s'); // 1.5s rounds to 2s
      expect(formatLockoutTime(90500)).toBe('2m'); // 1.5m rounds to 2m
    });
  });

  describe('clearAllLockouts', () => {
    it('should remove all lockout keys', () => {
      const mockKeys = [
        'chimera:qa:lockout:12345',
        'chimera:qa:lockout:67890',
        'other:key'
      ];
      
      mockObjectKeys.mockReturnValue(mockKeys);
      
      clearAllLockouts();
      
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('chimera:qa:lockout:12345');
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('chimera:qa:lockout:67890');
      expect(localStorageMock.removeItem).not.toHaveBeenCalledWith('other:key');
    });
  });
});