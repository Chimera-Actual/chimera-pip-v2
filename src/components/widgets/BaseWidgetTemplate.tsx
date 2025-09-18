import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { WidgetTemplateProps } from '@/types/widget';

export const BaseWidgetTemplate: React.FC<WidgetTemplateProps> = ({
  title,
  settings,
  icon: Icon,
  showControls = true,
  headerActions,
  children,
  className,
  contentClassName,
  headerClassName,
  cardClassName,
}) => {
  const displayTitle = settings?.title || title || 'Widget';
  const showHeader = settings?.showTitle !== false || settings?.showDescription !== false || headerActions;

  return (
    <Card className={cn(
      "w-full bg-pip-bg-secondary border-pip-border relative group",
      settings?.effects?.glow && "shadow-lg shadow-primary/20",
      cardClassName,
      className
    )}>
      {/* Widget Controls */}
      {showControls && (
        <div className="absolute top-2 right-2 z-10">
          {headerActions}
        </div>
      )}

      {/* Header */}
      {showHeader && (
        <CardHeader className={cn(
          "border-b border-pip-border",
          headerClassName
        )}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {Icon && <Icon className="h-5 w-5 text-pip-text-bright" />}
              <div>
                {settings?.showTitle !== false && (
                  <CardTitle className="text-pip-text-bright font-pip-display pip-text-glow">
                    {displayTitle}
                  </CardTitle>
                )}
                {settings?.description && settings?.showDescription !== false && (
                  <p className="text-pip-text-secondary font-pip-mono text-xs mt-1">
                    {settings.description}
                  </p>
                )}
              </div>
            </div>
          </div>
        </CardHeader>
      )}

      {/* Content */}
      <CardContent className={cn("p-0", contentClassName)}>
        {children}
      </CardContent>

      {/* Visual Effects */}
      {settings?.effects?.scanlines && (
        <div className="absolute inset-0 pointer-events-none">
          <div className="w-full h-full opacity-10 bg-gradient-to-b from-transparent via-pip-text-bright to-transparent animate-pulse" 
               style={{
                 backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,255,0,0.1) 2px, rgba(0,255,0,0.1) 4px)',
               }} />
        </div>
      )}

      {settings?.effects?.particles && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-1 h-1 bg-primary/30 rounded-full animate-ping" />
          <div className="absolute top-3/4 right-1/3 w-1 h-1 bg-primary/20 rounded-full animate-ping animation-delay-300" />
          <div className="absolute bottom-1/4 left-2/3 w-1 h-1 bg-primary/40 rounded-full animate-ping animation-delay-700" />
        </div>
      )}
    </Card>
  );
};