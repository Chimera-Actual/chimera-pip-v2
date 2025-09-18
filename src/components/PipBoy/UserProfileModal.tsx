import React, { useState } from 'react';
import { BaseSettingsModal } from '@/components/ui/BaseSettingsModal';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { UserCircle, Shield, Bell } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({ isOpen, onClose }) => {
  const { profile } = useAuth();
  const [tempSettings, setTempSettings] = useState({
    characterName: profile?.character_name || '',
    vaultNumber: profile?.vault_number || 111,
    notifications: true,
    securityAlerts: true,
    statusUpdates: false
  });

  const handleSaveSettings = () => {
    // TODO: Implement profile update logic
    onClose();
  };

  const handleResetSettings = () => {
    setTempSettings({
      characterName: profile?.character_name || '',
      vaultNumber: profile?.vault_number || 111,
      notifications: true,
      securityAlerts: true,
      statusUpdates: false
    });
  };

  const isDirty = tempSettings.characterName !== (profile?.character_name || '') ||
    tempSettings.vaultNumber !== (profile?.vault_number || 111);

  return (
    <BaseSettingsModal
      isOpen={isOpen}
      onClose={onClose}
      title="DWELLER PROFILE"
      description="PERSONAL IDENTIFICATION & ACCOUNT MANAGEMENT"
      size="large"
      onSave={handleSaveSettings}
      onReset={handleResetSettings}
      isDirty={isDirty}
    >
      <div className="space-y-8">
        {/* Character Profile Section */}
        <div>
          <div className="flex items-center mb-4">
            <UserCircle className="h-5 w-5 text-primary mr-2" />
            <h3 className="text-lg font-pip-display font-semibold text-pip-text-bright pip-text-glow">
              CHARACTER PROFILE
            </h3>
          </div>
          
          <div className="space-y-4 pl-7">
            <div className="space-y-2">
              <Label className="text-sm font-pip-mono text-pip-text-primary">CHARACTER NAME</Label>
              <Input
                value={tempSettings.characterName}
                onChange={(e) => setTempSettings(prev => ({ ...prev, characterName: e.target.value }))}
                className="bg-pip-bg-secondary border-pip-border font-pip-mono text-pip-text-primary"
                placeholder="Enter character name"
              />
            </div>
            
            <div className="space-y-2">
              <Label className="text-sm font-pip-mono text-pip-text-primary">VAULT NUMBER</Label>
              <Input
                type="number"
                value={tempSettings.vaultNumber}
                onChange={(e) => setTempSettings(prev => ({ ...prev, vaultNumber: parseInt(e.target.value) || 111 }))}
                className="bg-pip-bg-secondary border-pip-border font-pip-mono text-pip-text-primary"
                min="1"
                max="999"
              />
            </div>
          </div>
        </div>

        {/* Account Security Section */}
        <div>
          <div className="flex items-center mb-4">
            <Shield className="h-5 w-5 text-primary mr-2" />
            <h3 className="text-lg font-pip-display font-semibold text-pip-text-bright pip-text-glow">
              ACCOUNT SECURITY
            </h3>
          </div>
          
          <div className="space-y-4 pl-7">
            <Button 
              variant="outline" 
              className="w-full font-pip-mono text-sm border-pip-border text-pip-text-primary hover:bg-pip-bg-secondary/50"
            >
              CHANGE PASSWORD
            </Button>
            
            <Button 
              variant="outline" 
              className="w-full font-pip-mono text-sm border-pip-border text-pip-text-primary hover:bg-pip-bg-secondary/50"
            >
              ENABLE TWO-FACTOR AUTH
            </Button>
            
            <Button 
              variant="outline" 
              className="w-full font-pip-mono text-sm border-pip-border text-pip-text-primary hover:bg-pip-bg-secondary/50"
            >
              VIEW LOGIN HISTORY
            </Button>
          </div>
        </div>

        {/* Notification Preferences Section */}
        <div>
          <div className="flex items-center mb-4">
            <Bell className="h-5 w-5 text-primary mr-2" />
            <h3 className="text-lg font-pip-display font-semibold text-pip-text-bright pip-text-glow">
              NOTIFICATION PREFERENCES
            </h3>
          </div>
          
          <div className="space-y-4 pl-7">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-pip-mono text-pip-text-primary">SYSTEM NOTIFICATIONS</Label>
              <Switch 
                checked={tempSettings.notifications}
                onCheckedChange={(checked) => setTempSettings(prev => ({ ...prev, notifications: checked }))}
                className="data-[state=checked]:bg-primary" 
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label className="text-sm font-pip-mono text-pip-text-primary">SECURITY ALERTS</Label>
              <Switch 
                checked={tempSettings.securityAlerts}
                onCheckedChange={(checked) => setTempSettings(prev => ({ ...prev, securityAlerts: checked }))}
                className="data-[state=checked]:bg-primary" 
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label className="text-sm font-pip-mono text-pip-text-primary">STATUS UPDATES</Label>
              <Switch 
                checked={tempSettings.statusUpdates}
                onCheckedChange={(checked) => setTempSettings(prev => ({ ...prev, statusUpdates: checked }))}
                className="data-[state=checked]:bg-primary" 
              />
            </div>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="pt-4 border-t border-pip-border/30">
          <h4 className="text-sm font-pip-mono text-destructive mb-3 pip-text-glow">DANGER ZONE</h4>
          <Button 
            variant="outline" 
            className="w-full font-pip-mono text-sm border-destructive text-destructive hover:bg-destructive/20"
          >
            DELETE ACCOUNT
          </Button>
        </div>
      </div>
    </BaseSettingsModal>
  );
};