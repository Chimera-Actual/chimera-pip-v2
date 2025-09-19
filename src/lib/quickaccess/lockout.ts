/**
 * Rate limiting and lockout management for Quick Access
 */

interface LockoutState {
  attempts: number;
  lockedUntil: number;
  lastAttempt: number;
}

const LOCKOUT_KEY_PREFIX = 'chimera:qa:lockout:';
const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION = 5 * 60 * 1000; // 5 minutes
const LOCKOUT_MULTIPLIER = 2; // Exponential backoff

/**
 * Gets current lockout state for a numeric ID
 */
export function getLockoutState(numericId: string): LockoutState {
  const key = `${LOCKOUT_KEY_PREFIX}${numericId}`;
  const stored = localStorage.getItem(key);
  
  if (!stored) {
    return {
      attempts: 0,
      lockedUntil: 0,
      lastAttempt: 0
    };
  }
  
  try {
    return JSON.parse(stored) as LockoutState;
  } catch {
    return {
      attempts: 0,
      lockedUntil: 0,
      lastAttempt: 0
    };
  }
}

/**
 * Checks if a numeric ID is currently locked out
 */
export function isLockedOut(numericId: string): boolean {
  const state = getLockoutState(numericId);
  return Date.now() < state.lockedUntil;
}

/**
 * Gets remaining lockout time in milliseconds
 */
export function getRemainingLockoutTime(numericId: string): number {
  const state = getLockoutState(numericId);
  const remaining = state.lockedUntil - Date.now();
  return Math.max(0, remaining);
}

/**
 * Records a failed attempt and updates lockout state
 */
export function recordFailedAttempt(numericId: string): LockoutState {
  const state = getLockoutState(numericId);
  const now = Date.now();
  
  // Reset attempts if it's been more than 24 hours since last attempt
  if (now - state.lastAttempt > 24 * 60 * 60 * 1000) {
    state.attempts = 0;
  }
  
  state.attempts += 1;
  state.lastAttempt = now;
  
  // Calculate lockout duration with exponential backoff
  if (state.attempts >= MAX_ATTEMPTS) {
    const lockoutMultiplier = Math.pow(LOCKOUT_MULTIPLIER, state.attempts - MAX_ATTEMPTS);
    const lockoutDuration = LOCKOUT_DURATION * lockoutMultiplier;
    state.lockedUntil = now + lockoutDuration;
  }
  
  // Save updated state
  const key = `${LOCKOUT_KEY_PREFIX}${numericId}`;
  localStorage.setItem(key, JSON.stringify(state));
  
  return state;
}

/**
 * Resets lockout state on successful authentication
 */
export function resetLockout(numericId: string): void {
  const key = `${LOCKOUT_KEY_PREFIX}${numericId}`;
  localStorage.removeItem(key);
}

/**
 * Gets attempts remaining before lockout
 */
export function getAttemptsRemaining(numericId: string): number {
  const state = getLockoutState(numericId);
  return Math.max(0, MAX_ATTEMPTS - state.attempts);
}

/**
 * Formats remaining lockout time as human-readable string
 */
export function formatLockoutTime(milliseconds: number): string {
  const seconds = Math.ceil(milliseconds / 1000);
  
  if (seconds < 60) {
    return `${seconds}s`;
  }
  
  const minutes = Math.ceil(seconds / 60);
  if (minutes < 60) {
    return `${minutes}m`;
  }
  
  const hours = Math.ceil(minutes / 60);
  return `${hours}h`;
}

/**
 * Clears all lockout data (for testing/debugging)
 */
export function clearAllLockouts(): void {
  const keys = Object.keys(localStorage).filter(key => 
    key.startsWith(LOCKOUT_KEY_PREFIX)
  );
  
  keys.forEach(key => localStorage.removeItem(key));
}