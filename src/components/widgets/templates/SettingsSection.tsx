import React from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SettingsSectionProps {
  title: string;
  description?: string;
  icon?: LucideIcon;
  children: React.ReactNode;
  className?: string;
  collapsible?: boolean;
  defaultCollapsed?: boolean;
}

export const SettingsSection: React.FC<SettingsSectionProps> = ({
  title,
  description,
  icon: Icon,
  children,
  className,
  collapsible = false,
  defaultCollapsed = false
}) => {
  const [isCollapsed, setIsCollapsed] = React.useState(defaultCollapsed);

  return (
    <div className={cn("space-y-4", className)}>
      {/* Section Header */}
      <div 
        className={cn(
          "flex items-center gap-3 pb-2 border-b border-pip-border/30",
          collapsible && "cursor-pointer hover:opacity-80 transition-opacity"
        )}
        onClick={collapsible ? () => setIsCollapsed(!isCollapsed) : undefined}
      >
        {Icon && <Icon className="h-4 w-4 text-primary" />}
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-primary uppercase tracking-wide font-pip-mono">
            {title}
          </h3>
          {description && (
            <p className="text-xs text-pip-text-muted font-pip-mono mt-1">
              {description}
            </p>
          )}
        </div>
        {collapsible && (
          <div className={cn(
            "transition-transform duration-200",
            isCollapsed ? "rotate-180" : "rotate-0"
          )}>
            ▼
          </div>
        )}
      </div>

      {/* Section Content */}
      {(!collapsible || !isCollapsed) && (
        <div className="pl-0">
          {children}
        </div>
      )}
    </div>
  );
};