import { ValidationSchema } from './types';
import { commonRules } from './core';

export const authValidationSchemas = {
  login: {
    email: [commonRules.required, commonRules.email],
    password: [commonRules.required, { minLength: 6 }],
  } as ValidationSchema,

  register: {
    email: [commonRules.required, commonRules.email],
    password: [commonRules.required, commonRules.strongPassword],
    confirmPassword: [
      commonRules.required,
      {
        custom: (value: string, data: any) => value === data?.password,
        message: 'Passwords must match',
      },
    ],
    vaultNumber: [commonRules.required, commonRules.vaultNumber],
  } as ValidationSchema,

  characterCreation: {
    characterName: [
      commonRules.required,
      {
        minLength: 2,
        maxLength: 30,
        pattern: /^[a-zA-Z\s\-']+$/,
        message: 'Character name can only contain letters, spaces, hyphens, and apostrophes',
      },
    ],
    strength: [{ type: 'number', min: 1, max: 10 }],
    perception: [{ type: 'number', min: 1, max: 10 }],
    endurance: [{ type: 'number', min: 1, max: 10 }],
    charisma: [{ type: 'number', min: 1, max: 10 }],
    intelligence: [{ type: 'number', min: 1, max: 10 }],
    agility: [{ type: 'number', min: 1, max: 10 }],
    luck: [{ type: 'number', min: 1, max: 10 }],
  } as ValidationSchema,

  passwordReset: {
    email: [commonRules.required, commonRules.email],
  } as ValidationSchema,

  pinLogin: {
    pin: [
      commonRules.required,
      {
        type: 'string',
        pattern: /^\d{4,6}$/,
        message: 'PIN must be 4-6 digits',
      },
    ],
  } as ValidationSchema,

  biometricSetup: {
    backupMethod: [commonRules.required],
  } as ValidationSchema,
};

export const validateAuthForm = (formType: keyof typeof authValidationSchemas, data: any) => {
  const schema = authValidationSchemas[formType];
  if (!schema) {
    throw new Error(`Unknown auth form type: ${formType}`);
  }

  return authValidationSchemas[formType];
};