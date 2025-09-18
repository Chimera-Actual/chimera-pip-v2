import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TestTube, Grid3X3, Settings, AlertCircle } from 'lucide-react';
import { UniversalSettingsTemplate } from '@/components/settings/UniversalSettingsTemplate';
import { SettingsInput, SettingsSelect, SettingsGroup } from '@/components/settings/SettingsControls';
import { TagManager } from './TagManager';
import { useWidgetTags } from '@/hooks/useWidgetTags';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import type { SettingsSection } from '@/types/settings';

interface WidgetTypeData {
  id: string;
  widget_type: string;
  name: string;
  description: string;
  icon: string;
  default_settings: any;
  user_id?: string;
  created_at: string;
  updated_at: string;
}

interface WidgetTypeSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  widgetType: WidgetTypeData | null;
  onSave: () => void;
}

const availableIcons = [
  { name: 'TestTube', label: 'Test Tube', Icon: TestTube },
  { name: 'Grid3X3', label: 'Grid', Icon: Grid3X3 },
  { name: 'Settings', label: 'Settings', Icon: Settings },
];

export const WidgetTypeSettingsModal: React.FC<WidgetTypeSettingsModalProps> = ({
  isOpen,
  onClose,
  widgetType,
  onSave
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { getWidgetTags, setWidgetTags } = useWidgetTags();
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    icon: 'Grid3X3',
    default_settings: {}
  });
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const canEdit = widgetType?.user_id === user?.id;
  const isSystemWidget = !widgetType?.user_id;

  useEffect(() => {
    if (isOpen && widgetType) {
      setFormData({
        name: widgetType.name,
        description: widgetType.description,
        icon: widgetType.icon,
        default_settings: widgetType.default_settings || {}
      });
      
      // Load widget tags
      loadWidgetTags();
    }
  }, [isOpen, widgetType]);

  const loadWidgetTags = async () => {
    if (!widgetType) return;
    
    setIsLoading(true);
    try {
      const tags = await getWidgetTags(widgetType.widget_type);
      setSelectedTagIds(tags.map(tag => tag.id));
    } catch (error) {
      console.error('Error loading widget tags:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!widgetType || !user || !canEdit) return;

    setIsSaving(true);
    try {
      // Update widget type
      const { error: updateError } = await supabase
        .from('widget_catalog')
        .update({
          name: formData.name,
          description: formData.description,
          icon: formData.icon,
          default_settings: formData.default_settings
        })
        .eq('id', widgetType.id)
        .eq('user_id', user.id);

      if (updateError) throw updateError;

      // Update tags
      await setWidgetTags(widgetType.widget_type, selectedTagIds);

      toast({
        title: "Widget Type Updated",
        description: `Successfully updated "${formData.name}"`,
      });

      onSave();
      onClose();
    } catch (error) {
      console.error('Error saving widget type:', error);
      toast({
        title: "Error",
        description: "Failed to save widget type settings",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCreateCustomCopy = async () => {
    if (!widgetType || !user) return;

    setIsSaving(true);
    try {
      // Create a custom copy of the system widget
      const customWidgetType = `${widgetType.widget_type}_custom_${Date.now()}`;
      
      const { data, error } = await supabase
        .from('widget_catalog')
        .insert({
          widget_type: customWidgetType,
          name: `${formData.name} (Custom)`,
          description: formData.description,
          icon: formData.icon,
          default_settings: formData.default_settings,
          user_id: user.id
        })
        .select()
        .single();

      if (error) throw error;

      // Copy tags to the new custom widget
      await setWidgetTags(customWidgetType, selectedTagIds);

      toast({
        title: "Custom Widget Created",
        description: `Created custom version: "${data.name}"`,
      });

      onSave();
      onClose();
    } catch (error) {
      console.error('Error creating custom widget:', error);
      toast({
        title: "Error",
        description: "Failed to create custom widget copy",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const getIconComponent = (iconName: string) => {
    const iconData = availableIcons.find(icon => icon.name === iconName);
    return iconData ? <iconData.Icon className="w-4 h-4" /> : <Grid3X3 className="w-4 h-4" />;
  };

  const sections: SettingsSection[] = [
    {
      id: 'basic',
      title: 'Basic Information',
      description: 'Widget name, description, and icon settings',
      icon: Settings,
      order: 1,
      content: (
        <div className="space-y-6">
          {isSystemWidget && (
            <Card className="bg-yellow-500/10 border-yellow-500/30">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 text-yellow-400" />
                  <div>
                    <p className="text-yellow-300 font-pip-mono text-sm font-medium">System Widget</p>
                    <p className="text-yellow-300/80 font-pip-mono text-xs mt-1">
                      This is a system widget. You can view settings but need to create a custom copy to edit.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
          
          <SettingsGroup>
            <SettingsInput
              label="Widget Name"
              description="Display name for this widget type"
              value={formData.name}
              onChange={(value) => setFormData(prev => ({ ...prev, name: value }))}
              disabled={!canEdit}
            />

            <SettingsInput
              label="Description"
              description="Brief description of what this widget does"
              value={formData.description}
              onChange={(value) => setFormData(prev => ({ ...prev, description: value }))}
              disabled={!canEdit}
              type="text"
            />

            <SettingsSelect
              label="Icon"
              description="Choose an icon to represent this widget"
              value={formData.icon}
              onChange={(value) => setFormData(prev => ({ ...prev, icon: value as string }))}
              disabled={!canEdit}
              options={availableIcons.map(icon => ({ value: icon.name, label: icon.label }))}
            />
          </SettingsGroup>
        </div>
      )
    },
    {
      id: 'tags',
      title: 'Tags & Categories',
      description: 'Organize widgets with tags and categories',
      icon: Grid3X3,
      order: 2,
      content: (
        <TagManager
          selectedTagIds={selectedTagIds}
          onTagSelectionChange={setSelectedTagIds}
          allowCreate={canEdit}
          allowEdit={canEdit}
        />
      )
    },
    {
      id: 'settings',
      title: 'Default Settings',
      description: 'View default configuration for new widget instances',
      icon: TestTube,
      order: 3,
      content: (
        <div className="bg-pip-bg-tertiary border border-pip-border rounded p-3">
          <pre className="text-pip-text-secondary font-pip-mono text-xs overflow-auto">
            {JSON.stringify(formData.default_settings, null, 2)}
          </pre>
        </div>
      )
    }
  ];

  return (
    <UniversalSettingsTemplate
      isOpen={isOpen}
      onClose={onClose}
      title="Widget Type Settings"
      description="Configure widget type properties and organization"
      sections={sections}
      onSave={isSystemWidget ? handleCreateCustomCopy : handleSave}
      isDirty={formData.name !== (widgetType?.name || '') || 
               formData.description !== (widgetType?.description || '') ||
               formData.icon !== (widgetType?.icon || '')}
      isLoading={isSaving}
      size="large"
      showResetButton={false}
    />
  );
};