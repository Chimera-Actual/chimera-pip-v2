import { useState, useEffect, memo, useCallback } from 'react';
import { TabConfiguration } from '@/types/tabManagement';
import { reportError } from '@/lib/errorReporting';
import { Button } from '@/components/ui/button';
import { Edit, Palette, Info } from 'lucide-react';
import { SettingsModal } from '@/components/ui/SettingsModal';
import { SettingsInput } from '@/components/ui/SettingsControls';
import { PrimarySettingsGroup, SecondarySettingsGroup } from '@/components/ui/SettingsGroupEnhanced';
import { IconSelectionModal } from '@/components/ui/IconSelectionModal';
import { getTabIcon } from '@/utils/iconMapping';
import { validateTabName, TabValidationResult } from '@/utils/validation/tabValidation';

interface TabEditorProps {
  tab?: TabConfiguration;
  isOpen: boolean;
  onClose: () => void;
  onSave: (tabData: Partial<TabConfiguration>) => Promise<void>;
  existingTabs?: Array<{ name: string; isDefault: boolean; id: string }>;
}

const colorOptions = [
  { value: '', label: 'Default', color: 'transparent' },
  { value: 'hsl(var(--pip-green-primary))', label: 'Green', color: 'hsl(var(--pip-green-primary))' },
  { value: 'hsl(45 100% 55%)', label: 'Amber', color: 'hsl(45 100% 55%)' },
  { value: 'hsl(207 100% 55%)', label: 'Blue', color: 'hsl(207 100% 55%)' },
  { value: 'hsl(0 100% 55%)', label: 'Red', color: 'hsl(0 100% 55%)' },
  { value: 'hsl(var(--pip-text-bright))', label: 'White', color: 'hsl(var(--pip-text-bright))' },
  { value: 'hsl(300 100% 55%)', label: 'Magenta', color: 'hsl(300 100% 55%)' },
  { value: 'hsl(180 100% 55%)', label: 'Cyan', color: 'hsl(180 100% 55%)' },
];

