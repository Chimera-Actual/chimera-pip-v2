import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Clock, Palette, Sparkles, Check } from 'lucide-react';
import { AtomicClockSettings } from '../AtomicClockWidget';
import { ClockThemePreview } from './ClockThemePreview';

interface ClockSettingsModalProps {
  open: boolean;
  onClose: () => void;
  settings: AtomicClockSettings;
  onSave: (settings: Partial<AtomicClockSettings>) => void;
}

export const ClockSettingsModal: React.FC<ClockSettingsModalProps> = ({
  open,
  onClose,
  settings,
  onSave,
}) => {
  const [localSettings, setLocalSettings] = useState<AtomicClockSettings>(settings);

  useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  const handleSave = () => {
    onSave(localSettings);
    onClose();
  };

  const updateSetting = (key: keyof AtomicClockSettings, value: any) => {
    setLocalSettings(prev => ({ ...prev, [key]: value }));
  };

  const updateEffectSetting = (key: string, value: boolean) => {
    setLocalSettings(prev => ({
      ...prev,
      effects: { ...prev.effects, [key]: value }
    }));
  };

  const themeOptions = [
    { value: 'vault-tec', label: 'Vault-Tec', description: 'Classic Fallout green phosphor' },
    { value: 'military', label: 'Military', description: 'Orange tactical display' },
    { value: 'nixie', label: 'Nixie Tube', description: 'Warm amber glow' },
    { value: 'led', label: 'LED Matrix', description: 'Red digital display' },
    { value: 'terminal', label: 'Terminal', description: 'Green on black CRT' },
    { value: 'plasma', label: 'Plasma', description: 'Blue-white futuristic' },
    { value: 'hologram', label: 'Hologram', description: 'Cyan projection effect' },
    { value: 'retro-lcd', label: 'Retro LCD', description: 'Dark blue LCD style' }
  ];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] pip-dialog max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="text-pip-text-bright font-pip-display flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Atomic Clock Settings
          </DialogTitle>
          <DialogDescription className="text-pip-text-secondary font-pip-mono">
            Configure your atomic clock display and behavior
          </DialogDescription>
        </DialogHeader>
        
        <div className="overflow-y-auto max-h-[60vh] pip-scrollbar">
          <Tabs defaultValue="display" className="w-full">
            <TabsList className="grid w-full grid-cols-3 pip-tabs mb-6">
              <TabsTrigger value="display" className="flex items-center gap-2 pip-tab">
                <Clock className="w-4 h-4" />
                Display
              </TabsTrigger>
              <TabsTrigger value="theme" className="flex items-center gap-2 pip-tab">
                <Palette className="w-4 h-4" />
                Theme
              </TabsTrigger>
              <TabsTrigger value="effects" className="flex items-center gap-2 pip-tab">
                <Sparkles className="w-4 h-4" />
                Effects
              </TabsTrigger>
            </TabsList>

          <TabsContent value="display" className="space-y-4 mt-6">
            <Card className="bg-pip-bg-secondary border-pip-border">
              <CardHeader>
                <CardTitle className="text-sm text-pip-text-bright font-pip-display">
                  Time Format
                </CardTitle>
                <CardDescription className="text-xs text-pip-text-secondary font-pip-mono">
                  Configure how time is displayed
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-pip-text-secondary font-pip-mono text-sm">
                    24-hour format
                  </Label>
                  <Switch
                    checked={localSettings.format24}
                    onCheckedChange={(checked) => updateSetting('format24', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label className="text-pip-text-secondary font-pip-mono text-sm">
                    Show seconds
                  </Label>
                  <Switch
                    checked={localSettings.showSeconds}
                    onCheckedChange={(checked) => updateSetting('showSeconds', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label className="text-pip-text-secondary font-pip-mono text-sm">
                    Show date
                  </Label>
                  <Switch
                    checked={localSettings.showDate}
                    onCheckedChange={(checked) => updateSetting('showDate', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label className="text-pip-text-secondary font-pip-mono text-sm">
                    Show timezone
                  </Label>
                  <Switch
                    checked={localSettings.showTimezone}
                    onCheckedChange={(checked) => updateSetting('showTimezone', checked)}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="theme" className="space-y-4 mt-6">
            <Card className="bg-pip-bg-secondary border-pip-border">
              <CardHeader>
                <CardTitle className="text-sm text-pip-text-bright font-pip-display">
                  Visual Theme
                </CardTitle>
                <CardDescription className="text-xs text-pip-text-secondary font-pip-mono">
                  Choose your preferred display style - colors adapt to your current Pip-Boy theme
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {themeOptions.map((theme) => (
                    <div
                      key={theme.value}
                      className={`p-3 border rounded-lg cursor-pointer transition-all duration-200 ${
                        localSettings.theme === theme.value
                          ? 'border-primary bg-pip-bg-primary/50 ring-1 ring-primary/50'
                          : 'border-pip-border hover:border-primary/50 hover:bg-pip-bg-primary/20'
                      }`}
                      onClick={() => updateSetting('theme', theme.value)}
                    >
                      <div className="flex flex-col space-y-3">
                        {/* Theme Preview */}
                        <div className="flex items-center justify-between">
                          <ClockThemePreview
                            theme={theme.value}
                            showSeconds={localSettings.showSeconds}
                            format24={localSettings.format24}
                            showDate={localSettings.showDate}
                          />
                          <div className={`flex items-center justify-center w-6 h-6 rounded-full border-2 transition-colors ${
                            localSettings.theme === theme.value
                              ? 'border-primary bg-primary text-pip-bg-primary'
                              : 'border-pip-border'
                          }`}>
                            {localSettings.theme === theme.value && (
                              <Check className="w-3 h-3" />
                            )}
                          </div>
                        </div>
                        
                        {/* Theme Info */}
                        <div>
                          <div className="text-sm font-pip-display text-pip-text-bright">
                            {theme.label}
                          </div>
                          <div className="text-xs text-pip-text-secondary font-pip-mono mt-1">
                            {theme.description}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="effects" className="space-y-4 mt-6">
            <Card className="bg-pip-bg-secondary border-pip-border">
              <CardHeader>
                <CardTitle className="text-sm text-pip-text-bright font-pip-display">
                  Visual Effects
                </CardTitle>
                <CardDescription className="text-xs text-pip-text-secondary font-pip-mono">
                  Enable retro display effects for immersion
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-pip-text-secondary font-pip-mono text-sm">
                      Particle Effects
                    </Label>
                    <div className="text-xs text-pip-text-secondary mt-1">
                      Floating particles and atmospheric effects
                    </div>
                  </div>
                  <Switch
                    checked={localSettings.effects.particles}
                    onCheckedChange={(checked) => updateEffectSetting('particles', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-pip-text-secondary font-pip-mono text-sm">
                      Scanlines
                    </Label>
                    <div className="text-xs text-pip-text-secondary mt-1">
                      CRT-style horizontal scanlines
                    </div>
                  </div>
                  <Switch
                    checked={localSettings.effects.scanlines}
                    onCheckedChange={(checked) => updateEffectSetting('scanlines', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-pip-text-secondary font-pip-mono text-sm">
                      Glow Effects
                    </Label>
                    <div className="text-xs text-pip-text-secondary mt-1">
                      Phosphor glow and shadow effects
                    </div>
                  </div>
                  <Switch
                    checked={localSettings.effects.glow}
                    onCheckedChange={(checked) => updateEffectSetting('glow', checked)}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          </Tabs>
        </div>
        
        <DialogFooter className="border-t border-pip-border pt-4">
          <Button 
            type="button" 
            variant="outline" 
            onClick={onClose}
            className="pip-button-secondary"
          >
            Cancel
          </Button>
          <Button 
            type="button" 
            onClick={handleSave}
            className="pip-button-primary"
          >
            Save Settings
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};