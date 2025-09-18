import React, { useState, useEffect, useCallback } from 'react';
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
import { Settings, Palette, Zap, Monitor, Image } from 'lucide-react';
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
  const [activeTab, setActiveTab] = useState('general');

  // Sync local settings with prop changes and set initial tab
  useEffect(() => {
    setLocalSettings(settings);
    setIsDirty(false);
    
    // Set initial tab based on available tabs
    if (isOpen) {
      if (showGeneralTab) {
        setActiveTab('general');
      } else if (customTabs.length > 0) {
        setActiveTab(customTabs[0].id);
      } else if (showEffectsTab) {
        setActiveTab('effects');
      } else {
        setActiveTab('display');
      }
    }
  }, [settings, isOpen, showGeneralTab, showEffectsTab, customTabs]);

  const updateSetting = useCallback((key: keyof BaseWidgetSettings, value: any) => {
    setLocalSettings(prev => ({ ...prev, [key]: value }));
    setIsDirty(true);
  }, []);

  const updateEffectSetting = useCallback((key: string, value: any) => {
    setLocalSettings(prev => ({
      ...prev,
      effects: { ...prev.effects, [key]: value }
    }));
    setIsDirty(true);
  }, []);

  const handleSave = useCallback(() => {
    onSave(localSettings);
    setIsDirty(false);
    onClose();
  }, [localSettings, onSave, onClose]);

  const handleReset = useCallback(() => {
    setLocalSettings(settings);
    setIsDirty(false);
  }, [settings]);

  // Create enhanced custom tabs with access to state management functions
  const enhancedCustomTabs = customTabs.map(tab => ({
    ...tab,
    content: typeof tab.content === 'function' 
      ? tab.content({ localSettings, updateSetting, updateEffectSetting })
      : tab.content
  }));

  const defaultTabs = [
    ...(showGeneralTab ? [{
      id: 'general',
      label: 'General',
      icon: Settings,
      content: (
        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="widget-title" className="text-sm font-medium text-pip-text-bright">
              Title
            </Label>
            <Input
              id="widget-title"
              value={localSettings.title || ''}
              onChange={(e) => updateSetting('title', e.target.value)}
              placeholder="Widget title"
              className="bg-pip-bg-secondary/50 border-pip-border text-pip-text-bright placeholder:text-pip-text-muted"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="widget-description" className="text-sm font-medium text-pip-text-bright">
              Description
            </Label>
            <Textarea
              id="widget-description"
              value={localSettings.description || ''}
              onChange={(e) => updateSetting('description', e.target.value)}
              placeholder="Widget description"
              rows={3}
              className="bg-pip-bg-secondary/50 border-pip-border text-pip-text-bright placeholder:text-pip-text-muted resize-none"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium text-pip-text-bright">Icon</Label>
            <Button
              variant="outline"
              onClick={() => setShowIconModal(true)}
              className="w-full justify-start bg-pip-bg-secondary/50 border-pip-border text-pip-text-bright hover:bg-pip-bg-secondary/70"
            >
              <Image className="h-4 w-4 mr-2" />
              {localSettings.icon ? `Selected: ${localSettings.icon}` : 'Select Icon'}
            </Button>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium text-pip-text-bright">Show Title</Label>
              <Switch
                checked={localSettings.showTitle !== false}
                onCheckedChange={(checked) => updateSetting('showTitle', checked)}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium text-pip-text-bright">Show Description</Label>
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
        <div className="space-y-6">
          <div className="space-y-2">
            <Label className="text-sm font-medium text-pip-text-bright">Theme</Label>
            <Select value={localSettings.theme || 'default'} onValueChange={(value) => updateSetting('theme', value)}>
              <SelectTrigger className="bg-pip-bg-secondary/50 border-pip-border text-pip-text-bright">
                <SelectValue placeholder="Select theme" />
              </SelectTrigger>
              <SelectContent className="bg-pip-bg-primary border-pip-border-bright z-[100]">
                <SelectItem value="default" className="text-pip-text-bright hover:bg-pip-bg-secondary/50">Default</SelectItem>
                <SelectItem value="minimal" className="text-pip-text-bright hover:bg-pip-bg-secondary/50">Minimal</SelectItem>
                <SelectItem value="retro" className="text-pip-text-bright hover:bg-pip-bg-secondary/50">Retro</SelectItem>
                <SelectItem value="modern" className="text-pip-text-bright hover:bg-pip-bg-secondary/50">Modern</SelectItem>
                <SelectItem value="current" className="text-pip-text-bright hover:bg-pip-bg-secondary/50">Current</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {children && (
            <div className="border-t border-pip-border/30 pt-4">
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
            <Label className="text-sm font-medium text-pip-text-bright">Particles Effect</Label>
            <Switch
              checked={localSettings.effects?.particles || false}
              onCheckedChange={(checked) => updateEffectSetting('particles', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium text-pip-text-bright">Scanlines Effect</Label>
            <Switch
              checked={localSettings.effects?.scanlines || false}
              onCheckedChange={(checked) => updateEffectSetting('scanlines', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium text-pip-text-bright">Glow Effect</Label>
            <Switch
              checked={localSettings.effects?.glow || false}
              onCheckedChange={(checked) => updateEffectSetting('glow', checked)}
            />
          </div>
        </div>
      )
    }] : []),
    ...enhancedCustomTabs
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
        className="max-h-[85vh]"
      >
        <div className="flex flex-col h-full min-h-[500px]">
          <Tabs 
            value={activeTab} 
            onValueChange={setActiveTab} 
            className="flex-1 flex flex-col"
          >
            <TabsList className="grid w-full bg-pip-bg-secondary/30 border border-pip-border/50 p-1 h-auto mb-4 flex-shrink-0" 
              style={{ gridTemplateColumns: `repeat(${defaultTabs.length}, 1fr)` }}>
              {defaultTabs.map((tab) => {
                const IconComponent = tab.icon;
                return (
                  <TabsTrigger
                    key={tab.id}
                    value={tab.id}
                    className="flex items-center justify-center space-x-2 px-3 py-2 text-xs font-pip-mono data-[state=active]:bg-pip-bg-secondary/70 data-[state=active]:text-pip-text-bright text-pip-text-secondary hover:text-pip-text-bright transition-colors whitespace-nowrap"
                  >
                    {IconComponent && <IconComponent className="h-4 w-4" />}
                    <span className="hidden sm:inline">{tab.label}</span>
                  </TabsTrigger>
                );
              })}
            </TabsList>
            
            <div className="flex-1 overflow-hidden">
              {defaultTabs.map((tab) => (
                <TabsContent
                  key={tab.id}
                  value={tab.id}
                  className="h-full focus-visible:outline-none mt-0"
                >
                  <ScrollArea className="h-[400px] pr-4">
                    <div className="p-2">
                      {tab.content}
                    </div>
                  </ScrollArea>
                </TabsContent>
              ))}
            </div>
          </Tabs>
        </div>
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