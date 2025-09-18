import React, { useState, useEffect } from 'react';
import { SettingsModal } from '@/components/ui/SettingsModal';
import { SettingsInput, SettingsToggle } from '@/components/ui/SettingsControls';
import { PrimarySettingsGroup, SecondarySettingsGroup, DangerZoneGroup } from '@/components/ui/SettingsGroupEnhanced';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Upload, User, Shield, Bell, AlertTriangle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { user } = useAuth();
  
  const [tempSettings, setTempSettings] = useState({
    characterName: '',
    vaultNumber: '',
    systemNotifications: true,
    securityAlerts: true,
    statusUpdates: false,
  });

  const [isDirty, setIsDirty] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen && user) {
      setTempSettings({
        characterName: user.user_metadata?.character_name || '',
        vaultNumber: user.user_metadata?.vault_number || '',
        systemNotifications: true,
        securityAlerts: true,
        statusUpdates: false,
      });
      setIsDirty(false);
    }
  }, [isOpen, user]);

  const handleSave = async () => {
    setIsLoading(true);
    // TODO: Implement save logic
    setTimeout(() => {
      setIsLoading(false);
      onClose();
    }, 1000);
  };

  const handleReset = () => {
    if (user) {
      setTempSettings({
        characterName: user.user_metadata?.character_name || '',
        vaultNumber: user.user_metadata?.vault_number || '',
        systemNotifications: true,
        securityAlerts: true,
        statusUpdates: false,
      });
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase() || 'U';
  };

  return (
    <SettingsModal
      isOpen={isOpen}
      onClose={onClose}
      title="User Profile"
      description="Manage your character profile and account settings"
      onSave={handleSave}
      onReset={handleReset}
      isDirty={isDirty}
      isLoading={isLoading}
    >
      <PrimarySettingsGroup 
        title="Character Profile" 
        description="Manage your Pip-Boy character information and appearance"
      >
        <div className="flex items-center gap-4 p-4 bg-pip-surface rounded-lg border border-pip-border">
          <Avatar className="h-16 w-16">
            <AvatarImage src={user?.user_metadata?.avatar_url} />
            <AvatarFallback className="bg-pip-accent text-pip-accent-foreground text-lg font-bold">
              {getInitials(tempSettings.characterName)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <Button variant="outline" size="sm" className="flex items-center gap-2">
              <Upload className="h-4 w-4" />
              Upload Avatar
            </Button>
            <p className="text-xs text-pip-text-muted mt-1">
              Recommended: 256x256px, JPG or PNG
            </p>
          </div>
        </div>
        
        <SettingsInput
          label="Character Name"
          description="Your character's display name shown throughout the interface"
          value={tempSettings.characterName}
          onChange={(value) => {
            setTempSettings(prev => ({ ...prev, characterName: value }));
            setIsDirty(true);
          }}
          placeholder="Enter character name"
        />
        
        <SettingsInput
          label="Vault Number"
          description="Your home vault identification number"
          value={tempSettings.vaultNumber}
          onChange={(value) => {
            setTempSettings(prev => ({ ...prev, vaultNumber: value }));
            setIsDirty(true);
          }}
          placeholder="e.g., 111"
          type="number"
        />
      </PrimarySettingsGroup>

      <SecondarySettingsGroup 
        title="Account Security" 
        description="Manage authentication and security preferences"
      >
        <div className="flex items-center gap-3 p-3 bg-pip-surface rounded border border-pip-border">
          <Shield className="h-5 w-5 text-pip-accent" />
          <div className="flex-1">
            <p className="text-sm font-medium text-pip-text-bright">Two-Factor Authentication</p>
            <p className="text-xs text-pip-text-muted">Add an extra layer of account security</p>
          </div>
          <Button variant="outline" size="sm">Enable</Button>
        </div>
        
        <Button variant="outline" className="w-full justify-start">
          <Shield className="h-4 w-4 mr-2" />
          Change Password
        </Button>
      </SecondarySettingsGroup>

      <SecondarySettingsGroup 
        title="Notification Preferences" 
        description="Control what notifications and alerts you receive"
      >
        <SettingsToggle
          label="System Notifications"
          description="Important system updates and maintenance alerts"
          checked={tempSettings.systemNotifications}
          onCheckedChange={(checked) => {
            setTempSettings(prev => ({ ...prev, systemNotifications: checked }));
            setIsDirty(true);
          }}
        />
        
        <SettingsToggle
          label="Security Alerts"
          description="Login attempts and security-related notifications"
          checked={tempSettings.securityAlerts}
          onCheckedChange={(checked) => {
            setTempSettings(prev => ({ ...prev, securityAlerts: checked }));
            setIsDirty(true);
          }}
        />
        
        <SettingsToggle
          label="Status Updates"
          description="Non-critical updates and feature announcements"
          checked={tempSettings.statusUpdates}
          onCheckedChange={(checked) => {
            setTempSettings(prev => ({ ...prev, statusUpdates: checked }));
            setIsDirty(true);
          }}
        />
      </SecondarySettingsGroup>

      <DangerZoneGroup 
        title="Danger Zone" 
        description="Irreversible account actions - proceed with caution"
      >
        <Button variant="destructive" className="w-full justify-start">
          <AlertTriangle className="h-4 w-4 mr-2" />
          Delete Account
        </Button>
      </DangerZoneGroup>
    </SettingsModal>
  );
};