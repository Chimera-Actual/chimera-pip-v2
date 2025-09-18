import React, { useState } from 'react';
import { BaseSettingsModal } from '@/components/ui/BaseSettingsModal';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { UserCircle, Shield, Bell, Upload, X } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({ isOpen, onClose }) => {
  const { profile, updateProfile } = useAuth();
  const [tempSettings, setTempSettings] = useState({
    characterName: profile?.character_name || '',
    vaultNumber: profile?.vault_number || 111,
    avatarUrl: profile?.avatar_url || '',
    notifications: true,
    securityAlerts: true,
    statusUpdates: false
  });
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleSaveSettings = async () => {
    setIsSaving(true);
    try {
      await updateProfile({
        character_name: tempSettings.characterName,
        vault_number: tempSettings.vaultNumber,
        avatar_url: tempSettings.avatarUrl || null,
      });
      onClose();
    } catch (error) {
      console.error('Failed to save profile:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetSettings = () => {
    setTempSettings({
      characterName: profile?.character_name || '',
      vaultNumber: profile?.vault_number || 111,
      avatarUrl: profile?.avatar_url || '',
      notifications: true,
      securityAlerts: true,
      statusUpdates: false
    });
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !profile) return;

    // Validate file type and size
    if (!file.type.startsWith('image/')) {
      return;
    }
    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      return;
    }

    setIsUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${profile.id}/avatar.${fileExt}`;

      // Upload file to storage
      const { error: uploadError } = await supabase.storage
        .from('user-avatars')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data } = supabase.storage
        .from('user-avatars')
        .getPublicUrl(fileName);

      setTempSettings(prev => ({ ...prev, avatarUrl: data.publicUrl }));
    } catch (error) {
      console.error('Avatar upload failed:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveAvatar = () => {
    setTempSettings(prev => ({ ...prev, avatarUrl: '' }));
  };

  const getInitials = () => {
    if (tempSettings.characterName) {
      return tempSettings.characterName
        .split(' ')
        .map(name => name[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }
    return 'V';
  };

  const isDirty = tempSettings.characterName !== (profile?.character_name || '') ||
    tempSettings.vaultNumber !== (profile?.vault_number || 111) ||
    tempSettings.avatarUrl !== (profile?.avatar_url || '');

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
      isLoading={isSaving}
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
          
          <div className="space-y-6 pl-7">
            {/* Avatar Upload Section */}
            <div className="space-y-3">
              <Label className="text-sm font-pip-mono text-pip-text-primary">CHARACTER AVATAR</Label>
              <div className="flex items-center space-x-4">
                <Avatar className="h-16 w-16">
                  {tempSettings.avatarUrl ? (
                    <AvatarImage src={tempSettings.avatarUrl} alt="Character avatar" />
                  ) : null}
                  <AvatarFallback className="bg-pip-bg-secondary border border-pip-border text-primary font-pip-mono text-lg pip-text-glow">
                    {getInitials()}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex flex-col space-y-2">
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={isUploading}
                      className="font-pip-mono text-xs border-pip-border text-pip-text-primary hover:bg-pip-bg-secondary/50 relative overflow-hidden"
                    >
                      <Upload className="h-3 w-3 mr-1" />
                      {isUploading ? 'UPLOADING...' : 'UPLOAD'}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarUpload}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        disabled={isUploading}
                      />
                    </Button>
                    
                    {tempSettings.avatarUrl && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleRemoveAvatar}
                        className="font-pip-mono text-xs border-destructive text-destructive hover:bg-destructive/20"
                      >
                        <X className="h-3 w-3 mr-1" />
                        REMOVE
                      </Button>
                    )}
                  </div>
                  <p className="text-xs text-pip-text-muted font-pip-mono">
                    JPG, PNG, WEBP • Max 5MB
                  </p>
                </div>
              </div>
            </div>
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