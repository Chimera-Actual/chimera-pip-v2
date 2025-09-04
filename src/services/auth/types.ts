// Authentication Service Types
export interface AuthUser {
  id: string;
  email: string;
  username?: string;
  vault_number?: number;
  theme_config?: Record<string, any>;
  special_stats?: Record<string, number>;
  created_at: string;
  updated_at?: string;
}

export interface AuthSession {
  user: AuthUser;
  access_token: string;
  refresh_token: string;
  expires_at: number;
  expires_in: number;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials extends LoginCredentials {
  username?: string;
}

export interface AuthState {
  user: AuthUser | null;
  session: AuthSession | null;
  loading: boolean;
  error: string | null;
}