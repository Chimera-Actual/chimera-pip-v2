// Tab Validation Utilities for Production-Ready Tab Management

export interface TabValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export interface TabValidationContext {
  existingTabs: Array<{ name: string; isDefault: boolean; id: string }>;
  isEditing: boolean;
  currentTabId?: string;
}

// Reserved tab names that cannot be used for custom tabs
export const RESERVED_TAB_NAMES = ['INV', 'STAT', 'DATA', 'MAP', 'RADIO'] as const;

// Default tab names that cannot be renamed or deleted
export const DEFAULT_TAB_NAMES = ['MAIN'] as const;

/**
 * Validates tab name for creation or update
 */
export const validateTabName = (
  name: string,
  context: TabValidationContext
): TabValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Basic validation
  if (!name || name.trim() === '') {
    errors.push('Tab name cannot be empty');
    return { isValid: false, errors, warnings };
  }

  const trimmedName = name.trim();

  // Length validation
  if (trimmedName.length > 20) {
    errors.push('Tab name cannot exceed 20 characters');
  }

  if (trimmedName.length < 2) {
    errors.push('Tab name must be at least 2 characters long');
  }

  // Reserved names validation for custom tabs
  if (RESERVED_TAB_NAMES.includes(trimmedName as any)) {
    errors.push(`"${trimmedName}" is reserved for system use. Please choose a different name.`);
  }

  // Duplicate name validation
  const duplicateTab = context.existingTabs.find(tab => 
    tab.name.toLowerCase() === trimmedName.toLowerCase() && 
    (!context.isEditing || tab.id !== context.currentTabId)
  );

  if (duplicateTab) {
    errors.push(`A tab named "${trimmedName}" already exists`);
  }

  // Default tab renaming prevention
  if (context.isEditing && context.currentTabId) {
    const currentTab = context.existingTabs.find(tab => tab.id === context.currentTabId);
    if (currentTab?.isDefault && currentTab.name !== trimmedName) {
      errors.push(`Cannot rename default tab "${currentTab.name}"`);
    }
  }

  // Character validation
  const invalidChars = /[<>:"/\\|?*\x00-\x1f]/;
  if (invalidChars.test(trimmedName)) {
    errors.push('Tab name contains invalid characters');
  }

  // Warnings for potentially confusing names
  if (trimmedName.toLowerCase().includes('main') && trimmedName !== 'MAIN') {
    warnings.push('Tab names similar to "MAIN" might be confusing');
  }

  if (trimmedName.match(/^\d+$/)) {
    warnings.push('Numeric-only names might be confusing');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
};

/**
 * Validates tab data for creation
 */
export const validateTabCreation = (
  tabData: { name: string; description?: string },
  context: TabValidationContext
): TabValidationResult => {
  const nameValidation = validateTabName(tabData.name, context);
  
  const errors = [...nameValidation.errors];
  const warnings = [...nameValidation.warnings];

  // Description validation
  if (tabData.description && tabData.description.length > 100) {
    errors.push('Description cannot exceed 100 characters');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
};

/**
 * Validates if a tab can be deleted or archived
 */
export const validateTabDeletion = (
  tabId: string,
  tabs: Array<{ id: string; isDefault: boolean; name: string }>
): TabValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];

  const tab = tabs.find(t => t.id === tabId);
  
  if (!tab) {
    errors.push('Tab not found');
    return { isValid: false, errors, warnings };
  }

  if (tab.isDefault) {
    errors.push(`Cannot delete default tab "${tab.name}"`);
  }

  // Warn if it's the last custom tab
  const customTabs = tabs.filter(t => !t.isDefault);
  if (customTabs.length === 1 && customTabs[0].id === tabId) {
    warnings.push('This is your last custom tab');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
};