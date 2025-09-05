import { useCallback } from 'react';
import { useFormValidation } from './useFormValidation';
import { authValidationSchemas } from '@/utils/validation/authValidation';
import { useToast } from '@/hooks/use-toast';

export interface LoginFormData {
  email: string;
  password: string;
}

export interface RegisterFormData {
  email: string;
  password: string;
  confirmPassword: string;
  vaultNumber: string;
}

export interface CharacterCreationData {
  characterName: string;
  strength: number;
  perception: number;
  endurance: number;
  charisma: number;
  intelligence: number;
  agility: number;
  luck: number;
}

export interface PasswordResetData {
  email: string;
}

export interface PinLoginData {
  pin: string;
}

const defaultLoginValues: LoginFormData = {
  email: '',
  password: '',
};

const defaultRegisterValues: RegisterFormData = {
  email: '',
  password: '',
  confirmPassword: '',
  vaultNumber: '',
};

const defaultCharacterValues: CharacterCreationData = {
  characterName: '',
  strength: 5,
  perception: 5,
  endurance: 5,
  charisma: 5,
  intelligence: 5,
  agility: 5,
  luck: 5,
};

const defaultPasswordResetValues: PasswordResetData = {
  email: '',
};

const defaultPinValues: PinLoginData = {
  pin: '',
};

export function useLoginForm(onSubmit?: (data: LoginFormData) => Promise<void>) {
  const { toast } = useToast();

  const form = useFormValidation({
    initialValues: defaultLoginValues,
    validationSchema: authValidationSchemas.login,
    onSubmit: async (values) => {
      try {
        await onSubmit?.(values);
        toast({
          title: "Login Successful",
          description: "Welcome back, Vault Dweller!",
        });
      } catch (error) {
        toast({
          title: "Login Failed",
          description: error instanceof Error ? error.message : "Authentication failed",
          variant: "destructive",
        });
        throw error;
      }
    },
  });

  return form;
}

export function useRegisterForm(onSubmit?: (data: RegisterFormData) => Promise<void>) {
  const { toast } = useToast();

  const form = useFormValidation({
    initialValues: defaultRegisterValues,
    validationSchema: authValidationSchemas.register,
    onSubmit: async (values) => {
      try {
        await onSubmit?.(values);
        toast({
          title: "Registration Successful",
          description: "Welcome to the Vault, new dweller!",
        });
      } catch (error) {
        toast({
          title: "Registration Failed",
          description: error instanceof Error ? error.message : "Registration failed",
          variant: "destructive",
        });
        throw error;
      }
    },
  });

  return form;
}

export function useCharacterCreationForm(onSubmit?: (data: CharacterCreationData) => Promise<void>) {
  const { toast } = useToast();

  const form = useFormValidation({
    initialValues: defaultCharacterValues,
    validationSchema: authValidationSchemas.characterCreation,
    onSubmit: async (values) => {
      try {
        await onSubmit?.(values);
        toast({
          title: "Character Created",
          description: `Welcome, ${values.characterName}!`,
        });
      } catch (error) {
        toast({
          title: "Character Creation Failed",
          description: error instanceof Error ? error.message : "Character creation failed",
          variant: "destructive",
        });
        throw error;
      }
    },
  });

  const getTotalPoints = useCallback(() => {
    const { strength, perception, endurance, charisma, intelligence, agility, luck } = form.values;
    return strength + perception + endurance + charisma + intelligence + agility + luck;
  }, [form.values]);

  const getRemainingPoints = useCallback(() => {
    const maxPoints = 40; // Standard SPECIAL point allocation
    return maxPoints - getTotalPoints();
  }, [getTotalPoints]);

  const canAllocatePoint = useCallback((stat: keyof CharacterCreationData) => {
    if (typeof form.values[stat] !== 'number') return false;
    return form.values[stat] < 10 && getRemainingPoints() > 0;
  }, [form.values, getRemainingPoints]);

  const canDeallocatePoint = useCallback((stat: keyof CharacterCreationData) => {
    if (typeof form.values[stat] !== 'number') return false;
    return form.values[stat] > 1;
  }, [form.values]);

  const allocatePoint = useCallback((stat: keyof CharacterCreationData) => {
    if (canAllocatePoint(stat)) {
      form.setFieldValue(stat, (form.values[stat] as number) + 1);
    }
  }, [form, canAllocatePoint]);

  const deallocatePoint = useCallback((stat: keyof CharacterCreationData) => {
    if (canDeallocatePoint(stat)) {
      form.setFieldValue(stat, (form.values[stat] as number) - 1);
    }
  }, [form, canDeallocatePoint]);

  return {
    ...form,
    getTotalPoints,
    getRemainingPoints,
    canAllocatePoint,
    canDeallocatePoint,
    allocatePoint,
    deallocatePoint,
  };
}

export function usePasswordResetForm(onSubmit?: (data: PasswordResetData) => Promise<void>) {
  const { toast } = useToast();

  const form = useFormValidation({
    initialValues: defaultPasswordResetValues,
    validationSchema: authValidationSchemas.passwordReset,
    onSubmit: async (values) => {
      try {
        await onSubmit?.(values);
        toast({
          title: "Reset Email Sent",
          description: "Check your email for password reset instructions.",
        });
      } catch (error) {
        toast({
          title: "Reset Failed",
          description: error instanceof Error ? error.message : "Password reset failed",
          variant: "destructive",
        });
        throw error;
      }
    },
  });

  return form;
}

export function usePinLoginForm(onSubmit?: (data: PinLoginData) => Promise<void>) {
  const { toast } = useToast();

  const form = useFormValidation({
    initialValues: defaultPinValues,
    validationSchema: authValidationSchemas.pinLogin,
    onSubmit: async (values) => {
      try {
        await onSubmit?.(values);
        toast({
          title: "PIN Login Successful",
          description: "Access granted!",
        });
      } catch (error) {
        toast({
          title: "PIN Login Failed",
          description: error instanceof Error ? error.message : "Invalid PIN",
          variant: "destructive",
        });
        throw error;
      }
    },
  });

  return form;
}