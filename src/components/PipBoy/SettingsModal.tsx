import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X, Palette, Volume2, Layout, User, Save, RotateCcw } from 'lucide-react';
import { useTheme, PipBoyTheme } from '@/contexts/ThemeContext';
import { ColorTheme } from './PipBoyContainer';
import { cn } from '@/lib/utils';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const { currentTheme, setTheme, soundEnabled, setSoundEnabled, toggleSound } = useTheme();
  const [tempSettings, setTempSettings] = useState({
    theme: currentTheme,
    sound: soundEnabled,
    volume: 50,
    animationSpeed: 1,
    autoSave: true,
    notifications: true
  });

  const themeColors: Record<ColorTheme, { color: string; name: string }> = {
    green: { color: 'hsl(120 100% 50%)', name: 'CLASSIC GREEN' },
    amber: { color: 'hsl(45 100% 55%)', name: 'AMBER GLOW' },
    blue: { color: 'hsl(200 100% 55%)', name: 'ICE BLUE' },
    red: { color: 'hsl(0 100% 55%)', name: 'EMERGENCY RED' },
    white: { color: 'hsl(0 0% 90%)', name: 'PURE WHITE' }
  };

  const handleThemeChange = (theme: ColorTheme) => {
    setTempSettings(prev => ({ ...prev, theme: theme as PipBoyTheme }));
  };

  const handleSaveSettings = () => {
    setTheme(tempSettings.theme);
    setSoundEnabled(tempSettings.sound);
    onClose();
  };

  const handleResetSettings = () => {
    setTempSettings({
      theme: 'green' as PipBoyTheme,
      sound: true,
      volume: 50,
      animationSpeed: 1,
      autoSave: true,
      notifications: true
    });
  };

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[80vh] bg-pip-bg-primary/95 backdrop-blur-sm border border-pip-border-bright pip-glow pip-terminal overflow-hidden animate-in fade-in-0 zoom-in-95 duration-300">
        <DialogHeader className="border-b border-pip-border/30 pb-4">
          <DialogTitle className="text-2xl font-pip-display font-bold text-pip-text-bright pip-text-glow">
            SYSTEM PREFERENCES
          </DialogTitle>
          <p className="text-xs text-pip-text-muted font-pip-mono">
            CHIMERA-PIP 4000 mk2 CONFIGURATION INTERFACE
          </p>
        </DialogHeader>

        <div className="flex-1 overflow-hidden">
          <Tabs defaultValue="theme" className="h-full flex flex-col">
            <TabsList className="grid w-full grid-cols-4 bg-pip-bg-secondary/30 border border-pip-border">
              <TabsTrigger 
                value="theme" 
                className="font-pip-mono text-xs data-[state=active]:bg-primary/20 data-[state=active]:text-primary"
              >
                <Palette className="h-4 w-4 mr-2" />
                THEME
              </TabsTrigger>
              <TabsTrigger 
                value="audio" 
                className="font-pip-mono text-xs data-[state=active]:bg-primary/20 data-[state=active]:text-primary"
              >
                <Volume2 className="h-4 w-4 mr-2" />
                AUDIO
              </TabsTrigger>
              <TabsTrigger 
                value="interface" 
                className="font-pip-mono text-xs data-[state=active]:bg-primary/20 data-[state=active]:text-primary"
              >
                <Layout className="h-4 w-4 mr-2" />
                INTERFACE
              </TabsTrigger>
              <TabsTrigger 
                value="account" 
                className="font-pip-mono text-xs data-[state=active]:bg-primary/20 data-[state=active]:text-primary"
              >
                <User className="h-4 w-4 mr-2" />
                ACCOUNT
              </TabsTrigger>
            </TabsList>

            <div className="flex-1 overflow-y-auto mt-4 px-2">
              <TabsContent value="theme" className="space-y-6 mt-0">
                <div>
                  <h3 className="text-lg font-pip-display font-semibold text-pip-text-bright mb-4 pip-text-glow">
                    COLOR SCHEME
                  </h3>
                  <div className="grid grid-cols-5 gap-3">
                    {(Object.keys(themeColors) as ColorTheme[]).map((theme) => (
                      <Button
                        key={theme}
                        variant="ghost"
                        className={cn(
                          "flex flex-col items-center p-4 h-auto border-2 transition-all duration-300",
                          tempSettings.theme === theme 
                            ? 'border-pip-text-bright shadow-pip-glow bg-primary/10' 
                            : 'border-pip-border hover:border-pip-border-bright'
                        )}
                        onClick={() => handleThemeChange(theme)}
                      >
                        <div 
                          className="w-8 h-8 rounded-full border-2 border-pip-border mb-2"
                          style={{ backgroundColor: themeColors[theme].color }}
                        />
                        <span className="text-xs font-pip-mono text-pip-text-primary">
                          {themeColors[theme].name}
                        </span>
                      </Button>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-pip-display font-semibold text-pip-text-bright mb-4 pip-text-glow">
                    VISUAL EFFECTS
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-pip-mono text-pip-text-primary">GLOW EFFECTS</Label>
                      <Switch checked={true} className="data-[state=checked]:bg-primary" />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-pip-mono text-pip-text-primary">SCAN LINES</Label>
                      <Switch checked={true} className="data-[state=checked]:bg-primary" />
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="audio" className="space-y-6 mt-0">
                <div>
                  <h3 className="text-lg font-pip-display font-semibold text-pip-text-bright mb-4 pip-text-glow">
                    SOUND SETTINGS
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-pip-mono text-pip-text-primary">SYSTEM SOUNDS</Label>
                      <Switch 
                        checked={tempSettings.sound} 
                        onCheckedChange={(checked) => setTempSettings(prev => ({ ...prev, sound: checked }))}
                        className="data-[state=checked]:bg-primary" 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-sm font-pip-mono text-pip-text-primary">MASTER VOLUME</Label>
                      <Slider
                        value={[tempSettings.volume]}
                        onValueChange={([value]) => setTempSettings(prev => ({ ...prev, volume: value }))}
                        max={100}
                        step={1}
                        className="w-full"
                      />
                      <span className="text-xs font-pip-mono text-pip-text-muted">{tempSettings.volume}%</span>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="interface" className="space-y-6 mt-0">
                <div>
                  <h3 className="text-lg font-pip-display font-semibold text-pip-text-bright mb-4 pip-text-glow">
                    INTERFACE OPTIONS
                  </h3>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-sm font-pip-mono text-pip-text-primary">ANIMATION SPEED</Label>
                      <Select value={tempSettings.animationSpeed.toString()}>
                        <SelectTrigger className="bg-pip-bg-secondary border-pip-border font-pip-mono">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-pip-bg-primary border-pip-border">
                          <SelectItem value="0.5">SLOW</SelectItem>
                          <SelectItem value="1">NORMAL</SelectItem>
                          <SelectItem value="1.5">FAST</SelectItem>
                          <SelectItem value="0">DISABLED</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-pip-mono text-pip-text-primary">AUTO-SAVE LAYOUTS</Label>
                      <Switch 
                        checked={tempSettings.autoSave}
                        onCheckedChange={(checked) => setTempSettings(prev => ({ ...prev, autoSave: checked }))}
                        className="data-[state=checked]:bg-primary" 
                      />
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="account" className="space-y-6 mt-0">
                <div>
                  <h3 className="text-lg font-pip-display font-semibold text-pip-text-bright mb-4 pip-text-glow">
                    ACCOUNT PREFERENCES
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-pip-mono text-pip-text-primary">SYSTEM NOTIFICATIONS</Label>
                      <Switch 
                        checked={tempSettings.notifications}
                        onCheckedChange={(checked) => setTempSettings(prev => ({ ...prev, notifications: checked }))}
                        className="data-[state=checked]:bg-primary" 
                      />
                    </div>
                    <div className="pt-4 border-t border-pip-border/30">
                      <Button 
                        variant="outline" 
                        className="w-full font-pip-mono text-sm border-destructive text-destructive hover:bg-destructive/20"
                      >
                        RESET ALL SETTINGS
                      </Button>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-pip-border/30">
          <Button
            variant="outline"
            onClick={handleResetSettings}
            className="font-pip-mono text-xs border-pip-border text-pip-text-secondary hover:text-primary"
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            RESET
          </Button>
          
          <div className="flex space-x-2">
            <Button
              variant="ghost"
              onClick={onClose}
              className="font-pip-mono text-xs text-pip-text-secondary hover:text-primary"
            >
              CANCEL
            </Button>
            <Button
              onClick={handleSaveSettings}
              className="font-pip-mono text-xs bg-primary/20 border-primary text-primary hover:bg-primary/30 pip-button-glow"
            >
              <Save className="h-4 w-4 mr-2" />
              SAVE CHANGES
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};