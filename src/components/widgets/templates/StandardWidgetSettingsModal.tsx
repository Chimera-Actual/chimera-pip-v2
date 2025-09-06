import React, { useState, useCallback } from 'react';
import { BaseSettingsModal } from '@/components/ui/BaseSettingsModal';
import { useWidgetSettings } from '@/hooks/useWidgetSettings';
import { useWidgets } from '@/contexts/WidgetContext';
import { BaseWidget } from '@/types/widgets';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { IconPicker } from '../IconPicker';
import { SettingsSection } from './SettingsSection';
import { EnhancedSettingsField } from './EnhancedSettingsField';
import { ImportExportSection } from './ImportExportSection';
import { cn } from '@/lib/utils';
import { 
  Settings2, 
  Palette, 
  Plug, 
  Wrench, 
  AlertCircle, 
  AlertTriangle,
  Eye,
  EyeOff,
  LucideIcon
} from 'lucide-react';

export interface StandardWidgetSettingsModalProps {
  widgetId: string;
  widgetType: string;
  widgetTitle: string;
  isOpen: boolean;
  onClose: () => void;
  onSettingsChange?: (settings: any) => void;
  customSections?: React.ReactNode;
  hideStandardSections?: string[];
}

interface SettingsGroup {
  id: string;
  label: string;
  icon: LucideIcon;
  description: string;
}

const STANDARD_GROUPS: SettingsGroup[] = [
  {
    id: 'instance',
    label: 'Widget',
    icon: Settings2,
    description: 'Widget instance properties and display name'
  },
  {
    id: 'general',
    label: 'General',
    icon: Settings2,
    description: 'Basic widget configuration and behavior'
  },
  {
    id: 'display',
    label: 'Display',
    icon: Palette,
    description: 'Visual appearance and UI preferences'
  },
  {
    id: 'api',
    label: 'API',
    icon: Plug,
    description: 'External service connections and API keys'
  },
  {
    id: 'advanced',
    label: 'Advanced',
    icon: Wrench,
    description: 'Advanced settings and developer options'
  }
];

