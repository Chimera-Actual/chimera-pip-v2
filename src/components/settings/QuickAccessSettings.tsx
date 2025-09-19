/**
 * Quick Access settings section for managing numeric ID and PIN enrollment
 */

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Shield, ShieldCheck, ShieldX, AlertTriangle, Info } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { validateNumericId, validatePin } from '@/lib/quickaccess/crypto';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

export function QuickAccessSettings() {
  const { user, profile, updateProfile, enrollQuickAccess, disableQuickAccess } = useAuth();
  const { toast } = useToast();
  
  const [numericId, setNumericId] = useState(profile?.numeric_id || '');
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPinFields, setShowPinFields] = useState(false);

  const isEnabled = profile?.quick_access_enabled || false;
  const hasNumericId = Boolean(profile?.numeric_id);
  
  const canEnroll = user && validateNumericId(numericId) && validatePin(pin) && pin === confirmPin;
  const canUpdateId = validateNumericId(numericId) && numericId !== profile?.numeric_id;

  const handleUpdateNumericId = async () => {
    if (!canUpdateId) return;
    
    setLoading(true);
    try {
      await updateProfile({ numeric_id: numericId });
      toast({
        title: "Numeric ID Updated",
        description: "Your Numeric ID has been updated successfully.",
      });
    } catch (error) {
      console.error('Failed to update numeric ID:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEnrollQuickAccess = async () => {
    if (!canEnroll) return;
    
    setLoading(true);
    try {
      await enrollQuickAccess(numericId, pin);
      setPin('');
      setConfirmPin('');
      setShowPinFields(false);
    } catch (error) {
      console.error('Failed to enroll Quick Access:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDisableQuickAccess = async () => {
    setLoading(true);
    try {
      await disableQuickAccess(profile?.numeric_id || undefined);
    } catch (error) {
      console.error('Failed to disable Quick Access:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReEnroll = () => {
    setPin('');
    setConfirmPin('');
    setShowPinFields(true);
  };

  if (!user) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Shield className="h-5 w-5 text-primary" />
            <CardTitle className="font-mono uppercase">Quick Access</CardTitle>
          </div>
          <Badge variant={isEnabled ? "default" : "secondary"} className="font-mono">
            {isEnabled ? (
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
        <CardDescription>
          Set up glove-friendly PIN access for this device
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Status Info */}
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            Quick Access stores encrypted session data on this device only. 
            Your PIN is never stored or transmitted - it only encrypts local data.
          </AlertDescription>
        </Alert>

        {/* Numeric ID Section */}
        <div className="space-y-3">
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
              disabled={loading}
            />
            {canUpdateId && (
              <Button
                onClick={handleUpdateNumericId}
                disabled={loading}
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
          <div className="space-y-4">
            {isEnabled ? (
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
                    disabled={loading}
                    className="font-mono"
                  >
                    Change PIN
                  </Button>
                  <Button
                    onClick={handleDisableQuickAccess}
                    variant="destructive"
                    disabled={loading}
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
                  disabled={loading}
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
          <div className="space-y-4 p-4 border rounded-lg bg-muted/50">
            <h4 className="font-mono uppercase text-sm font-medium">
              {isEnabled ? 'Change PIN' : 'Set PIN for Quick Access'}
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
                  disabled={loading}
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
                  disabled={loading}
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
                disabled={!canEnroll || loading}
                className="font-mono"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent mr-2" />
                    {isEnabled ? 'Updating...' : 'Enrolling...'}
                  </>
                ) : (
                  <>
                    <ShieldCheck className="h-4 w-4 mr-2" />
                    {isEnabled ? 'Update PIN' : 'Enable Quick Access'}
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
                disabled={loading}
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
      </CardContent>
    </Card>
  );
}