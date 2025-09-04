// Session Management Service
import { AuthSession, AuthUser } from './types';

class SessionManagerService {
  private readonly SESSION_KEY = 'pip_session';
  private readonly USER_KEY = 'pip_user';

  // Store session data
  setSession(session: AuthSession): void {
    try {
      localStorage.setItem(this.SESSION_KEY, JSON.stringify(session));
      localStorage.setItem(this.USER_KEY, JSON.stringify(session.user));
    } catch (error) {
      console.error('Failed to store session:', error);
    }
  }

  // Retrieve session data
  getSession(): AuthSession | null {
    try {
      const sessionData = localStorage.getItem(this.SESSION_KEY);
      return sessionData ? JSON.parse(sessionData) : null;
    } catch (error) {
      console.error('Failed to retrieve session:', error);
      return null;
    }
  }

  // Get stored user
  getUser(): AuthUser | null {
    try {
      const userData = localStorage.getItem(this.USER_KEY);
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Failed to retrieve user:', error);
      return null;
    }
  }

  // Clear session data
  clearSession(): void {
    try {
      localStorage.removeItem(this.SESSION_KEY);
      localStorage.removeItem(this.USER_KEY);
    } catch (error) {
      console.error('Failed to clear session:', error);
    }
  }

  // Check if session is valid
  isSessionValid(session: AuthSession | null): boolean {
    if (!session || !session.expires_at) {
      return false;
    }

    return Date.now() < session.expires_at * 1000;
  }

  // Get time until session expires
  getTimeUntilExpiry(session: AuthSession | null): number {
    if (!session || !session.expires_at) {
      return 0;
    }

    return Math.max(0, (session.expires_at * 1000) - Date.now());
  }

  // Check if session needs refresh
  needsRefresh(session: AuthSession | null, bufferMinutes: number = 5): boolean {
    if (!session || !session.expires_at) {
      return true;
    }

    const bufferMs = bufferMinutes * 60 * 1000;
    const expiryTime = session.expires_at * 1000;
    
    return Date.now() + bufferMs >= expiryTime;
  }
}

export const sessionManager = new SessionManagerService();