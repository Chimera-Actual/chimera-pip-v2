import React, { createContext, useContext, useState } from 'react';
import { cn } from '@/lib/utils';

interface FormContextValue {
  errors: Record<string, string>;
  setFieldError: (field: string, error: string) => void;
  clearFieldError: (field: string) => void;
  clearAllErrors: () => void;
}

const FormContext = createContext<FormContextValue | undefined>(undefined);

export const useFormContext = () => {
  const context = useContext(FormContext);
  if (!context) {
    throw new Error('useFormContext must be used within an AccessibleForm');
  }
  return context;
};

interface AccessibleFormProps extends React.FormHTMLAttributes<HTMLFormElement> {
  children: React.ReactNode;
  onSubmit?: (event: React.FormEvent<HTMLFormElement>) => void;
  errors?: Record<string, string>;
}

export const AccessibleForm: React.FC<AccessibleFormProps> = ({
  children,
  onSubmit,
  errors: externalErrors = {},
  className,
  ...props
}) => {
  const [internalErrors, setInternalErrors] = useState<Record<string, string>>({});
  
  // Merge external and internal errors
  const errors = { ...internalErrors, ...externalErrors };

  const setFieldError = (field: string, error: string) => {
    setInternalErrors(prev => ({ ...prev, [field]: error }));
  };

  const clearFieldError = (field: string) => {
    setInternalErrors(prev => {
      const { [field]: removed, ...rest } = prev;
      return rest;
    });
  };

  const clearAllErrors = () => {
    setInternalErrors({});
  };

  const contextValue: FormContextValue = {
    errors,
    setFieldError,
    clearFieldError,
    clearAllErrors,
  };

  return (
    <FormContext.Provider value={contextValue}>
      <form
        className={cn('space-y-6', className)}
        noValidate // We handle validation ourselves
        onSubmit={onSubmit}
        {...props}
      >
        {children}
      </form>
    </FormContext.Provider>
  );
};

interface AccessibleFieldProps {
  children: React.ReactNode;
  name: string;
  label: string;
  description?: string;
  required?: boolean;
  className?: string;
}

export const AccessibleField: React.FC<AccessibleFieldProps> = ({
  children,
  name,
  label,
  description,
  required = false,
  className,
}) => {
  const { errors } = useFormContext();
  const error = errors[name];
  const fieldId = `field-${name}`;
  const descriptionId = description ? `${fieldId}-description` : undefined;
  const errorId = error ? `${fieldId}-error` : undefined;

  return (
    <div className={cn('space-y-2', className)}>
      <label
        htmlFor={fieldId}
        className="block text-sm font-medium text-foreground"
      >
        {label}
        {required && (
          <span className="ml-1 text-destructive" aria-label="required">
            *
          </span>
        )}
      </label>
      
      {description && (
        <p id={descriptionId} className="text-sm text-muted-foreground">
          {description}
        </p>
      )}

      <div className="relative">
        {React.cloneElement(children as React.ReactElement, {
          id: fieldId,
          name,
          'aria-describedby': [descriptionId, errorId].filter(Boolean).join(' ') || undefined,
          'aria-invalid': !!error,
          'aria-required': required,
          className: cn(
            (children as React.ReactElement).props.className,
            error && 'border-destructive focus:border-destructive focus:ring-destructive'
          ),
        })}
      </div>

      {error && (
        <p
          id={errorId}
          className="text-sm text-destructive"
          role="alert"
          aria-live="polite"
        >
          {error}
        </p>
      )}
    </div>
  );
};

// Validation helper
export const useFieldValidation = (name: string) => {
  const { setFieldError, clearFieldError } = useFormContext();

  const validate = (value: any, rules: ValidationRule[]) => {
    for (const rule of rules) {
      const error = rule(value);
      if (error) {
        setFieldError(name, error);
        return false;
      }
    }
    clearFieldError(name);
    return true;
  };

  return { validate };
};

type ValidationRule = (value: any) => string | null;

export const validationRules = {
  required: (message = 'This field is required'): ValidationRule => 
    (value) => (!value || (typeof value === 'string' && !value.trim())) ? message : null,

  minLength: (min: number, message?: string): ValidationRule =>
    (value) => value && value.length < min ? 
      (message || `Must be at least ${min} characters`) : null,

  maxLength: (max: number, message?: string): ValidationRule =>
    (value) => value && value.length > max ? 
      (message || `Must be no more than ${max} characters`) : null,

  email: (message = 'Please enter a valid email address'): ValidationRule =>
    (value) => value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? message : null,

  pattern: (regex: RegExp, message: string): ValidationRule =>
    (value) => value && !regex.test(value) ? message : null,
};