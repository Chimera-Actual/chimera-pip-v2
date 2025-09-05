import { Progress } from '@/components/ui/progress';
import { Check, X } from 'lucide-react';

interface PasswordStrengthIndicatorProps {
  password: string;
}

export const PasswordStrengthIndicator = ({
  password
}) => {
  const getPasswordStrength = (password: string): number => {
    let strength = 0;
    if (password.length >= 8) strength += 25;
    if (/[A-Z]/.test(password)) strength += 25;
    if (/[0-9]/.test(password)) strength += 25;
    if (/[^A-Za-z0-9]/.test(password)) strength += 25;
    return strength;
  };

  const getSecurityLevel = (strength: number): string => {
    if (strength < 25) return 'INSUFFICIENT';
    if (strength < 50) return 'LOW';
    if (strength < 75) return 'MODERATE';
    return 'HIGH';
  };

  const passwordRequirements = [
    { test: password.length >= 8, label: 'At least 8 characters' },
    { test: /[A-Z]/.test(password), label: 'Uppercase letter' },
    { test: /[0-9]/.test(password), label: 'Number' },
    { test: /[^A-Za-z0-9]/.test(password), label: 'Special character' },
  ];

  const passwordStrength = getPasswordStrength(password);
  const securityLevel = getSecurityLevel(passwordStrength);

  if (!password) return null;

  return (
    <div className="mt-3 space-y-2">
      <div className="flex justify-between items-center">
        <span className="text-xs font-mono text-pip-text-secondary">
          SECURITY CLEARANCE LEVEL
        </span>
        <span className={`text-xs font-mono font-bold ${
          passwordStrength >= 75 ? 'text-primary' : 
          passwordStrength >= 50 ? 'text-yellow-500' : 'text-destructive'
        }`}>
          {securityLevel}
        </span>
      </div>
      <Progress value={passwordStrength} className="h-2" />
      
      {/* Requirements Checklist */}
      <div className="space-y-1">
        {passwordRequirements.map((req, index) => (
          <div key={index} className="flex items-center space-x-2 text-xs">
            {req.test ? (
              <Check className="h-3 w-3 text-primary" />
            ) : (
              <X className="h-3 w-3 text-pip-text-muted" />
            )}
            <span className={`font-mono ${req.test ? 'text-primary' : 'text-pip-text-muted'}`}>
              {req.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};