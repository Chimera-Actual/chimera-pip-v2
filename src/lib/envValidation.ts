/**
 * Environment Variable Validation
 * Validates required environment variables at application startup
 */

interface EnvConfig {
  supabaseUrl: string;
  supabaseAnonKey: string;
  nodeEnv: string;
}

class EnvironmentValidator {
  private static instance: EnvironmentValidator;
  private validated = false;
  private config: EnvConfig | null = null;

  private constructor() {}

  static getInstance(): EnvironmentValidator {
    if (!EnvironmentValidator.instance) {
      EnvironmentValidator.instance = new EnvironmentValidator();
    }
    return EnvironmentValidator.instance;
  }

  validate(): EnvConfig {
    if (this.validated && this.config) {
      return this.config;
    }

    const errors: string[] = [];

    // Validate Supabase configuration
    const supabaseUrl = import.meta.env?.VITE_SUPABASE_URL || 'https://gfvhmzhwiwiehucoseld.supabase.co';
    const supabaseAnonKey = import.meta.env?.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdmdmhtemh3aXdpZWh1Y29zZWxkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY4MjM5ODUsImV4cCI6MjA3MjM5OTk4NX0.QQr_oAZyF4WB-0QZSnZ75RF2_ZLo7X1lJD5XagsCPCw';

    if (!supabaseUrl) {
      errors.push('VITE_SUPABASE_URL is required but not defined');
    } else if (!this.isValidUrl(supabaseUrl)) {
      errors.push('VITE_SUPABASE_URL must be a valid URL');
    } else if (!supabaseUrl.includes('supabase.co')) {
      errors.push('VITE_SUPABASE_URL must be a valid Supabase URL');
    }

    if (!supabaseAnonKey) {
      errors.push('VITE_SUPABASE_ANON_KEY is required but not defined');
    } else if (!this.isValidJWT(supabaseAnonKey)) {
      errors.push('VITE_SUPABASE_ANON_KEY must be a valid JWT token');
    }

    // Validate Node environment
    const nodeEnv = import.meta.env?.MODE || 'development';
    const validEnvs = ['development', 'production', 'test'];
    if (!validEnvs.includes(nodeEnv)) {
      errors.push(`NODE_ENV must be one of: ${validEnvs.join(', ')}, got: ${nodeEnv}`);
    }

    // Validate build-time configuration
    if (typeof import.meta === 'undefined') {
      errors.push('Application is not properly built with Vite - import.meta is undefined');
    }

    if (errors.length > 0) {
      const errorMessage = `Environment validation failed:\n${errors.map(e => `  - ${e}`).join('\n')}`;
      console.error(errorMessage);
      throw new Error(errorMessage);
    }

    this.config = {
      supabaseUrl,
      supabaseAnonKey, 
      nodeEnv
    };

    this.validated = true;

    // Log successful validation in development
    if (nodeEnv === 'development') {
      console.info('✅ Environment validation passed', {
        supabaseUrl: supabaseUrl,
        nodeEnv,
        timestamp: new Date().toISOString()
      });
    }

    return this.config;
  }

  getConfig(): EnvConfig {
    if (!this.validated || !this.config) {
      return this.validate();
    }
    return this.config;
  }

  private isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  private isValidJWT(token: string): boolean {
    // Basic JWT format validation (3 parts separated by dots)
    const parts = token.split('.');
    if (parts.length !== 3) return false;
    
    try {
      // Try to decode the header and payload
      const header = JSON.parse(atob(parts[0]));
      const payload = JSON.parse(atob(parts[1]));
      
      // Basic JWT structure validation
      return header.typ === 'JWT' && payload.iss && payload.exp;
    } catch {
      return false;
    }
  }

  // Reset validation state (useful for testing)
  reset(): void {
    this.validated = false;
    this.config = null;
  }
}

// Export singleton instance and validation function
export const envValidator = EnvironmentValidator.getInstance();
export const validateEnvironment = () => envValidator.validate();
export const getEnvConfig = () => envValidator.getConfig();

// Validate on module load in production
if (import.meta.env?.MODE === 'production') {
  validateEnvironment();
}