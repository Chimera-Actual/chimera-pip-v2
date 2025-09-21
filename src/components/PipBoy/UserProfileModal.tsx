import React, { useState, useEffect } from 'react';
import { SettingsSheet } from '@/components/common/SettingsSheet';
import { SettingsInput, SettingsToggle } from '@/components/ui/SettingsControls';
import { PrimarySettingsGroup, SecondarySettingsGroup, DangerZoneGroup } from '@/components/ui/SettingsGroupEnhanced';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Upload, User, Shield, Bell, AlertTriangle, ShieldCheck, ShieldX, Info } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useUserSettings } from '@/hooks/useUserSettings';
import { validateNumericId, validatePin } from '@/lib/quickaccess/crypto';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { ChangePasswordModal } from '@/components/auth/ChangePasswordModal';
import { supabase } from '@/lib/supabaseClient';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { user, profile, updateProfile, enrollQuickAccess, disableQuickAccess } = useAuth();
  const { toast } = useToast();
  const { save: saveUserSettings, isSaving } = useUserSettings();
  
  const [tempSettings, setTempSettings] = useState({
    characterName: '',
    vaultNumber: '',
    systemNotifications: true,
    securityAlerts: true,
    statusUpdates: false,
  });

  // Quick Access state
  const [numericId, setNumericId] = useState('');
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [quickAccessLoading, setQuickAccessLoading] = useState(false);
  const [showPinFields, setShowPinFields] = useState(false);

  const [isDirty, setIsDirty] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Change Password modal state
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  
  // Avatar upload state
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  // Quick Access computed values
  const isQuickAccessEnabled = profile?.quick_access_enabled || false;
  const hasNumericId = Boolean(profile?.numeric_id);
  const canEnroll = user && validateNumericId(numericId) && validatePin(pin) && pin === confirmPin;
  const canUpdateId = validateNumericId(numericId) && numericId !== profile?.numeric_id;

  useEffect(() => {
    if (isOpen && user) {
      setTempSettings({
        characterName: user.user_metadata?.character_name || '',
        vaultNumber: user.user_metadata?.vault_number || '',
        systemNotifications: true,
        securityAlerts: true,
        statusUpdates: false,
      });
      // Initialize Quick Access state
      setNumericId(profile?.numeric_id || '');
      setPin('');
      setConfirmPin('');
      setShowPinFields(false);
      setIsDirty(false);
    }
  }, [isOpen, user, profile]);

  // Quick Access handlers
  const handleUpdateNumericId = async () => {
    if (!canUpdateId) return;
    
    setQuickAccessLoading(true);
    try {
      await updateProfile({ numeric_id: numericId });
      toast({
        title: "Numeric ID Updated",
        description: "Your Numeric ID has been updated successfully.",
      });
    } catch (error) {
      console.error('Failed to update numeric ID:', error);
    } finally {
      setQuickAccessLoading(false);
    }
  };

  const handleEnrollQuickAccess = async () => {
    if (!canEnroll) return;
    
    setQuickAccessLoading(true);
    try {
      await enrollQuickAccess(numericId, pin);
      setPin('');
      setConfirmPin('');
      setShowPinFields(false);
    } catch (error) {
      console.error('Failed to enroll Quick Access:', error);
    } finally {
      setQuickAccessLoading(false);
    }
  };

  const handleDisableQuickAccess = async () => {
    setQuickAccessLoading(true);
    try {
      await disableQuickAccess(profile?.numeric_id || undefined);
    } catch (error) {
      console.error('Failed to disable Quick Access:', error);
    } finally {
      setQuickAccessLoading(false);
    }
  };

  const handleReEnroll = () => {
    setPin('');
    setConfirmPin('');
    setShowPinFields(true);
  };

  const handleSave = async () => {
    try {
      setIsLoading(true);
      
      // Save user profile settings
      await saveUserSettings({
        characterName: tempSettings.characterName,
        vaultNumber: tempSettings.vaultNumber,
      });
      
      // Update local profile via updateProfile
      await updateProfile({
        character_name: tempSettings.characterName,
        vault_number: parseInt(tempSettings.vaultNumber) || null,
      });
      
      toast({
        title: "Profile Updated",
        description: "Your profile has been saved successfully.",
      });
      
      onClose();
    } catch (error) {
      console.error('Failed to save profile:', error);
      toast({
        title: "Save Failed", 
        description: "Failed to save profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
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

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "INVALID FILE TYPE",
        description: "Please select an image file (JPG, PNG, WebP, etc.)",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "FILE TOO LARGE",
        description: "Avatar must be smaller than 5MB",
        variant: "destructive",
      });
      return;
    }

    setUploadingAvatar(true);

    try {
      // Create file path with user ID folder
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/avatar.${fileExt}`;

      // Upload to Supabase storage
      const { data, error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, { 
          upsert: true,
          contentType: file.type
        });

      if (uploadError) {
        throw uploadError;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      // Update user profile with new avatar URL
      await updateProfile({ avatar_url: publicUrl });

      toast({
        title: "AVATAR UPDATED",
        description: "Your profile picture has been successfully updated.",
      });
    } catch (error: any) {
      console.error('Avatar upload failed:', error);
      toast({
        title: "UPLOAD FAILED",
        description: error.message || "Failed to upload avatar. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUploadingAvatar(false);
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase() || 'U';
  };

  return (
    <SettingsSheet
      open={isOpen}
      onOpenChange={onClose}
      title="User Profile"
      description="Manage your character profile and account settings"
      onSave={handleSave}
      isSaving={isLoading || isSaving}
    >
      <PrimarySettingsGroup 
        title="Character Profile" 
        description="Manage your Pip-Boy character information and appearance"
      >
        <div className="flex items-center gap-4 p-4 bg-pip-surface rounded-lg border border-pip-border">
          <Avatar className="h-16 w-16">
            <AvatarImage src={profile?.avatar_url} />
            <AvatarFallback className="bg-pip-accent text-pip-accent-foreground text-lg font-bold">
              {getInitials(profile?.character_name || tempSettings.characterName || user?.email || 'U')}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <input
              type="file"
              accept="image/*"
              onChange={handleAvatarUpload}
              className="hidden"
              id="avatar-upload"
              disabled={uploadingAvatar}
            />
            <Button 
              variant="outline" 
              size="sm" 
              className="flex items-center gap-2"
              onClick={() => document.getElementById('avatar-upload')?.click()}
              disabled={uploadingAvatar}
            >
              <Upload className="h-4 w-4" />
              {uploadingAvatar ? 'Uploading...' : 'Upload Avatar'}
            </Button>
            <p className="text-xs text-pip-text-muted mt-1">
              Max 5MB • JPG, PNG, WebP • Recommended: 256x256px
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
        
        <Button 
          variant="outline" 
          className="w-full justify-start"
          onClick={() => setShowChangePasswordModal(true)}
        >
          <Shield className="h-4 w-4 mr-2" />
          Change Password
        </Button>
      </SecondarySettingsGroup>

      <SecondarySettingsGroup 
        title="Quick Access" 
        description="Set up glove-friendly PIN access for this device"
      >
        <div className="flex items-center justify-between mb-4">
          <Badge variant={isQuickAccessEnabled ? "default" : "secondary"} className="font-mono">
            {isQuickAccessEnabled ? (
              <>
                <ShieldCheck className="h-3 w-3 mr-1" />
                Enabled
              </>
            ) : (
              <>
                <ShieldX className="h-3 w-3 mr-1" />
                Disabled
              </>
            )}
          </Badge>
        </div>

        <Alert className="mb-4">
          <Info className="h-4 w-4" />
          <AlertDescription>
            Quick Access stores encrypted session data on this device only. 
            Your PIN is never stored or transmitted - it only encrypts local data.
          </AlertDescription>
        </Alert>

        {/* Numeric ID Section */}
        <div className="space-y-3 mb-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="numeric-id" className="font-mono uppercase text-sm">
              Numeric ID
            </Label>
            {hasNumericId && (
              <Badge variant="outline" className="font-mono">
                Current: {profile?.numeric_id}
              </Badge>
            )}
          </div>
          
          <div className="flex space-x-2">
            <Input
              id="numeric-id"
              type="tel"
              value={numericId}
              onChange={(e) => setNumericId(e.target.value.replace(/\D/g, '').slice(0, 9))}
              placeholder="Enter 3-9 digits"
              maxLength={9}
              className={cn(
                "font-mono",
                validateNumericId(numericId) && "border-primary/50 bg-primary/5"
              )}
              disabled={quickAccessLoading}
            />
            {canUpdateId && (
              <Button
                onClick={handleUpdateNumericId}
                disabled={quickAccessLoading}
                variant="outline"
                className="font-mono"
              >
                Update
              </Button>
            )}
          </div>
          
          {numericId && !validateNumericId(numericId) && (
            <p className="text-sm text-destructive">
              Numeric ID must be 3-9 digits and unique across all users
            </p>
          )}
        </div>

        {/* Quick Access Status */}
        {hasNumericId && (
          <div className="space-y-4 mb-4">
            {isQuickAccessEnabled ? (
              <div className="space-y-3">
                <Alert>
                  <ShieldCheck className="h-4 w-4" />
                  <AlertDescription>
                    Quick Access is enabled on this device. You can log in using your Numeric ID and PIN.
                  </AlertDescription>
                </Alert>
                
                <div className="flex space-x-2">
                  <Button
                    onClick={handleReEnroll}
                    variant="outline"
                    disabled={quickAccessLoading}
                    className="font-mono"
                  >
                    Change PIN
                  </Button>
                  <Button
                    onClick={handleDisableQuickAccess}
                    variant="destructive"
                    disabled={quickAccessLoading}
                    className="font-mono"
                  >
                    Disable Quick Access
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    Quick Access is not enabled on this device. Set a PIN to enable glove-friendly login.
                  </AlertDescription>
                </Alert>
                
                <Button
                  onClick={() => setShowPinFields(true)}
                  disabled={quickAccessLoading}
                  className="font-mono"
                >
                  <Shield className="h-4 w-4 mr-2" />
                  Set Up Quick Access
                </Button>
              </div>
            )}
          </div>
        )}

        {/* PIN Setup */}
        {showPinFields && hasNumericId && (
          <div className="space-y-4 p-4 border rounded-lg bg-muted/50 mb-4">
            <h4 className="font-mono uppercase text-sm font-medium">
              {isQuickAccessEnabled ? 'Change PIN' : 'Set PIN for Quick Access'}
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="pin" className="font-mono text-sm">
                  PIN (4-8 digits)
                </Label>
                <Input
                  id="pin"
                  type="password"
                  value={pin}
                  onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 8))}
                  placeholder="Enter PIN"
                  maxLength={8}
                  className={cn(
                    "font-mono text-center",
                    validatePin(pin) && "border-primary/50 bg-primary/5"
                  )}
                  disabled={quickAccessLoading}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="confirm-pin" className="font-mono text-sm">
                  Confirm PIN
                </Label>
                <Input
                  id="confirm-pin"
                  type="password"
                  value={confirmPin}
                  onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, '').slice(0, 8))}
                  placeholder="Confirm PIN"
                  maxLength={8}
                  className={cn(
                    "font-mono text-center",
                    pin && confirmPin && pin === confirmPin && "border-primary/50 bg-primary/5"
                  )}
                  disabled={quickAccessLoading}
                />
              </div>
            </div>
            
            {pin && !validatePin(pin) && (
              <p className="text-sm text-destructive">
                PIN must be 4-8 digits
              </p>
            )}
            
            {pin && confirmPin && pin !== confirmPin && (
              <p className="text-sm text-destructive">
                PINs do not match
              </p>
            )}
            
            <div className="flex space-x-2">
              <Button
                onClick={handleEnrollQuickAccess}
                disabled={!canEnroll || quickAccessLoading}
                className="font-mono"
              >
                {quickAccessLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent mr-2" />
                    {isQuickAccessEnabled ? 'Updating...' : 'Enrolling...'}
                  </>
                ) : (
                  <>
                    <ShieldCheck className="h-4 w-4 mr-2" />
                    {isQuickAccessEnabled ? 'Update PIN' : 'Enable Quick Access'}
                  </>
                )}
              </Button>
              <Button
                onClick={() => {
                  setShowPinFields(false);
                  setPin('');
                  setConfirmPin('');
                }}
                variant="outline"
                disabled={quickAccessLoading}
                className="font-mono"
              >
                Cancel
              </Button>
            </div>
          </div>
        )}

        {/* Security Notice */}
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="text-sm">
            <strong>Security Notice:</strong> Quick Access provides convenience but uses lower-entropy PINs. 
            For maximum security, use standard email/password login. Quick Access sessions expire and may 
            require re-enrollment if your password changes.
          </AlertDescription>
        </Alert>
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

      <ChangePasswordModal
        isOpen={showChangePasswordModal}
        onClose={() => setShowChangePasswordModal(false)}
      />
    </SettingsSheet>
  );
};