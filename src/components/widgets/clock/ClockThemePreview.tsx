import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { timeUtils } from './utils/timeUtils';

interface ClockThemePreviewProps {
  theme: string;
  showSeconds?: boolean;
  format24?: boolean;
  showDate?: boolean;
}

export const ClockThemePreview: React.FC<ClockThemePreviewProps> = React.memo(({
  theme,
  showSeconds = true,
  format24 = false,
  showDate = true
}) => {
  const [previewTime, setPreviewTime] = useState(new Date());

  useEffect(() => {
    // Use a less frequent update for preview to reduce performance impact
    const interval = setInterval(() => {
      setPreviewTime(new Date());
    }, showSeconds ? 1000 : 60000); // Update every minute if seconds aren't shown

    return () => clearInterval(interval);
  }, [showSeconds]);

  const getThemeClasses = useCallback((themeName: string) => {
    const themes = {
      'vault-tec': {
        container: 'font-mono',
        glow: 'drop-shadow-[0_0_4px_rgba(var(--primary),0.6)]',
        text: 'text-primary',
        accent: 'text-primary/80'
      },
      'military': {
        container: 'font-bold tracking-wider',
        glow: 'drop-shadow-[0_0_4px_rgba(var(--primary),0.6)]',
        text: 'text-primary',
        accent: 'text-primary/80'
      },
      'nixie': {
        container: 'font-serif italic',
        glow: 'drop-shadow-[0_0_6px_rgba(var(--primary),0.8)]',
        text: 'text-primary',
        accent: 'text-primary/80'
      },
      'led': {
        container: 'font-mono font-black tracking-widest',
        glow: 'drop-shadow-[0_0_3px_rgba(var(--primary),0.9)]',
        text: 'text-primary',
        accent: 'text-primary/80'
      },
      'terminal': {
        container: 'font-mono font-light',
        glow: 'drop-shadow-[0_0_2px_rgba(var(--primary),0.4)]',
        text: 'text-primary',
        accent: 'text-primary/80'
      },
      'plasma': {
        container: 'font-sans font-extralight tracking-wide',
        glow: 'drop-shadow-[0_0_8px_rgba(var(--primary),0.7)] drop-shadow-[0_0_16px_rgba(var(--primary),0.3)]',
        text: 'text-primary',
        accent: 'text-primary/80'
      },
      'hologram': {
        container: 'font-sans font-thin tracking-[0.2em]',
        glow: 'drop-shadow-[0_0_4px_rgba(var(--primary),0.5)] drop-shadow-[0_0_12px_rgba(var(--primary),0.3)]',
        text: 'text-primary opacity-90',
        accent: 'text-primary/70'
      },
      'retro-lcd': {
        container: 'font-mono font-medium',
        glow: 'drop-shadow-[0_0_1px_rgba(var(--primary),0.8)]',
        text: 'text-primary',
        accent: 'text-primary/80'
      }
    };

    return themes[themeName as keyof typeof themes] || themes['vault-tec'];
  }, []);

  const themeClasses = useMemo(() => getThemeClasses(theme), [theme, getThemeClasses]);
  const timeStr = useMemo(() => timeUtils.formatTime(previewTime, format24, showSeconds), [previewTime, format24, showSeconds]);
  const dateStr = useMemo(() => timeUtils.formatDate(previewTime), [previewTime]);

  return (
    <div className={`
      p-3 bg-pip-bg-primary/50 border border-pip-border/50 rounded-md
      ${themeClasses.container} ${themeClasses.glow}
      flex flex-col items-center space-y-1
    `}>
      {/* Time Display */}
      <div className={`text-lg font-bold ${themeClasses.text} leading-none`}>
        {timeStr}
      </div>
      
      {/* Date Display */}
      {showDate && (
        <div className={`text-xs ${themeClasses.accent} leading-none`}>
          {dateStr}
        </div>
      )}
      
      {/* Theme-specific visual elements */}
      {theme === 'nixie' && (
        <div className="flex space-x-1 mt-1">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="w-1 h-1 bg-primary/60 rounded-full animate-pulse"
              style={{ animationDelay: `${i * 0.2}s` }}
            />
          ))}
        </div>
      )}
      
      {theme === 'hologram' && (
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent animate-pulse" />
      )}
      
      {theme === 'plasma' && (
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/10 to-transparent opacity-50" />
      )}
    </div>
  );
});