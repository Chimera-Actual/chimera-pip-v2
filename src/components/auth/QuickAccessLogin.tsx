/**
 * Quick Access login form with numeric ID + PIN entry
 */

import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { QuickAccessPad } from './QuickAccessPad';
import { validateNumericId, validatePin } from '@/lib/quickaccess/crypto';
import { 
  isLockedOut, 
  getRemainingLockoutTime, 
  getAttemptsRemaining,
  formatLockoutTime 
} from '@/lib/quickaccess/lockout';
import { AlertCircle, Shield, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface QuickAccessLoginProps {
  onSubmit: (numericId: string, pin: string) => Promise<void>;
  loading?: boolean;
  error?: string | null;
  onSwitchToStandard: () => void;
}

export function QuickAccessLogin({
  onSubmit,
  loading = false,
  error,
  onSwitchToStandard
}: QuickAccessLoginProps) {
  const [numericId, setNumericId] = useState('');
  const [pin, setPin] = useState('');
  const [showKeypad, setShowKeypad] = useState(false);
  const [lockoutTime, setLockoutTime] = useState(0);
  const [attemptsRemaining, setAttemptsRemaining] = useState(5);

  // Update lockout state
  useEffect(() => {
    const updateLockoutState = () => {
      if (numericId && validateNumericId(numericId)) {
        const remaining = getRemainingLockoutTime(numericId);
        const attempts = getAttemptsRemaining(numericId);
        setLockoutTime(remaining);
        setAttemptsRemaining(attempts);
      } else {
        setLockoutTime(0);
        setAttemptsRemaining(5);
      }
    };

    updateLockoutState();
    
    // Update every second when locked out
    let interval: NodeJS.Timeout | null = null;
    if (lockoutTime > 0) {
      interval = setInterval(updateLockoutState, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [numericId, lockoutTime]);

  const isLocked = lockoutTime > 0;
  const canSubmit = validateNumericId(numericId) && validatePin(pin) && !loading && !isLocked;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    
    try {
      await onSubmit(numericId, pin);
    } catch (error) {
      console.error('Quick access login error:', error);
    }
  };

  const handleKeypadDigit = (digit: string) => {
    if (pin.length < 8) {
      setPin(prev => prev + digit);
    }
  };

  const handleKeypadBackspace = () => {
    setPin(prev => prev.slice(0, -1));
  };

  const handleKeypadClear = () => {
    setPin('');
  };

  const handleKeypadSubmit = () => {
    if (canSubmit) {
      handleSubmit();
    }
  };

  const handleNumericIdChange = (value: string) => {
    // Only allow digits
    const cleaned = value.replace(/\D/g, '').slice(0, 9);
    setNumericId(cleaned);
    
    // Auto-focus PIN when numeric ID is valid
    if (validateNumericId(cleaned) && !showKeypad) {
      setShowKeypad(true);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="flex items-center justify-center mb-2">
          <Shield className="h-6 w-6 text-primary mr-2" />
          <h2 className="text-xl font-mono uppercase text-primary">
            Quick Access
          </h2>
        </div>
        <p className="text-sm text-muted-foreground">
          Enter your Numeric ID and PIN for glove-friendly access
        </p>
      </div>

      {/* Error Display */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Lockout Warning */}
      {isLocked && (
        <Alert variant="destructive">
          <Clock className="h-4 w-4" />
          <AlertDescription>
            Too many failed attempts. Try again in {formatLockoutTime(lockoutTime)}.
          </AlertDescription>
        </Alert>
      )}

      {/* Attempts Warning */}
      {!isLocked && attemptsRemaining <= 3 && attemptsRemaining > 0 && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {attemptsRemaining} attempt{attemptsRemaining !== 1 ? 's' : ''} remaining before lockout.
          </AlertDescription>
        </Alert>
      )}

      {/* Numeric ID Input */}
      <div className="space-y-2">
        <Label htmlFor="numericId" className="text-sm font-mono uppercase">
          Numeric ID
        </Label>
        <Input
          id="numericId"
          type="tel"
          value={numericId}
          onChange={(e) => handleNumericIdChange(e.target.value)}
          placeholder="Enter 3-9 digits"
          maxLength={9}
          className={cn(
            "text-center text-lg font-mono",
            validateNumericId(numericId) && "border-primary/50 bg-primary/5"
          )}
          disabled={loading || isLocked}
          autoComplete="off"
        />
        {numericId && !validateNumericId(numericId) && (
          <p className="text-xs text-destructive">
            Numeric ID must be 3-9 digits
          </p>
        )}
      </div>

      {/* PIN Input */}
      <div className="space-y-2">
        <Label htmlFor="pin" className="text-sm font-mono uppercase">
          PIN
        </Label>
        <Input
          id="pin"
          type="password"
          value={pin}
          onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 8))}
          placeholder="Enter 4-8 digit PIN"
          maxLength={8}
          className={cn(
            "text-center text-lg font-mono tracking-wider",
            validatePin(pin) && "border-primary/50 bg-primary/5"
          )}
          disabled={loading || isLocked}
          autoComplete="off"
          onFocus={() => setShowKeypad(true)}
        />
        {pin && !validatePin(pin) && (
          <p className="text-xs text-destructive">
            PIN must be 4-8 digits
          </p>
        )}
      </div>

      {/* Keypad */}
      {showKeypad && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-mono uppercase text-muted-foreground">
              Keypad
            </h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowKeypad(false)}
              className="text-xs"
            >
              Hide Keypad
            </Button>
          </div>
          
          <QuickAccessPad
            onDigit={handleKeypadDigit}
            onBackspace={handleKeypadBackspace}
            onClear={handleKeypadClear}
            onSubmit={handleKeypadSubmit}
            disabled={loading || isLocked}
          />
        </div>
      )}

      {/* Submit Button */}
      <Button
        onClick={handleSubmit}
        disabled={!canSubmit}
        className="w-full"
        size="lg"
      >
        {loading ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent mr-2" />
            Unlocking...
          </>
        ) : (
          'Unlock Vault'
        )}
      </Button>

      {/* Switch to Standard Login */}
      <div className="text-center">
        <Button
          variant="ghost"
          onClick={onSwitchToStandard}
          className="text-sm text-muted-foreground hover:text-foreground"
          disabled={loading}
        >
          Use Standard Login Instead
        </Button>
      </div>

      {/* Help Text */}
      <div className="text-center text-xs text-muted-foreground space-y-1">
        <p>Quick Access stores encrypted session data on this device only.</p>
        <p>Set up Quick Access in Settings after logging in normally.</p>
      </div>
    </div>
  );
}