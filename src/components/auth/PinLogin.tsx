import React, { useState, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Shield, Delete, RefreshCw } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

export const PinLogin: React.FC = () => {
  const [pin, setPin] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [keypadLayout, setKeypadLayout] = useState(() => generateRandomKeypad());
  const { signIn } = useAuth();
  const navigate = useNavigate();

  // Generate randomized keypad layout for security
  function generateRandomKeypad() {
    const numbers = Array.from({ length: 10 }, (_, i) => i.toString());
    return shuffleArray(numbers);
  }

  function shuffleArray<T>(array: T[]): T[] {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  }

  const handleNumberPress = useCallback((number: string) => {
    if (pin.length < 6) {
      setPin(prev => prev + number);
      setError('');
      
      // Haptic feedback on supported devices
      if ('vibrate' in navigator) {
        navigator.vibrate(50);
      }
    }
  }, [pin.length]);

  const handleDelete = useCallback(() => {
    setPin(prev => prev.slice(0, -1));
    setError('');
  }, []);

  const handleRandomize = useCallback(() => {
    setKeypadLayout(generateRandomKeypad());
    setPin('');
    setError('');
  }, []);

  const handleSubmit = async () => {
    if (pin.length !== 6) {
      setError('PIN must be 6 digits');
      return;
    }

    setIsLoading(true);
    // For demo purposes, we'll use the PIN as password
    // In production, this would be properly hashed and validated
    const { error } = await signIn('demo@chimera-tec.com', pin);
    
    if (!error) {
      navigate('/');
    } else {
      setError('Invalid PIN. Access denied.');
      setPin('');
      setKeypadLayout(generateRandomKeypad());
    }
    setIsLoading(false);
  };

  const renderPinDisplay = () => (
    <div className="flex justify-center space-x-2 mb-8">
      {Array.from({ length: 6 }).map((_, index) => (
        <div
          key={index}
          className={`w-4 h-4 rounded-full border-2 transition-all duration-200 ${
            index < pin.length
              ? 'bg-primary border-primary pip-text-glow'
              : 'border-pip-border bg-transparent'
          }`}
        />
      ))}
    </div>
  );

  const renderKeypad = () => (
    <div className="grid grid-cols-3 gap-4 max-w-xs mx-auto">
      {keypadLayout.slice(1).map((number) => (
        <Button
          key={number}
          variant="outline"
          size="lg"
          className="h-16 w-16 text-2xl font-mono font-bold pip-terminal border-pip-border hover:border-primary hover:bg-primary/20 transition-all duration-200"
          onClick={() => handleNumberPress(number)}
          disabled={isLoading}
        >
          {number}
        </Button>
      ))}
      
      {/* Special buttons for bottom row */}
      <Button
        variant="outline"
        size="lg"
        className="h-16 w-16 pip-terminal border-pip-border hover:border-destructive hover:bg-destructive/20"
        onClick={handleDelete}
        disabled={isLoading || pin.length === 0}
      >
        <Delete className="h-6 w-6" />
      </Button>
      
      <Button
        variant="outline"
        size="lg"
        className="h-16 w-16 text-2xl font-mono font-bold pip-terminal border-pip-border hover:border-primary hover:bg-primary/20"
        onClick={() => handleNumberPress(keypadLayout[0])}
        disabled={isLoading}
      >
        {keypadLayout[0]}
      </Button>
      
      <Button
        variant="outline"
        size="lg"
        className="h-16 w-16 pip-terminal border-pip-border hover:border-primary hover:bg-primary/20"
        onClick={handleRandomize}
        disabled={isLoading}
      >
        <RefreshCw className="h-6 w-6" />
      </Button>
    </div>
  );

  return (
    <div className="min-h-screen pip-scanlines bg-pip-bg-primary flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card variant="pip-terminal" className="p-pip-lg">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <Shield className="h-12 w-12 text-primary pip-text-glow" />
            </div>
            <h1 className="text-2xl font-display font-bold text-pip-text-bright pip-text-glow">
              SECURITY PIN ACCESS
            </h1>
            <p className="text-pip-text-secondary mt-2 font-mono text-sm">
              Enter your 6-digit security PIN
            </p>
          </div>

          {/* PIN Display */}
          {renderPinDisplay()}

          {/* Error Message */}
          {error && (
            <div className="text-center mb-4">
              <p className="text-destructive text-sm font-mono pip-text-glow">
                {error}
              </p>
            </div>
          )}

          {/* Keypad */}
          {renderKeypad()}

          {/* Submit Button */}
          <div className="mt-8">
            <Button
              onClick={handleSubmit}
              disabled={pin.length !== 6 || isLoading}
              className="w-full pip-button-glow font-mono font-bold text-base py-3"
            >
              {isLoading ? 'VERIFYING...' : 'ACCESS VAULT'}
            </Button>
          </div>

          {/* Info */}
          <div className="mt-6 text-center">
            <p className="text-pip-text-muted font-mono text-xs">
              Keypad randomized for security
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};