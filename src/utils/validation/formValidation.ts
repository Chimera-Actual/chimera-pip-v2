// General Form Validation
import { ValidationResult, ValidationRule } from './types';

export const formValidation = {
  validateField: (value: any, rules: ValidationRule): ValidationResult => {
    const errors: string[] = [];
    
    if (rules.required && (!value || (typeof value === 'string' && value.trim() === ''))) {
      errors.push('This field is required');
    }
    
    if (value && rules.minLength && value.length < rules.minLength) {
      errors.push(`Must be at least ${rules.minLength} characters`);
    }
    
    if (value && rules.maxLength && value.length > rules.maxLength) {
      errors.push(`Must not exceed ${rules.maxLength} characters`);
    }
    
    if (value && rules.pattern && !rules.pattern.test(value)) {
      errors.push('Invalid format');
    }
    
    if (rules.custom && value) {
      const customResult = rules.custom(value);
      if (!customResult.isValid) {
        errors.push(...customResult.errors);
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors,
    };
  },

  validateForm: (values: Record<string, any>, schema: Record<string, ValidationRule>): ValidationResult => {
    const errors: string[] = [];
    
    Object.keys(schema).forEach(field => {
      const fieldResult = formValidation.validateField(values[field], schema[field]);
      if (!fieldResult.isValid) {
        errors.push(...fieldResult.errors.map(error => `${field}: ${error}`));
      }
    });
    
    return {
      isValid: errors.length === 0,
      errors,
    };
  },

  sanitizeInput: (value: string): string => {
    return value
      .trim()
      .replace(/[<>]/g, '') // Remove potential HTML tags
      .replace(/[^\w\s@.-]/g, ''); // Allow only safe characters
  },
};