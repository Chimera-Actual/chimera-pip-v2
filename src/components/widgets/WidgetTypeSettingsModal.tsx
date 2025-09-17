import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { X, TestTube, Grid3X3, Settings, Save, AlertCircle } from 'lucide-react';
import { TagManager } from './TagManager';
import { useWidgetTags } from '@/hooks/useWidgetTags';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] bg-pip-bg-primary border-pip-border">
        <DialogHeader className="border-b border-pip-border pb-4">
          <DialogTitle className="text-pip-text-bright font-pip-display text-xl pip-text-glow">
            Widget Type Settings
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="flex-1 p-6">
          {isSystemWidget && (
            <Card className="mb-6 bg-yellow-500/10 border-yellow-500/30">
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

          <div className="space-y-6">
            {/* Basic Information */}
            <Card className="bg-pip-bg-secondary border-pip-border">
              <CardHeader>
                <CardTitle className="text-pip-text-bright font-pip-display text-sm">
                  Basic Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-pip-text-secondary font-pip-mono text-xs">Widget Name</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    disabled={!canEdit}
                    className="bg-pip-bg-tertiary border-pip-border text-pip-text-primary"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-pip-text-secondary font-pip-mono text-xs">Description</Label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    disabled={!canEdit}
                    rows={3}
                    className="bg-pip-bg-tertiary border-pip-border text-pip-text-primary"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-pip-text-secondary font-pip-mono text-xs">Icon</Label>
                  <Select 
                    value={formData.icon} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, icon: value }))}
                    disabled={!canEdit}
                  >
                    <SelectTrigger className="bg-pip-bg-tertiary border-pip-border">
                      <SelectValue>
                        <div className="flex items-center gap-2">
                          {getIconComponent(formData.icon)}
                          {availableIcons.find(icon => icon.name === formData.icon)?.label}
                        </div>
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent className="bg-pip-bg-secondary border-pip-border">
                      {availableIcons.map((icon) => (
                        <SelectItem key={icon.name} value={icon.name}>
                          <div className="flex items-center gap-2">
                            <icon.Icon className="w-4 h-4" />
                            {icon.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Tags */}
            <Card className="bg-pip-bg-secondary border-pip-border">
              <CardHeader>
                <CardTitle className="text-pip-text-bright font-pip-display text-sm">
                  Tags & Categories
                </CardTitle>
              </CardHeader>
              <CardContent>
                <TagManager
                  selectedTagIds={selectedTagIds}
                  onTagSelectionChange={setSelectedTagIds}
                  allowCreate={canEdit}
                  allowEdit={canEdit}
                />
              </CardContent>
            </Card>

            {/* Default Settings Preview */}
            <Card className="bg-pip-bg-secondary border-pip-border">
              <CardHeader>
                <CardTitle className="text-pip-text-bright font-pip-display text-sm">
                  Default Settings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-pip-bg-tertiary border border-pip-border rounded p-3">
                  <pre className="text-pip-text-secondary font-pip-mono text-xs overflow-auto">
                    {JSON.stringify(formData.default_settings, null, 2)}
                  </pre>
                </div>
              </CardContent>
            </Card>
          </div>
        </ScrollArea>

        <div className="flex justify-end gap-3 p-6 border-t border-pip-border">
          <Button
            variant="ghost"
            onClick={onClose}
            className="font-pip-mono text-xs"
          >
            Cancel
          </Button>
          
          {isSystemWidget ? (
            <Button
              onClick={handleCreateCustomCopy}
              disabled={isSaving}
              className="font-pip-mono text-xs"
            >
              <Save className="w-3 h-3 mr-2" />
              Create Custom Copy
            </Button>
          ) : (
            <Button
              onClick={handleSave}
              disabled={isSaving || !formData.name.trim()}
              className="font-pip-mono text-xs"
            >
              <Save className="w-3 h-3 mr-2" />
              Save Changes
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};