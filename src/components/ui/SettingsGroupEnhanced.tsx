import React from 'react';
import { cn } from '@/lib/utils';
import { ChevronDown, AlertTriangle } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface SettingsGroupEnhancedProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'primary' | 'secondary' | 'danger' | 'advanced';
  collapsible?: boolean;
  defaultOpen?: boolean;
  priority?: 'high' | 'medium' | 'low';
}

const variantStyles = {
  default: 'border-pip-border bg-pip-surface/30',
  primary: 'border-pip-accent/30 bg-pip-accent/5 shadow-sm',
  secondary: 'border-pip-border/50 bg-pip-surface/20',
  danger: 'border-destructive/30 bg-destructive/5 shadow-sm',
  advanced: 'border-pip-border/30 bg-pip-surface/10 opacity-90',
};

const titleStyles = {
  default: 'text-pip-text-bright',
  primary: 'text-pip-accent font-semibold',
  secondary: 'text-pip-text-bright',
  danger: 'text-destructive font-semibold',
  advanced: 'text-pip-text-muted',
};

const priorityIndicators = {
  high: 'border-l-4 border-l-pip-accent',
  medium: 'border-l-2 border-l-pip-border',
  low: 'border-l border-l-pip-border/50',
};

export const SettingsGroupEnhanced: React.FC<SettingsGroupEnhancedProps> = ({
  title,
  description,
  children,
  className,
  variant = 'default',
  collapsible = false,
  defaultOpen = true,
  priority,
}) => {
  const [isOpen, setIsOpen] = React.useState(defaultOpen);

  const containerClasses = cn(
    'rounded-lg border p-5 space-y-4 transition-all duration-200',
    variantStyles[variant],
    priority && priorityIndicators[priority],
    'hover:shadow-md hover:border-opacity-70',
    className
  );

  const titleClasses = cn(
    'text-base font-pip-display font-medium tracking-wide',
    titleStyles[variant],
    collapsible && 'cursor-pointer select-none'
  );

  const content = (
    <div className={containerClasses}>
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {variant === 'danger' && (
              <AlertTriangle className="h-4 w-4 text-destructive" />
            )}
            <h3 className={titleClasses}>
              {title}
            </h3>
          </div>
          {collapsible && (
            <ChevronDown 
              className={cn(
                "h-4 w-4 text-pip-text-muted transition-transform duration-200",
                !isOpen && "rotate-180"
              )}
            />
          )}
        </div>
        
        {description && (
          <p className="text-sm text-pip-text-muted font-pip-mono leading-relaxed">
            {description}
          </p>
        )}
      </div>

      <div className="space-y-4">
        {children}
      </div>
    </div>
  );

  if (collapsible) {
    return (
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <div onClick={() => setIsOpen(!isOpen)}>
            {content}
          </div>
        </CollapsibleTrigger>
        <CollapsibleContent>
          {/* Content is already rendered above */}
        </CollapsibleContent>
      </Collapsible>
    );
  }

  return content;
};

// Specialized group components for common use cases
export const PrimarySettingsGroup: React.FC<Omit<SettingsGroupEnhancedProps, 'variant' | 'priority'>> = (props) => (
  <SettingsGroupEnhanced {...props} variant="primary" priority="high" />
);

export const SecondarySettingsGroup: React.FC<Omit<SettingsGroupEnhancedProps, 'variant' | 'priority'>> = (props) => (
  <SettingsGroupEnhanced {...props} variant="secondary" priority="medium" />
);

export const AdvancedSettingsGroup: React.FC<Omit<SettingsGroupEnhancedProps, 'variant' | 'collapsible' | 'priority'>> = (props) => (
  <SettingsGroupEnhanced {...props} variant="advanced" collapsible={true} defaultOpen={false} priority="low" />
);

export const DangerZoneGroup: React.FC<Omit<SettingsGroupEnhancedProps, 'variant'>> = (props) => (
  <div className="pt-6 border-t border-pip-border/30 mt-8">
    <SettingsGroupEnhanced {...props} variant="danger" />
  </div>
);