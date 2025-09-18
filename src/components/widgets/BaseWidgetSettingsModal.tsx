import React, { useState, useEffect } from 'react';
import { BaseSettingsModal } from '@/components/ui/BaseSettingsModal';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { IconSelectionModal } from '@/components/ui/IconSelectionModal';
import { Button } from '@/components/ui/button';
import { Settings, Palette, Zap, Monitor } from 'lucide-react';
import type { BaseWidgetSettingsModalProps, BaseWidgetSettings } from '@/types/widget';

export const BaseWidgetSettingsModal: React.FC<BaseWidgetSettingsModalProps> = ({
  isOpen,
  onClose,
  title = "Widget Settings",
  settings,
  onSave,
  customTabs = [],
  showGeneralTab = true,
  showEffectsTab = true,
  children,
}) => {
  const [localSettings, setLocalSettings] = useState<BaseWidgetSettings>(settings);
  const [showIconModal, setShowIconModal] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    setLocalSettings(settings);
    setIsDirty(false);
  }, [settings, isOpen]);

  const updateSetting = (key: keyof BaseWidgetSettings, value: any) => {
    setLocalSettings(prev => ({ ...prev, [key]: value }));
    setIsDirty(true);
  };

  const updateEffectSetting = (key: string, value: any) => {
    setLocalSettings(prev => ({
      ...prev,
      effects: { ...prev.effects, [key]: value }
    }));
    setIsDirty(true);
  };

  const handleSave = () => {
    onSave(localSettings);
    setIsDirty(false);
    onClose();
  };

  const handleReset = () => {
    setLocalSettings(settings);
    setIsDirty(false);
  };

  const defaultTabs = [
    ...(showGeneralTab ? [{
      id: 'general',
      label: 'General',
      icon: Settings,
      content: (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Widget Title</Label>
            <Input
              value={localSettings.title || ''}
              onChange={(e) => updateSetting('title', e.target.value)}
              placeholder="Enter widget title"
            />
          </div>

          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea
              value={localSettings.description || ''}
              onChange={(e) => updateSetting('description', e.target.value)}
              placeholder="Enter widget description"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label>Icon</Label>
            <Button
              variant="outline"
              onClick={() => setShowIconModal(true)}
              className="w-full justify-start"
            >
              {localSettings.icon || 'Select Icon'}
            </Button>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Show Title</Label>
              <Switch
                checked={localSettings.showTitle !== false}
                onCheckedChange={(checked) => updateSetting('showTitle', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label>Show Description</Label>
              <Switch
                checked={localSettings.showDescription !== false}
                onCheckedChange={(checked) => updateSetting('showDescription', checked)}
              />
            </div>
          </div>
        </div>
      )
    }] : []),
    {
      id: 'display',
      label: 'Display',
      icon: Monitor,
      content: (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Theme</Label>
            <Select value={localSettings.theme || 'default'} onValueChange={(value) => updateSetting('theme', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select theme" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="default">Default</SelectItem>
                <SelectItem value="minimal">Minimal</SelectItem>
                <SelectItem value="retro">Retro</SelectItem>
                <SelectItem value="modern">Modern</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {children && (
            <div className="border-t pt-4">
              {children}
            </div>
          )}
        </div>
      )
    },
    ...(showEffectsTab ? [{
      id: 'effects',
      label: 'Effects',
      icon: Zap,
      content: (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label>Particles Effect</Label>
            <Switch
              checked={localSettings.effects?.particles || false}
              onCheckedChange={(checked) => updateEffectSetting('particles', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label>Scanlines Effect</Label>
            <Switch
              checked={localSettings.effects?.scanlines || false}
              onCheckedChange={(checked) => updateEffectSetting('scanlines', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label>Glow Effect</Label>
            <Switch
              checked={localSettings.effects?.glow || false}
              onCheckedChange={(checked) => updateEffectSetting('glow', checked)}
            />
          </div>
        </div>
      )
    }] : []),
    ...customTabs
  ];

  return (
    <>
      <BaseSettingsModal
        isOpen={isOpen}
        onClose={onClose}
        title={title}
        onSave={handleSave}
        onReset={handleReset}
        isDirty={isDirty}
        size="large"
      >
        <Tabs defaultValue={defaultTabs[0]?.id} className="flex flex-col h-full">
          {/* Fixed Horizontal Tabs */}
          <TabsList className="flex w-full h-auto bg-pip-bg-secondary/30 p-1 mb-4 flex-shrink-0">
            {defaultTabs.map((tab) => (
              <TabsTrigger 
                key={tab.id} 
                value={tab.id} 
                className="flex items-center gap-2 flex-1 justify-center px-3 py-2 text-xs font-pip-mono border border-pip-border/30 data-[state=active]:bg-pip-bg-primary data-[state=active]:text-pip-text-bright data-[state=active]:border-primary/50"
              >
                {tab.icon && <tab.icon className="h-4 w-4" />}
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>

          {/* Scrollable Tab Content */}
          <div className="flex-1 min-h-0 overflow-hidden">
            <ScrollArea className="h-full">
              {defaultTabs.map((tab) => (
                <TabsContent 
                  key={tab.id} 
                  value={tab.id} 
                  className="mt-0 p-4 h-full focus:outline-none"
                >
                  {tab.content}
                </TabsContent>
              ))}
            </ScrollArea>
          </div>
        </Tabs>
      </BaseSettingsModal>

      <IconSelectionModal
        isOpen={showIconModal}
        onClose={() => setShowIconModal(false)}
        onSelect={(icon) => {
          updateSetting('icon', icon);
          setShowIconModal(false);
        }}
        selectedIcon={localSettings.icon || ''}
      />
    </>
  );
};