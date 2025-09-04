// Authentication Form Hook
import { useState } from 'react';
import { useFormValidation, ValidationSchema } from './useFormValidation';
import { authService } from '@/services/auth/authService';
import { useToast } from '@/hooks/use-toast';

interface LoginForm {
  email: string;
  password: string;
}

interface RegisterForm extends LoginForm {
  confirmPassword: string;
  username?: string;
}

const loginSchema: ValidationSchema = {
  email: {
    required: true,
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  },
  password: {
    required: true,
    minLength: 8,
  },
};

const registerSchema: ValidationSchema = {
  ...loginSchema,
  confirmPassword: {
    required: true,
    custom: (value: string, formValues?: RegisterForm) => {
      if (formValues && value !== formValues.password) {
        return 'Passwords do not match';
      }
      return null;
    },
  },
  username: {
    minLength: 3,
    maxLength: 20,
  },
};

export function useAuthForm(type: 'login' | 'register' = 'login') {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const initialValues = type === 'login' 
    ? { email: '', password: '' }
    : { email: '', password: '', confirmPassword: '', username: '' };

  const schema = type === 'login' ? loginSchema : registerSchema;

  const {
    values,
    errors,
    touched,
    isValid,
    setValue,
    setTouched,
    validateAll,
    reset,
  } = useFormValidation(initialValues, schema);

  const handleSubmit = async (onSuccess?: (user: any) => void) => {
    if (!validateAll()) {
      toast({
        title: 'Validation Error',
        description: 'Please fix the errors in the form',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      if (type === 'login') {
        const result = await authService.signIn({
          email: values.email,
          password: values.password,
        });

        if (!result.success) {
          throw new Error(result.error || 'Login failed');
        }

        toast({
          title: 'Welcome back!',
          description: 'You have been logged in successfully.',
        });

        onSuccess?.(result.data);
      } else {
        const result = await authService.signUp({
          email: values.email,
          password: values.password,
          username: (values as RegisterForm).username,
        });

        if (!result.success) {
          throw new Error(result.error || 'Registration failed');
        }

        toast({
          title: 'Account created!',
          description: 'Please check your email to verify your account.',
        });

        onSuccess?.(result.data);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Authentication failed';
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (name: string, value: string) => {
    setValue(name as keyof typeof values, value);
  };

  const handleBlur = (name: string) => {
    setTouched(name as keyof typeof values);
  };

  return {
    values,
    errors,
    touched,
    isValid,
    isSubmitting,
    handleChange,
    handleBlur,
    handleSubmit,
    reset,
  };
}