export const StandardWidgetSettingsModal: React.FC<StandardWidgetSettingsModalProps> = ({
  widgetId,
  widgetType,
  widgetTitle,
  isOpen,
  onClose,
  onSettingsChange,
  customSections,
  hideStandardSections = []
}) => {
  const { updateWidget, widgets } = useWidgets();
  const currentWidget = widgets.find(w => w.id === widgetId);

  const {
    settings,
    schema,
    isLoading,
    errors,
    isDirty,
    updateSetting,
    resetToDefaults,
    saveSettings,
    exportSettings,
    importSettings
  } = useWidgetSettings(widgetId, widgetType);

  // Instance settings state
  const [instanceTitle, setInstanceTitle] = useState(currentWidget?.title || widgetTitle);
  const [instanceIcon, setInstanceIcon] = useState(currentWidget?.customIcon || '');
  const [instanceSettingsDirty, setInstanceSettingsDirty] = useState(false);

  // UI state
  const [activeGroup, setActiveGroup] = useState('instance');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showImportExport, setShowImportExport] = useState(false);

  // Check if instance settings are dirty
  React.useEffect(() => {
    const titleChanged = instanceTitle !== (currentWidget?.title || widgetTitle);
    const iconChanged = instanceIcon !== (currentWidget?.customIcon || '');
    setInstanceSettingsDirty(titleChanged || iconChanged);
  }, [instanceTitle, instanceIcon, currentWidget, widgetTitle]);

  // Group settings by their group property
  const groupedSettings = React.useMemo(() => {
    if (!schema) return {};
    
    return Object.entries(schema.settingsSchema).reduce(
      (groups, [key, fieldSchema]) => {
        const group = fieldSchema.group || 'general';
        if (!groups[group]) groups[group] = [];
        groups[group].push([key, fieldSchema]);
        return groups;
      },
      {} as Record<string, Array<[string, any]>>
    );
  }, [schema]);

  // Available groups (excluding hidden ones and empty groups)
  const availableGroups = React.useMemo(() => {
    const standardGroups = STANDARD_GROUPS.filter(group => 
      !hideStandardSections.includes(group.id) &&
      (group.id === 'instance' || groupedSettings[group.id]?.length > 0)
    );
    
    return showAdvanced ? standardGroups : standardGroups.filter(g => g.id !== 'advanced');
  }, [groupedSettings, showAdvanced, hideStandardSections]);

  const handleSave = useCallback(async () => {
    try {
      // Save widget-specific settings
      const settingsSaved = await saveSettings();
      
      // Save instance settings if they're dirty
      if (instanceSettingsDirty && currentWidget) {
        await updateWidget(widgetId, {
          title: instanceTitle,
          customIcon: instanceIcon || undefined
        });
      }

      if (settingsSaved) {
        onSettingsChange?.(settings);
        onClose();
      }
    } catch (error) {
      console.error('Failed to save settings:', error);
    }
  }, [saveSettings, instanceSettingsDirty, currentWidget, updateWidget, widgetId, instanceTitle, instanceIcon, onSettingsChange, settings, onClose]);

  const handleReset = useCallback(async () => {
    await resetToDefaults();
    if (currentWidget) {
      setInstanceTitle(currentWidget.title);
      setInstanceIcon(currentWidget.customIcon || '');
    }
  }, [resetToDefaults, currentWidget]);

  const isSettingsDirty = isDirty || instanceSettingsDirty;
  const hasErrors = Object.keys(errors).length > 0;

  if (showImportExport) {
    return (
      <BaseSettingsModal
        isOpen={isOpen}
        onClose={() => setShowImportExport(false)}
        title={`${widgetTitle} - Import/Export`}
        description="Backup and restore widget settings"
        size="large"
        showSaveButton={false}
        showResetButton={false}
      >
        <ImportExportSection
          onExport={exportSettings}
          onImport={importSettings}
          onClose={() => setShowImportExport(false)}
        />
      </BaseSettingsModal>
    );
  }

  return (
    <BaseSettingsModal
      isOpen={isOpen}
      onClose={onClose}
      title={`${widgetTitle} Settings`}
      description="Configure widget instance and behavior settings"
      size="large"
      onSave={handleSave}
      onReset={handleReset}
      isDirty={isSettingsDirty}
      isLoading={isLoading}
    >
      {isLoading ? (
        <div className="flex flex-col items-center justify-center h-full gap-4 text-primary">
          <div className="w-8 h-8 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
          <span className="text-sm uppercase tracking-wide font-pip-mono">Loading settings...</span>
        </div>
      ) : (
        <div className="h-full flex flex-col">
          {/* Header Controls */}
          <div className="flex items-center justify-between gap-4 mb-6 pb-4 border-b border-pip-border/30">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="font-pip-mono text-xs"
              >
                {showAdvanced ? <EyeOff className="h-3 w-3 mr-1" /> : <Eye className="h-3 w-3 mr-1" />}
                {showAdvanced ? 'Basic' : 'Advanced'}
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowImportExport(true)}
                className="font-pip-mono text-xs"
              >
                Import/Export
              </Button>
            </div>

            {/* Status Indicators */}
            <div className="flex items-center gap-3">
              {isSettingsDirty && (
                <Badge variant="secondary" className="gap-1">
                  <AlertCircle className="w-3 h-3" />
                  Unsaved Changes
                </Badge>
              )}
              {hasErrors && (
                <Badge variant="destructive" className="gap-1">
                  <AlertTriangle className="w-3 h-3" />
                  {Object.keys(errors).length} Error{Object.keys(errors).length !== 1 ? 's' : ''}
                </Badge>
              )}
            </div>
          </div>

          {/* Group Navigation */}
          {availableGroups.length > 1 && (
            <div className="flex border border-pip-border/30 rounded-lg bg-pip-bg-secondary/20 p-1 mb-6">
              {availableGroups.map(group => {
                const Icon = group.icon;
                const isActive = activeGroup === group.id;
                
                return (
                  <button
                    key={group.id}
                    className={cn(
                      "flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-md text-xs font-pip-mono transition-all",
                      isActive
                        ? "bg-primary/20 text-primary border border-primary/30 pip-text-glow"
                        : "text-pip-text-muted hover:text-primary hover:bg-primary/5"
                    )}
                    onClick={() => setActiveGroup(group.id)}
                  >
                    <Icon className="h-3 w-3" />
                    <span className="uppercase tracking-wide">{group.label}</span>
                  </button>
                );
              })}
            </div>
          )}

          {/* Settings Content */}
          <div className="flex-1 overflow-hidden">
            <div className="h-full overflow-y-auto pip-scrollbar">
              {/* Widget Instance Settings */}
              {activeGroup === 'instance' && !hideStandardSections.includes('instance') && (
                <SettingsSection
                  title="Widget Instance"
                  description="Customize this widget's display name and appearance"
                  icon={Settings2}
                >
                  <div className="space-y-4">
                    <div>
                      <Label className="text-sm font-semibold text-primary uppercase tracking-wide font-pip-mono">
                        Widget Name
                      </Label>
                      <p className="text-xs text-pip-text-muted mb-2 font-pip-mono">
                        Customize the display name for this widget instance
                      </p>
                      <Input
                        type="text"
                        value={instanceTitle}
                        onChange={(e) => setInstanceTitle(e.target.value)}
                        placeholder="Enter widget name..."
                        className="bg-pip-bg-secondary/50 border-pip-border focus:border-primary font-pip-mono"
                      />
                    </div>

                    <div>
                      <Label className="text-sm font-semibold text-primary uppercase tracking-wide font-pip-mono">
                        Widget Icon
                      </Label>
                      <p className="text-xs text-pip-text-muted mb-2 font-pip-mono">
                        Choose an icon to represent this widget
                      </p>
                      <IconPicker
                        selectedIcon={instanceIcon}
                        onIconSelect={setInstanceIcon}
                        triggerClassName="w-full"
                      />
                    </div>
                  </div>
                </SettingsSection>
              )}

              {/* Widget-Specific Settings Sections */}
              {availableGroups
                .filter(group => group.id !== 'instance')
                .map(group => {
                  if (activeGroup !== group.id) return null;
                  
                  const groupSettings = groupedSettings[group.id] || [];
                  if (groupSettings.length === 0) return null;
                  
                  return (
                    <SettingsSection
                      key={group.id}
                      title={group.label}
                      description={group.description}
                      icon={group.icon}
                    >
                      <div className="space-y-6">
                        {groupSettings.map(([fieldKey, fieldSchema]) => (
                          <EnhancedSettingsField
                            key={fieldKey}
                            fieldKey={fieldKey}
                            fieldSchema={fieldSchema}
                            value={settings[fieldKey] as string | number | boolean | string[] | undefined}
                            error={errors[fieldKey as string]}
                            onChange={(value) => updateSetting(fieldKey as string, value)}
                          />
                        ))}
                      </div>
                    </SettingsSection>
                  );
                })}

              {/* Custom Sections */}
              {customSections && (
                <div className="mt-6">
                  {customSections}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </BaseSettingsModal>
  );
};