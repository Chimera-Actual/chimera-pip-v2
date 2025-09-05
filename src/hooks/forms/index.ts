// Form Hooks for Chimera-PIP 4000 mk2

export { useFormValidation } from './useFormValidation';
export type { 
  FormField, 
  FormState, 
  UseFormValidationOptions 
} from './useFormValidation';

export {
  useLoginForm,
  useRegisterForm,
  useCharacterCreationForm,
  usePasswordResetForm,
  usePinLoginForm,
} from './useAuthForm';
export type {
  LoginFormData,
  RegisterFormData,
  CharacterCreationData,
  PasswordResetData,
  PinLoginData,
} from './useAuthForm';

export {
  useFormPersistence,
  useFormAutoRestore,
  useFormDraftStatus,
} from './useFormPersistence';
export type {
  FormPersistenceOptions,
  FormPersistenceResult,
} from './useFormPersistence';