export const TabEditor = memo(({ tab, isOpen, onClose, onSave, existingTabs = [] }: TabEditorProps) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    icon: 'FolderIcon',
    color: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showIconModal, setShowIconModal] = useState(false);
  const [validation, setValidation] = useState<TabValidationResult>({ isValid: true, errors: [], warnings: [] });
  const [nameError, setNameError] = useState<string>('');

  useEffect(() => {
    if (tab) {
      setFormData({
        name: tab.name,
        description: tab.description,
        icon: tab.icon,
        color: tab.color || '',
      });
    } else {
      setFormData({
        name: '',
        description: '',
        icon: 'FolderIcon',
        color: '',
      });
    }
    // Reset validation when tab changes
    setValidation({ isValid: true, errors: [], warnings: [] });
    setNameError('');
  }, [tab, isOpen]);

  // Real-time validation
  const validateName = useCallback((name: string) => {
    const result = validateTabName(name, {
      existingTabs,
      isEditing: !!tab,
      currentTabId: tab?.id
    });
    
    setValidation(result);
    setNameError(result.errors[0] || '');
    return result.isValid;
  }, [existingTabs, tab]);

  // Handle name changes with real-time validation
  const handleNameChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value;
    setFormData(prev => ({ ...prev, name: newName }));
    
    // Validate in real-time for immediate feedback
    if (newName.trim()) {
      validateName(newName.trim());
    } else {
      setNameError('');
      setValidation({ isValid: false, errors: [], warnings: [] });
    }
  }, [validateName]);

  const isDirty = formData.name.trim() !== (tab?.name || '') ||
    formData.description.trim() !== (tab?.description || '') ||
    formData.icon !== (tab?.icon || 'FolderIcon') ||
    formData.color !== (tab?.color || '');

  const canSave = validation.isValid && formData.name.trim() && !isSubmitting;

  const handleSubmit = useCallback(async () => {
    const trimmedName = formData.name.trim();
    
    if (!trimmedName) {
      setNameError('Tab name cannot be empty');
      return;
    }

    // Final validation before submit
    if (!validateName(trimmedName)) {
      return;
    }

    // Check for default tab editing restriction
    if (tab?.isDefault && trimmedName !== tab.name) {
      setNameError('Cannot rename default tabs');
      return;
    }

    // Don't submit if validation fails or already submitting
    if (!canSave) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      await onSave({
        name: trimmedName,
        description: formData.description.trim(),
        icon: formData.icon,
        color: formData.color || undefined,
      });
      onClose();
    } catch (error) {
      console.error('Failed to save tab:', error);
      reportError('Failed to save tab');
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, onSave, onClose, validateName, tab, canSave]);

  const sections = [
    {
      id: 'basic',
      title: 'Basic Information',
      content: (
        <PrimarySettingsGroup title="Tab Configuration" description="Essential information for your new tab">
          <SettingsInput
            label="Tab Name"
            description={tab?.isDefault ? "Default tabs cannot be renamed" : "Enter a unique name for your tab"}
            value={formData.name}
            onChange={(value) => {
              setFormData(prev => ({ ...prev, name: value }));
              if (value.trim()) {
                validateName(value.trim());
              } else {
                setNameError('');
                setValidation({ isValid: false, errors: [], warnings: [] });
              }
            }}
            placeholder="MY_CUSTOM_TAB"
            disabled={tab?.isDefault || isSubmitting}
          />
          {nameError && (
            <p className="text-sm text-red-400 font-pip-mono mt-1">
              {nameError}
            </p>
          )}
          {validation.warnings.length > 0 && !nameError && (
            <p className="text-sm text-yellow-400 font-pip-mono mt-1">
              ⚠ {validation.warnings[0]}
            </p>
          )}
          
          <SettingsInput
            label="Description"
            description="Describe what this tab is for (optional)"
            value={formData.description}
            onChange={(value) => setFormData(prev => ({ ...prev, description: value }))}
            placeholder="DESCRIBE WHAT THIS TAB IS FOR..."
            type="text"
          />
        </PrimarySettingsGroup>
      )
    },
    {
      id: 'appearance',
      title: 'Visual Customization',
      content: (
        <SecondarySettingsGroup title="Appearance & Branding" description="Customize the visual identity of your tab">
          <div className="space-y-6">
            <div className="space-y-3">
              <h4 className="text-sm font-bold font-pip-mono text-pip-green-primary uppercase tracking-wide">
                ICON SELECTION
              </h4>
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-12 h-12 rounded border border-pip-border bg-pip-bg-tertiary/50 pip-glow">
                  {(() => {
                    const IconComponent = getTabIcon('', formData.icon);
                    return <IconComponent className="h-6 w-6 text-pip-green-primary" />;
                  })()}
                </div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowIconModal(true)}
                  className="flex-1 border-pip-border text-pip-text-secondary hover:border-pip-green-secondary hover:text-pip-green-secondary font-pip-mono"
                >
                  SELECT ICON ({formData.icon.replace('Icon', '').toUpperCase()})
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-sm font-bold font-pip-mono text-pip-green-primary uppercase tracking-wide">
                ACCENT COLOR [OPTIONAL]
              </h4>
              <div className="flex gap-2 flex-wrap">
                {colorOptions.map((colorOption) => (
                  <button
                    key={colorOption.value}
                    type="button"
                    className={`w-10 h-10 rounded-full border-2 transition-all pip-button-glow ${
                      formData.color === colorOption.value
                        ? 'border-pip-green-primary shadow-lg shadow-pip-green-glow pip-glow'
                        : 'border-pip-border hover:border-pip-green-secondary'
                    }`}
                    style={{ 
                      backgroundColor: colorOption.color || 'transparent',
                      backgroundImage: colorOption.color === '' ? 'linear-gradient(45deg, transparent 40%, hsl(var(--destructive) / 0.8) 50%, transparent 60%)' : undefined
                    }}
                    onClick={() => setFormData(prev => ({ ...prev, color: colorOption.value }))}
                    title={colorOption.label}
                  />
                ))}
              </div>
            </div>
          </div>
        </SecondarySettingsGroup>
      )
    }
  ];

  return (
    <>
      <SettingsModal
        isOpen={isOpen}
        onClose={onClose}
        title={tab ? 'EDIT TAB' : 'CREATE NEW TAB'}
        description="TAB_MANAGEMENT_PROTOCOL_v2.1"
        onSave={handleSubmit}
        isDirty={isDirty}
        isLoading={isSubmitting}
      >
        {sections.map((section) => (
          <div key={section.id}>
            {section.content}
          </div>
        ))}
      </SettingsModal>
      
      <IconSelectionModal
        isOpen={showIconModal}
        onClose={() => setShowIconModal(false)}
        onSelect={(iconName) => setFormData(prev => ({ ...prev, icon: iconName }))}
        selectedIcon={formData.icon}
        title="Select Tab Icon"
      />
    </>
  );
});