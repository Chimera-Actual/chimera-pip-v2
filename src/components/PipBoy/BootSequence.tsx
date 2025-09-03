import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/contexts/AuthContext';

const bootMessages = [
  'INITIALIZING CHIMERA-TEC SYSTEMS...',
  'LOADING PERSONAL INFORMATION PROCESSOR...',
  'CALIBRATING HOLOGRAPHIC DISPLAY...',
  'ESTABLISHING WASTELAND NETWORK CONNECTION...',
  'VERIFYING USER CREDENTIALS...',
  'SYNCHRONIZING S.P.E.C.I.A.L. ATTRIBUTES...',
  'CHIMERA-PIP 4000 mk2 READY FOR OPERATION'
];

export const BootSequence: React.FC = () => {
  const { profile } = useAuth();
  const [currentMessage, setCurrentMessage] = useState(0);
  const [progress, setProgress] = useState(0);
  const [displayText, setDisplayText] = useState('');
  const [doorRotation, setDoorRotation] = useState(0);
  
  const vaultNumber = profile?.vault_number || 111;

  useEffect(() => {
    const messageInterval = setInterval(() => {
      if (currentMessage < bootMessages.length - 1) {
        setCurrentMessage(prev => prev + 1);
      }
    }, 500);

    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) return 100;
        return prev + 2.5;
      });
    }, 75);

    const doorInterval = setInterval(() => {
      setDoorRotation(prev => (prev + 10) % 360);
    }, 100);

    return () => {
      clearInterval(messageInterval);
      clearInterval(progressInterval);
      clearInterval(doorInterval);
    };
  }, [currentMessage]);

  useEffect(() => {
    // Typewriter effect for the current message
    const message = bootMessages[currentMessage];
    let index = 0;
    setDisplayText('');

    const typewriter = setInterval(() => {
      if (index < message.length) {
        setDisplayText(message.slice(0, index + 1));
        index++;
      } else {
        clearInterval(typewriter);
      }
    }, 30);

    return () => clearInterval(typewriter);
  }, [currentMessage]);

  return (
    <div className="min-h-screen flex items-center justify-center pip-scanlines bg-pip-bg-primary">
      <Card className="pip-terminal pip-glow border-2 border-pip-border-bright/30 p-8 max-w-2xl w-full mx-4">
        <div className="text-center space-y-8">
          {/* CHIMERA-TEC Logo with Animated Vault Door */}
          <div className="flex flex-col items-center justify-center space-y-4 animate-pip-boot">
            <div className="relative w-32 h-32 mb-4">
              {/* Vault Door */}
              <div className="absolute inset-0 border-4 border-primary rounded-full pip-glow">
                <div className="relative w-full h-full">
                  {/* Door Segments */}
                  {[...Array(8)].map((_, i) => (
                    <div
                      key={i}
                      className="absolute w-1 h-12 bg-primary origin-bottom left-1/2 top-0"
                      style={{
                        transform: `translateX(-50%) rotate(${(i * 45) + doorRotation}deg)`,
                        opacity: 0.8
                      }}
                    />
                  ))}
                  
                  {/* Vault Number */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-2xl font-pip-display font-bold text-primary pip-text-glow">
                      {vaultNumber.toString().padStart(3, '0')}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="text-center">
              <h1 className="text-4xl font-pip-display font-bold text-pip-text-bright pip-text-glow">
                CHIMERA-TEC
              </h1>
              <p className="text-lg text-pip-text-secondary font-pip-mono">
                PREPARE FOR THE FUTURE
              </p>
            </div>
          </div>

          {/* Boot Messages */}
          <div className="space-y-4">
            <div className="h-20 flex items-center justify-center">
              <p className="text-lg font-pip-mono text-primary pip-text-glow">
                {displayText}
                <span className="animate-pulse">_</span>
              </p>
            </div>

            {/* Progress Bar */}
            <div className="space-y-2">
              <Progress 
                value={progress} 
                className="h-3 bg-pip-bg-secondary border border-pip-border"
              />
              <p className="text-sm font-pip-mono text-pip-text-muted">
                LOADING... {Math.round(progress)}%
              </p>
            </div>
          </div>

          {/* System Info */}
          <div className="space-y-2 text-xs font-pip-mono text-pip-text-muted">
            <p>CHIMERA-PIP 4000 mk2 v2.1.7</p>
            <p>COPYRIGHT 2287 CHIMERA-TEC CORPORATION</p>
            <p>ALL RIGHTS RESERVED</p>
          </div>
        </div>
      </Card>
    </div>
  );
};