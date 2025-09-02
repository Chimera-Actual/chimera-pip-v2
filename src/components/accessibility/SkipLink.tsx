import React from 'react';
import { Button } from '@/components/ui/button';

interface SkipLinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
}

export const SkipLink: React.FC<SkipLinkProps> = ({ 
  href, 
  children, 
  className = '' 
}) => {
  return (
    <Button
      asChild
      variant="outline"
      className={`
        absolute -top-10 left-4 z-50
        focus:top-4 focus:left-4
        transition-all duration-200
        pip-button-glow
        ${className}
      `}
    >
      <a href={href}>
        {children}
      </a>
    </Button>
  );
};