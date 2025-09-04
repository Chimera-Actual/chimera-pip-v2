// Authentication Validation
import { ValidationResult } from './types';

export const authValidation = {
  email: (email: string): ValidationResult => {
    const errors: string[] = [];
    
    if (!email) {
      errors.push('Email is required');
    } else {
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailPattern.test(email)) {
        errors.push('Email format is invalid');
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors,
    };
  },

  password: (password: string): ValidationResult => {
    const errors: string[] = [];
    const warnings: string[] = [];
    
    if (!password) {
      errors.push('Password is required');
      return { isValid: false, errors };
    }
    
    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long');
    }
    
    if (password.length < 12) {
      warnings.push('Consider using a longer password for better security');
    }
    
    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }
    
    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }
    
    if (!/[0-9]/.test(password)) {
      errors.push('Password must contain at least one number');
    }
    
    if (!/[^a-zA-Z0-9]/.test(password)) {
      errors.push('Password must contain at least one special character');
    }
    
    // Check for common weak patterns
    const commonPatterns = [
      'password', '123456', 'qwerty', 'admin', 'vault', 
      'chimera', 'pip', 'fallout', 'nuclear'
    ];
    
    if (commonPatterns.some(pattern => 
      password.toLowerCase().includes(pattern)
    )) {
      errors.push('Password contains common weak patterns');
    }
    
    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  },

  username: (username: string): ValidationResult => {
    const errors: string[] = [];
    
    if (username && username.length < 3) {
      errors.push('Username must be at least 3 characters long');
    }
    
    if (username && username.length > 20) {
      errors.push('Username must not exceed 20 characters');
    }
    
    if (username && !/^[a-zA-Z0-9_-]+$/.test(username)) {
      errors.push('Username can only contain letters, numbers, hyphens, and underscores');
    }
    
    return {
      isValid: errors.length === 0,
      errors,
    };
  },
};