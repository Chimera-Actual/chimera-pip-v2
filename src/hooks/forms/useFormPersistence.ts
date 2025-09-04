// Form Persistence Hook
import { useEffect } from 'react';
import { useLocalStorage } from '../core/useLocalStorage';

export function useFormPersistence<T extends Record<string, any>>(
  formKey: string,
  values: T,
  setValue: (name: keyof T, value: any) => void,
  options?: {
    exclude?: (keyof T)[];
    autoClear?: boolean;
    clearOnSubmit?: boolean;
  }
) {
  const { exclude = [], autoClear = false } = options || {};
  const [persistedValues, setPersisted, clearPersisted] = useLocalStorage(
    `form_${formKey}`,
    {} as Partial<T>
  );

  // Load persisted values on mount
  useEffect(() => {
    Object.keys(persistedValues).forEach(key => {
      const typedKey = key as keyof T;
      if (!exclude.includes(typedKey) && persistedValues[typedKey] !== undefined) {
        setValue(typedKey, persistedValues[typedKey]);
      }
    });
  }, []);

  // Persist values when they change
  useEffect(() => {
    const valuesToPersist = Object.keys(values).reduce((acc, key) => {
      const typedKey = key as keyof T;
      if (!exclude.includes(typedKey)) {
        acc[typedKey] = values[typedKey];
      }
      return acc;
    }, {} as Partial<T>);

    setPersisted(valuesToPersist);
  }, [values, exclude, setPersisted]);

  const clearPersistedData = () => {
    clearPersisted();
  };

  const saveFormData = () => {
    setPersisted(values);
  };

  return {
    clearPersistedData,
    saveFormData,
    hasPersistentData: Object.keys(persistedValues).length > 0,
  };
}