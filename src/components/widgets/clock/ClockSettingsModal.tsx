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
import { Clock, Palette, Sparkles } from 'lucide-react';
import { AtomicClockSettings } from '../AtomicClockWidget';

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
      <DialogContent className="sm:max-w-[600px] pip-dialog max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-pip-text-bright font-pip-display flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Atomic Clock Settings
          </DialogTitle>
          <DialogDescription className="text-pip-text-secondary font-pip-mono">
            Configure your atomic clock display and behavior
          </DialogDescription>
        </DialogHeader>
        
        <Tabs defaultValue="display" className="w-full">
          <TabsList className="grid w-full grid-cols-3 pip-tabs">
            <TabsTrigger value="display" className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Display
            </TabsTrigger>
            <TabsTrigger value="theme" className="flex items-center gap-2">
              <Palette className="w-4 h-4" />
              Theme
            </TabsTrigger>
            <TabsTrigger value="effects" className="flex items-center gap-2">
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
                  Choose your preferred display style
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {themeOptions.map((theme) => (
                    <div
                      key={theme.value}
                      className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                        localSettings.theme === theme.value
                          ? 'border-primary bg-primary/10'
                          : 'border-pip-border hover:border-primary/50'
                      }`}
                      onClick={() => updateSetting('theme', theme.value)}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-sm font-pip-display text-pip-text-bright">
                            {theme.label}
                          </div>
                          <div className="text-xs text-pip-text-secondary font-pip-mono">
                            {theme.description}
                          </div>
                        </div>
                        <div className={`w-4 h-4 rounded-full border-2 ${
                          localSettings.theme === theme.value
                            ? 'border-primary bg-primary'
                            : 'border-pip-border'
                        }`} />
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
        
        <DialogFooter>
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