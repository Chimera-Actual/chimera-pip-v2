import React, { useState, useEffect } from 'react';
import { BaseSettingsModal } from '@/components/ui/BaseSettingsModal';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Palette, Volume2, Layout } from 'lucide-react';
import { useTheme, PipBoyTheme, ScrollingScanLineMode } from '@/contexts/ThemeContext';
import { ColorTheme } from './PipBoyContainer';
import { cn } from '@/lib/utils';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const { 
    currentTheme, 
    setTheme, 
    soundEnabled, 
    setSoundEnabled, 
    glowIntensity, 
    setGlowIntensity, 
    backgroundScanLines, 
    setBackgroundScanLines, 
    scrollingScanLines, 
    setScrollingScanLines 
  } = useTheme();
  const [tempSettings, setTempSettings] = useState({
    theme: currentTheme,
    sound: soundEnabled,
    volume: 50,
    animationSpeed: 1,
    autoSave: true,
    notifications: true,
    glowIntensity: glowIntensity,
    backgroundScanLines: backgroundScanLines,
    scrollingScanLines: scrollingScanLines
  });

  useEffect(() => {
    setTempSettings({
      theme: currentTheme,
      sound: soundEnabled,
      volume: 50,
      animationSpeed: 1,
      autoSave: true,
      notifications: true,
      glowIntensity: glowIntensity,
      backgroundScanLines: backgroundScanLines,
      scrollingScanLines: scrollingScanLines
    });
  }, [currentTheme, soundEnabled, glowIntensity, backgroundScanLines, scrollingScanLines]);

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
    setGlowIntensity(tempSettings.glowIntensity);
    setBackgroundScanLines(tempSettings.backgroundScanLines);
    setScrollingScanLines(tempSettings.scrollingScanLines);
    onClose();
  };

  const handleResetSettings = () => {
    setTempSettings({
      theme: 'green' as PipBoyTheme,
      sound: true,
      volume: 50,
      animationSpeed: 1,
      autoSave: true,
      notifications: true,
      glowIntensity: 75,
      backgroundScanLines: 50,
      scrollingScanLines: 'normal' as ScrollingScanLineMode
    });
  };

  // Check if settings have changed for dirty state
  const isDirty = tempSettings.theme !== currentTheme || 
                  tempSettings.sound !== soundEnabled || 
                  tempSettings.glowIntensity !== glowIntensity || 
                  tempSettings.backgroundScanLines !== backgroundScanLines ||
                  tempSettings.scrollingScanLines !== scrollingScanLines;

  return (
    <BaseSettingsModal
      isOpen={isOpen}
      onClose={onClose}
      title="SYSTEM CONFIGURATION"
      description="CHIMERA-PIP 4000 mk2 INTERFACE SETTINGS"
      size="large"
      onSave={handleSaveSettings}
      onReset={handleResetSettings}
      isDirty={isDirty}
    >
        <Tabs defaultValue="theme" className="h-full flex flex-col">
            <TabsList className="grid w-full grid-cols-3 bg-pip-bg-secondary/30 border border-pip-border">
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
                  <div className="space-y-6">
                    <div className="space-y-3">
                      <Label className="text-sm font-pip-mono text-pip-text-primary">GLOW INTENSITY</Label>
                      <Slider
                        value={[tempSettings.glowIntensity]}
                        onValueChange={([value]) => setTempSettings(prev => ({ ...prev, glowIntensity: value }))}
                        max={100}
                        step={5}
                        className="w-full"
                      />
                      <div className="flex justify-between text-xs font-pip-mono text-pip-text-muted">
                        <span>OFF</span>
                        <span>{tempSettings.glowIntensity}%</span>
                        <span>MAX</span>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <Label className="text-sm font-pip-mono text-pip-text-primary">BACKGROUND SCAN LINES</Label>
                      <Slider
                        value={[tempSettings.backgroundScanLines]}
                        onValueChange={([value]) => setTempSettings(prev => ({ ...prev, backgroundScanLines: value }))}
                        max={100}
                        step={5}
                        className="w-full"
                      />
                      <div className="flex justify-between text-xs font-pip-mono text-pip-text-muted">
                        <span>OFF</span>
                        <span>{tempSettings.backgroundScanLines}%</span>
                        <span>MAX</span>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <Label className="text-sm font-pip-mono text-pip-text-primary">SCROLLING SCAN LINES</Label>
                      <Select 
                        value={tempSettings.scrollingScanLines}
                        onValueChange={(value) => setTempSettings(prev => ({ ...prev, scrollingScanLines: value as ScrollingScanLineMode }))}
                      >
                        <SelectTrigger className="bg-pip-bg-secondary border-pip-border font-pip-mono">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-pip-bg-primary border-pip-border">
                          <SelectItem value="off">OFF</SelectItem>
                          <SelectItem value="normal">NORMAL</SelectItem>
                          <SelectItem value="random">RANDOM</SelectItem>
                        </SelectContent>
                      </Select>
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
                      <Select 
                        value={tempSettings.animationSpeed.toString()}
                        onValueChange={(value) => setTempSettings(prev => ({ ...prev, animationSpeed: parseFloat(value) }))}
                      >
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
          </div>
        </Tabs>
    </BaseSettingsModal>
  );
};