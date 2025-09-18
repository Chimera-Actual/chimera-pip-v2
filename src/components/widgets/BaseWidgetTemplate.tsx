import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTabManagerContext } from '@/contexts/TabManagerContext';
import { WidgetActionButtons } from './WidgetActionButtons';
import { cn } from '@/lib/utils';
import type { WidgetTemplateProps } from '@/types/widget';

export const BaseWidgetTemplate: React.FC<WidgetTemplateProps> = ({
  title,
  widgetId,
  settings = {},
  icon: Icon,
  showControls = true,
  headerActions,
  widgetSpecificActions,
  standardControls,
  children,
  className = '',
  contentClassName = '',
  headerClassName = '',
  cardClassName = ''
}) => {
  // Check if we're inside a PipBoy tab context (contextual header)
  // Only apply seamless styling when actually inside PipBoy tab components, not on main canvas
  const isInTabContext = false; // Always show proper containers on main canvas
  const displayTitle = settings?.title || title || 'Widget';
  
  // In tab context: always show header with title and icon, controls are handled externally
  // Standalone: show full header with title and icon
  const shouldShowHeader = true;
  const shouldShowTitleAndIcon = settings?.showTitle !== false;
  
  return (
    <Card className={cn(
      "w-full relative group transition-all duration-300",
      // Contextual styling based on location
      isInTabContext 
        ? "bg-transparent border-0 shadow-none" // Seamless in tab context
        : "bg-pip-bg-secondary border-pip-border hover:border-pip-border-bright", // Standalone styling
      settings?.effects?.glow && !isInTabContext && "shadow-lg shadow-primary/20 pip-glow",
      cardClassName,
      className
    )}>
      {/* Header - Always show when there's content to display */}
      {shouldShowHeader && (
        <CardHeader className={cn(
          isInTabContext 
            ? "pb-3" // Standard spacing in tab context
            : "border-b border-pip-border", // Full header standalone
          headerClassName
        )}>
          <div className="flex items-center justify-between">
            {/* Title and Icon */}
            {shouldShowTitleAndIcon && (
              <div className="flex items-center gap-3">
                {Icon && (
                  <div className="p-2 rounded-lg bg-pip-bg-tertiary border border-pip-border">
                    <Icon className="h-5 w-5 text-pip-text-bright" />
                  </div>
                )}
                <div>
                  <CardTitle className="text-pip-text-bright font-pip-display pip-text-glow text-sm">
                    {displayTitle}
                  </CardTitle>
                  {settings?.description && settings?.showDescription !== false && (
                    <p className="text-pip-text-secondary font-pip-mono text-xs mt-1">
                      {settings.description}
                    </p>
                  )}
                </div>
              </div>
            )}
            
            {/* Actions - Show widget-specific actions, standard controls, or custom header actions */}
            {(widgetSpecificActions || standardControls || headerActions) && (
              <div className="flex items-center gap-2">
                {widgetSpecificActions}
                {standardControls}
                {headerActions}
              </div>
            )}
          </div>
        </CardHeader>
      )}

      {/* Content */}
      <CardContent className={cn(
        "p-0", 
        contentClassName
      )}>
        {children}
      </CardContent>

      {/* Visual Effects - Only in standalone mode */}
      {!isInTabContext && settings?.effects?.scanlines && (
        <div className="absolute inset-0 pointer-events-none">
          <div className="w-full h-full opacity-10 bg-gradient-to-b from-transparent via-pip-text-bright to-transparent animate-pulse" 
               style={{
                 backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,255,0,0.1) 2px, rgba(0,255,0,0.1) 4px)',
               }} />
        </div>
      )}

      {!isInTabContext && settings?.effects?.particles && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-1 h-1 bg-primary/30 rounded-full animate-ping" />
          <div className="absolute top-3/4 right-1/3 w-1 h-1 bg-primary/20 rounded-full animate-ping animation-delay-300" />
          <div className="absolute bottom-1/4 left-2/3 w-1 h-1 bg-primary/40 rounded-full animate-ping animation-delay-700" />
        </div>
      )}
    </Card>
  );
};