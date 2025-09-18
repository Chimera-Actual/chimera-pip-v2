import { useState, useEffect, memo, useCallback } from 'react';
import { TabConfiguration } from '@/types/tabManagement';
import { reportError } from '@/lib/errorReporting';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { BaseSettingsModal } from '@/components/ui/BaseSettingsModal';
import { IconSelectionModal } from '@/components/ui/IconSelectionModal';
import { getTabIcon } from '@/utils/iconMapping';

interface TabEditorProps {
  tab?: TabConfiguration;
  isOpen: boolean;
  onClose: () => void;
  onSave: (tabData: Partial<TabConfiguration>) => Promise<void>;
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

export const TabEditor = memo(({ tab, isOpen, onClose, onSave }: TabEditorProps) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    icon: 'FolderIcon',
    color: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showIconModal, setShowIconModal] = useState(false);

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
  }, [tab, isOpen]);

  const handleSubmit = useCallback(async () => {
    if (!formData.name.trim()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      await onSave({
        name: formData.name.trim(),
        description: formData.description.trim(),
        icon: formData.icon,
        color: formData.color || undefined,
      });
      onClose();
    } catch (error) {
      reportError('Failed to save tab');
    } finally {
      setIsSubmitting(false);
    }
  }, [formData, onSave, onClose]);

  const isDirty = formData.name.trim() !== (tab?.name || '') ||
    formData.description.trim() !== (tab?.description || '') ||
    formData.icon !== (tab?.icon || 'FolderIcon') ||
    formData.color !== (tab?.color || '');

  return (
    <>
      <BaseSettingsModal
        isOpen={isOpen}
        onClose={onClose}
        title={tab ? 'EDIT TAB' : 'CREATE NEW TAB'}
        description="TAB_MANAGEMENT_PROTOCOL_v2.1"
        size="large"
        onSave={handleSubmit}
        saveLabel={tab ? 'UPDATE TAB' : 'CREATE TAB'}
        isDirty={isDirty}
        isLoading={isSubmitting}
        className="pip-widget-dialog"
      >
        <div className="space-y-6 overflow-y-auto max-h-[60vh] pr-2 custom-scrollbar">
          {/* Tab Name */}
          <div className="space-y-2">
            <Label htmlFor="tab-name" className="text-sm font-bold font-pip-mono text-pip-green-primary uppercase tracking-wide">
              TAB NAME
            </Label>
            <Input
              id="tab-name"
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="MY_CUSTOM_TAB"
              className="bg-pip-bg-tertiary/80 border-pip-border focus:border-pip-green-primary font-pip-mono text-pip-green-primary placeholder:text-pip-text-muted pip-glow"
              required
              maxLength={20}
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="tab-description" className="text-sm font-bold font-pip-mono text-pip-green-primary uppercase tracking-wide">
              DESCRIPTION
            </Label>
            <Textarea
              id="tab-description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="DESCRIBE WHAT THIS TAB IS FOR..."
              rows={3}
              className="bg-pip-bg-tertiary/80 border-pip-border focus:border-pip-green-primary font-pip-mono text-pip-green-primary placeholder:text-pip-text-muted resize-none pip-glow"
              maxLength={100}
            />
          </div>

          {/* Icon Selection */}
          <div className="space-y-3">
            <Label className="text-sm font-bold font-pip-mono text-pip-green-primary uppercase tracking-wide">
              ICON SELECTION
            </Label>
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

          {/* Color Selection */}
          <div className="space-y-2">
            <Label className="text-sm font-bold font-pip-mono text-pip-green-primary uppercase tracking-wide">
              ACCENT COLOR [OPTIONAL]
            </Label>
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
                    backgroundImage: colorOption.color === '' ? 'linear-gradient(45deg, transparent 40%, rgba(255, 0, 0, 0.8) 50%, transparent 60%)' : undefined
                  }}
                  onClick={() => setFormData(prev => ({ ...prev, color: colorOption.value }))}
                  title={colorOption.label}
                />
              ))}
            </div>
          </div>
        </div>
      </BaseSettingsModal>
      
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