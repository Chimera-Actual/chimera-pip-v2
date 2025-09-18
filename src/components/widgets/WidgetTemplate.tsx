import React, { memo, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTabManagerContext } from '@/contexts/TabManagerContext';
import { WidgetActionButtons } from './WidgetActionButtons';
import { WidgetControlButtons } from './WidgetControlButtons';
import { getTabIcon } from '@/utils/iconMapping';
import { cn } from '@/lib/utils';
import type { WidgetTemplateProps } from '@/types/widget';

export const WidgetTemplate = memo<WidgetTemplateProps>(({
  title,
  widgetId,
  settings = {},
  icon: Icon,
  showControls = true,
  headerActions,
  widgetSpecificActions,
  standardControls,
  statusBarContent,
  children,
  className = '',
  contentClassName = '',
  headerClassName = '',
  cardClassName = '',
  widget, // Add widget prop for width control
  isCollapsed = false, // Add collapsed state prop
  // StandardWidgetTemplate props
  onRemove,
  onToggleCollapse,
  onToggleFullWidth,
  onOpenSettings,
  showStandardControls = true,
  ...props
}) => {
  // Get the appropriate icon for the widget (from StandardWidgetTemplate logic)
  const ResolvedIcon = Icon || getTabIcon(
    widget?.widget_type || 'widget',
    widget?.widget_config?.icon
  );

  // Prepare standard controls (from StandardWidgetTemplate logic)
  const resolvedStandardControls = useMemo(() => {
    if (!widget || !showStandardControls) return standardControls;
    
    return standardControls || (
      <WidgetControlButtons
        widget={widget}
        onToggleCollapse={onToggleCollapse}
        onToggleFullWidth={onToggleFullWidth}
        onClose={onRemove}
        onSettings={onOpenSettings}
      />
    );
  }, [widget, showStandardControls, standardControls, onToggleCollapse, onToggleFullWidth, onRemove, onOpenSettings]);

  // Check if we're inside a PipBoy tab context (contextual header)
  // Only apply seamless styling when actually inside PipBoy tab components, not on main canvas
  const isInTabContext = false; // Always show proper containers on main canvas
  const displayTitle = settings?.title || title || widget?.widget_config?.title || widget?.widget_type || 'Widget';
  
  // In tab context: always show header with title and icon, controls are handled externally
  // Standalone: show full header with title and icon
  const shouldShowHeader = true;
  const shouldShowTitleAndIcon = settings?.showTitle !== false;
  
  return (
    <Card className={cn(
      "w-full relative group transition-all duration-300",
      // Grid layout support
      widget?.widget_width === 'full' ? 'col-span-2' : 'col-span-1',
      // Contextual styling based on location
      isInTabContext 
        ? "bg-transparent border-0 shadow-none" // Seamless in tab context
        : "bg-pip-bg-secondary border-pip-border hover:border-pip-border-bright pip-widget-card hover:pip-glow-subtle", 
      settings?.effects?.glow && !isInTabContext && "shadow-lg shadow-primary/20 pip-glow",
      isCollapsed && "min-h-[80px]", // Support collapsed state
      cardClassName,
      className
    )}>
      {/* Header - Always show when there's content to display */}
      {shouldShowHeader && (
        <CardHeader className={cn(
          "pb-3 px-4 pt-4", // Consistent padding
          isInTabContext 
            ? "" // Standard spacing in tab context
            : "border-b border-pip-border", // Full header standalone
          headerClassName
        )}>
          <div className="flex items-center justify-between">
            {/* Title and Icon */}
            {shouldShowTitleAndIcon && (
              <div className="flex items-center gap-2">
                {ResolvedIcon && (
                  <ResolvedIcon className="h-4 w-4 text-pip-primary" />
                )}
                <div>
                  <CardTitle className="text-pip-text-primary font-pip-display text-sm font-semibold">
                    {displayTitle}
                  </CardTitle>
                  {settings?.description && settings?.showDescription !== false && (
                    <span className="text-pip-text-muted text-xs">
                      {settings.description}
                    </span>
                  )}
                </div>
              </div>
            )}
            
            {/* Actions - Show widget-specific actions, standard controls, or custom header actions */}
            {(widgetSpecificActions || resolvedStandardControls || headerActions) && (
              <div className="flex items-center gap-2">
                {widgetSpecificActions}
                {resolvedStandardControls}
                {headerActions}
              </div>
            )}
          </div>
        </CardHeader>
      )}

      {/* Status bar - Only show when statusBarContent is provided */}
      {statusBarContent && (
        <div className="w-full px-4 py-2 bg-pip-bg-secondary/30 border-b border-pip-border">
          {statusBarContent}
        </div>
      )}

      {/* Content */}
      <CardContent className={cn(
        isCollapsed ? "p-4" : (shouldShowHeader ? "px-4 pb-4 pt-0" : "p-4"), 
        contentClassName
      )}>
        {isCollapsed ? (
          <div className="flex items-center justify-center py-2">
            <span className="text-pip-text-muted text-xs font-pip-mono">
              Widget collapsed - click to expand
            </span>
          </div>
        ) : (
          <div className="widget-content-direct">
            {children}
          </div>
        )}
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
});