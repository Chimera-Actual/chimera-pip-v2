import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Zap } from 'lucide-react';

const bootMessages = [
  'INITIALIZING VAULT-TEC SYSTEMS...',
  'LOADING PERSONAL INFORMATION PROCESSOR...',
  'CALIBRATING HOLOGRAPHIC DISPLAY...',
  'ESTABLISHING WASTELAND NETWORK CONNECTION...',
  'VERIFYING USER CREDENTIALS...',
  'SYNCHRONIZING S.P.E.C.I.A.L. ATTRIBUTES...',
  'CHIMERA-PIP 4000 mk2 READY FOR OPERATION'
];

export const BootSequence: React.FC = () => {
  const [currentMessage, setCurrentMessage] = useState(0);
  const [progress, setProgress] = useState(0);
  const [displayText, setDisplayText] = useState('');

  useEffect(() => {
    const messageInterval = setInterval(() => {
      if (currentMessage < bootMessages.length - 1) {
        setCurrentMessage(prev => prev + 1);
      }
    }, 400);

    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) return 100;
        return prev + 2;
      });
    }, 60);

    return () => {
      clearInterval(messageInterval);
      clearInterval(progressInterval);
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
          {/* Vault-Tec Logo */}
          <div className="flex items-center justify-center space-x-4 animate-pip-boot">
            <Zap className="h-16 w-16 text-primary pip-text-glow animate-pip-flicker" />
            <div>
              <h1 className="text-4xl font-pip-display font-bold text-pip-text-bright pip-text-glow">
                VAULT-TEC
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
            <p>COPYRIGHT 2287 VAULT-TEC CORPORATION</p>
            <p>ALL RIGHTS RESERVED</p>
          </div>
        </div>
      </Card>
    </div>
  );
};