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
  
  const vaultNumber = profile?.vault_number || 111;

  useEffect(() => {
    const progressRef = { value: 0, msgIndex: 0, charIndex: 0 };
    let currentMsg = '';
    
    const id = setInterval(() => {
      // Advance progress
      progressRef.value = Math.min(progressRef.value + 2.5, 100);
      setProgress(progressRef.value);
      
      // Advance message every ~6-7 ticks (500ms equivalent)
      if (progressRef.value % 15 < 2.5 && progressRef.msgIndex < bootMessages.length - 1) {
        progressRef.msgIndex++;
        progressRef.charIndex = 0;
        currentMsg = '';
        setCurrentMessage(progressRef.msgIndex);
      }
      
      // Typewriter effect - advance characters
      const message = bootMessages[progressRef.msgIndex];
      if (progressRef.charIndex < message.length) {
        progressRef.charIndex++;
        currentMsg = message.slice(0, progressRef.charIndex);
        setDisplayText(currentMsg);
      }
    }, 80);

    return () => clearInterval(id);
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center pip-scanlines bg-pip-bg-primary">
      <Card variant="pip-terminal" className="p-pip-lg max-w-2xl w-full mx-4">
        <div className="text-center space-y-8">
          {/* CHIMERA-TEC Industries Logo */}
          <div className="flex flex-col items-center justify-center space-y-6 animate-pip-boot">
            <div className="relative">
              {/* Logo Image */}
              <img 
                src="/lovable-uploads/c0058fa9-21ea-47dd-a1f1-53697176a3cd.png" 
                alt="CHIMERA-TEC Industries Logo"
                className="w-56 h-auto object-scale-down pip-glow animate-pip-flicker"
              />
            </div>
            
            <div className="text-center">
              <h1 className="text-4xl font-pip-display font-bold text-pip-text-bright pip-text-glow">
                CHIMERA-TEC INDUSTRIES
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