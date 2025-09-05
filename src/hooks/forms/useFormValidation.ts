import { useState, useCallback, useRef, useEffect } from 'react';
import { ValidationSchema, ValidationResult } from '@/utils/validation/types';
import { Validator } from '@/utils/validation/core';

export interface FormField<T = any> {
  value: T;
  error?: string;
  touched: boolean;
  dirty: boolean;
}

export interface FormState<T extends Record<string, any>> {
  fields: { [K in keyof T]: FormField<T[K]> };
  isValid: boolean;
  isSubmitting: boolean;
  isDirty: boolean;
  errors: Record<string, string>;
}

export interface UseFormValidationOptions<T> {
  initialValues: T;
  validationSchema?: ValidationSchema;
  validateOnChange?: boolean;
  validateOnBlur?: boolean;
  onSubmit?: (values: T) => Promise<void> | void;
}

export function useFormValidation<T extends Record<string, any>>({
  initialValues,
  validationSchema,
  validateOnChange = true,
  validateOnBlur = true,
  onSubmit,
}: UseFormValidationOptions<T>) {
  
  const [formState, setFormState] = useState<FormState<T>>(() => ({
    fields: Object.keys(initialValues).reduce(
      (acc, key) => ({
        ...acc,
        [key]: {
          value: initialValues[key as keyof T],
          touched: false,
          dirty: false,
        },
      }),
      {} as { [K in keyof T]: FormField<T[K]> }
    ),
    isValid: true,
    isSubmitting: false,
    isDirty: false,
    errors: {},
  }));

  const validateField = useCallback((name: keyof T, value: any): string | undefined => {
    if (!validationSchema?.[name as string]) return undefined;
    
    const rules = validationSchema[name as string];
    const ruleArray = Array.isArray(rules) ? rules : [rules];
    
    for (const rule of ruleArray) {
      const result = Validator.validateField(value, rule, name as string);
      if (!result.isValid) {
        return result.errors[name as string]?.[0];
      }
    }
    
    return undefined;
  }, [validationSchema]);

  const validateForm = useCallback((): ValidationResult => {
    if (!validationSchema) {
      return { isValid: true, errors: {} };
    }

    const values = Object.keys(formState.fields).reduce(
      (acc, key) => ({
        ...acc,
        [key]: formState.fields[key as keyof T].value,
      }),
      {} as T
    );

    return Validator.validate(values, validationSchema);
  }, [formState.fields, validationSchema]);

  const setFieldValue = useCallback((name: keyof T, value: T[keyof T]) => {
    setFormState(prev => {
      const error = validateOnChange ? validateField(name, value) : undefined;
      
      return {
        ...prev,
        fields: {
          ...prev.fields,
          [name]: {
            ...prev.fields[name],
            value,
            dirty: true,
            error,
          },
        },
        isDirty: true,
      };
    });
  }, [validateField, validateOnChange]);

  const setFieldTouched = useCallback((name: keyof T, touched = true) => {
    setFormState(prev => {
      const field = prev.fields[name];
      const error = validateOnBlur && touched ? validateField(name, field.value) : field.error;
      
      return {
        ...prev,
        fields: {
          ...prev.fields,
          [name]: {
            ...field,
            touched,
            error,
          },
        },
      };
    });
  }, [validateField, validateOnBlur]);

  const setFieldError = useCallback((name: keyof T, error?: string) => {
    setFormState(prev => ({
      ...prev,
      fields: {
        ...prev.fields,
        [name]: {
          ...prev.fields[name],
          error,
        },
      },
    }));
  }, []);

  const resetForm = useCallback((newValues?: Partial<T>) => {
    const resetValues = { ...initialValues, ...newValues };
    
    setFormState({
      fields: Object.keys(resetValues).reduce(
        (acc, key) => ({
          ...acc,
          [key]: {
            value: resetValues[key as keyof T],
            touched: false,
            dirty: false,
          },
        }),
        {} as { [K in keyof T]: FormField<T[K]> }
      ),
      isValid: true,
      isSubmitting: false,
      isDirty: false,
      errors: {},
    });
  }, [initialValues]);

  const handleSubmit = useCallback(async (e?: React.FormEvent) => {
    e?.preventDefault();
    
    if (!onSubmit) return;
    
    setFormState(prev => ({ ...prev, isSubmitting: true }));
    
    try {
      const validation = validateForm();
      
      if (!validation.isValid) {
        setFormState(prev => ({
          ...prev,
          isSubmitting: false,
          isValid: false,
          errors: Object.keys(validation.errors).reduce(
            (acc, key) => ({
              ...acc,
              [key]: validation.errors[key][0],
            }),
            {}
          ),
        }));
        return;
      }

      const values = Object.keys(formState.fields).reduce(
        (acc, key) => ({
          ...acc,
          [key]: formState.fields[key as keyof T].value,
        }),
        {} as T
      );

      await onSubmit(values);
      
      setFormState(prev => ({ 
        ...prev, 
        isSubmitting: false,
        isValid: true,
        errors: {},
      }));
    } catch (error) {
      setFormState(prev => ({ ...prev, isSubmitting: false }));
      throw error;
    }
  }, [onSubmit, validateForm, formState.fields]);

  // Update overall form validity
  useEffect(() => {
    const validation = validateForm();
    setFormState(prev => ({
      ...prev,
      isValid: validation.isValid,
      errors: Object.keys(validation.errors).reduce(
        (acc, key) => ({
          ...acc,
          [key]: validation.errors[key][0],
        }),
        {}
      ),
    }));
  }, [validateForm]);

  const getFieldProps = useCallback((name: keyof T) => {
    const field = formState.fields[name];
    
    return {
      value: field.value,
      error: field.error,
      touched: field.touched,
      dirty: field.dirty,
      onChange: (value: T[keyof T]) => setFieldValue(name, value),
      onBlur: () => setFieldTouched(name, true),
    };
  }, [formState.fields, setFieldValue, setFieldTouched]);

  return {
    values: Object.keys(formState.fields).reduce(
      (acc, key) => ({
        ...acc,
        [key]: formState.fields[key as keyof T].value,
      }),
      {} as T
    ),
    fields: formState.fields,
    errors: formState.errors,
    isValid: formState.isValid,
    isSubmitting: formState.isSubmitting,
    isDirty: formState.isDirty,
    setFieldValue,
    setFieldTouched,
    setFieldError,
    resetForm,
    handleSubmit,
    getFieldProps,
    validateForm,
  };
}