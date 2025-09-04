import { ValidationRule, ValidationSchema, ValidationResult, ValidationError } from './types';

export class Validator {
  private static validateSingleRule<T>(
    value: T,
    rule: ValidationRule<T>,
    fieldName: string
  ): ValidationError[] {
    const errors: ValidationError[] = [];

    // Required validation
    if (rule.required && (value === null || value === undefined || value === '')) {
      errors.push({
        field: fieldName,
        value,
        rule: 'required',
        message: rule.message || `${fieldName} is required`,
      });
      return errors; // If required fails, don't run other validations
    }

    // Skip other validations if value is empty and not required
    if (value === null || value === undefined || value === '') {
      return errors;
    }

    // Type validation
    if (rule.type) {
      const isValidType = this.validateType(value, rule.type);
      if (!isValidType) {
        errors.push({
          field: fieldName,
          value,
          rule: 'type',
          message: rule.message || `${fieldName} must be of type ${rule.type}`,
        });
        return errors; // If type fails, don't run other validations
      }
    }

    // Number/string length validations
    if (typeof value === 'string' || typeof value === 'number') {
      const numValue = typeof value === 'string' ? value.length : value;

      if (rule.min !== undefined && numValue < rule.min) {
        const unit = typeof value === 'string' ? 'characters' : '';
        errors.push({
          field: fieldName,
          value,
          rule: 'min',
          message: rule.message || `${fieldName} must be at least ${rule.min} ${unit}`,
        });
      }

      if (rule.max !== undefined && numValue > rule.max) {
        const unit = typeof value === 'string' ? 'characters' : '';
        errors.push({
          field: fieldName,
          value,
          rule: 'max',
          message: rule.message || `${fieldName} must be at most ${rule.max} ${unit}`,
        });
      }
    }

    // String-specific validations
    if (typeof value === 'string') {
      if (rule.minLength !== undefined && value.length < rule.minLength) {
        errors.push({
          field: fieldName,
          value,
          rule: 'minLength',
          message: rule.message || `${fieldName} must be at least ${rule.minLength} characters`,
        });
      }

      if (rule.maxLength !== undefined && value.length > rule.maxLength) {
        errors.push({
          field: fieldName,
          value,
          rule: 'maxLength',
          message: rule.message || `${fieldName} must be at most ${rule.maxLength} characters`,
        });
      }

      // Pattern validation
      if (rule.pattern) {
        const regex = typeof rule.pattern === 'string' ? new RegExp(rule.pattern) : rule.pattern;
        if (!regex.test(value)) {
          errors.push({
            field: fieldName,
            value,
            rule: 'pattern',
            message: rule.message || `${fieldName} format is invalid`,
          });
        }
      }
    }

    // Custom validation
    if (rule.custom) {
      const customResult = rule.custom(value);
      if (customResult !== true) {
        errors.push({
          field: fieldName,
          value,
          rule: 'custom',
          message: typeof customResult === 'string' ? customResult : (rule.message || `${fieldName} is invalid`),
        });
      }
    }

    return errors;
  }

  private static validateType(value: any, type: string): boolean {
    switch (type) {
      case 'string':
        return typeof value === 'string';
      case 'number':
        return typeof value === 'number' && !isNaN(value);
      case 'boolean':
        return typeof value === 'boolean';
      case 'array':
        return Array.isArray(value);
      case 'object':
        return typeof value === 'object' && value !== null && !Array.isArray(value);
      case 'email':
        return typeof value === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
      case 'url':
        try {
          new URL(value);
          return true;
        } catch {
          return false;
        }
      default:
        return true;
    }
  }

  static validate(data: any, schema: ValidationSchema): ValidationResult {
    const errors: Record<string, string[]> = {};

    Object.entries(schema).forEach(([fieldName, rules]) => {
      const fieldValue = data[fieldName];
      const ruleArray = Array.isArray(rules) ? rules : [rules];
      const fieldErrors: string[] = [];

      ruleArray.forEach(rule => {
        const ruleErrors = this.validateSingleRule(fieldValue, rule, fieldName);
        fieldErrors.push(...ruleErrors.map(error => error.message));
      });

      if (fieldErrors.length > 0) {
        errors[fieldName] = fieldErrors;
      }
    });

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
    };
  }

  static validateField(value: any, rule: ValidationRule, fieldName: string): ValidationResult {
    const errors = this.validateSingleRule(value, rule, fieldName);
    
    return {
      isValid: errors.length === 0,
      errors: errors.length > 0 ? { [fieldName]: errors.map(e => e.message) } : {},
    };
  }
}

// Common validation rules
export const commonRules = {
  required: { required: true },
  email: { type: 'email' as const },
  url: { type: 'url' as const },
  nonEmpty: { required: true, minLength: 1 },
  positiveNumber: { type: 'number' as const, min: 0 },
  strongPassword: {
    type: 'string' as const,
    minLength: 8,
    pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
    message: 'Password must contain at least 8 characters with uppercase, lowercase, number, and special character',
  },
  vaultNumber: {
    type: 'number' as const,
    min: 1,
    max: 999,
    message: 'Vault number must be between 1 and 999',
  },
} as const;