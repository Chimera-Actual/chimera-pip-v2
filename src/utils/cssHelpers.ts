/**
 * CSS utility functions for the modular design system
 */

export const getThemeVariable = (variable: string): string => {
  return `hsl(var(--${variable}))`;
};

export const getPipBoyColor = (color: 'primary' | 'secondary' | 'muted' | 'glow'): string => {
  return `hsl(var(--pip-green-${color}))`;
};

export const getPipBoyText = (variant: 'primary' | 'secondary' | 'muted' | 'bright'): string => {
  return `hsl(var(--pip-text-${variant}))`;
};

export const getPipBoyBackground = (variant: 'primary' | 'secondary' | 'tertiary' | 'overlay'): string => {
  return `hsl(var(--pip-bg-${variant}))`;
};

export const getPipBoyBorder = (variant: 'normal' | 'bright'): string => {
  return variant === 'bright' 
    ? `hsl(var(--pip-border-bright))` 
    : `hsl(var(--pip-border))`;
};

export const createPipBoyGradient = (direction: string = '135deg'): string => {
  return `linear-gradient(${direction}, ${getPipBoyColor('primary')}, ${getPipBoyColor('secondary')})`;
};

export const createGlowEffect = (intensity: 'light' | 'medium' | 'strong' = 'medium'): string => {
  const intensityMap = {
    light: '0.2',
    medium: '0.4', 
    strong: '0.6'
  };
  
  return `0 0 20px ${getPipBoyColor('glow')}/${intensityMap[intensity]}`;
};