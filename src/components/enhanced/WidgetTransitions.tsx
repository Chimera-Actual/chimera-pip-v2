import React, { memo } from 'react';
import { BaseWidget } from '@/types/widgets';
import { AnimatedTransition, StaggeredContainer, HoverEffect } from '@/components/ui/animated-transitions';
import { InteractiveFeedback, PipBoyProgress, StatusIndicator } from '@/components/ui/interactive-feedback';
import { cn } from '@/lib/utils';

interface WidgetTransitionsProps {
  widget: BaseWidget;
  children: React.ReactNode;
  isLoading?: boolean;
  loadingProgress?: number;
  status?: 'active' | 'inactive' | 'error';
  className?: string;
}

export const WidgetTransitions: React.FC<WidgetTransitionsProps> = memo(({
  widget,
  children,
  isLoading = false,
  loadingProgress = 0,
  status = 'active',
  className
}) => {
  return (
    <AnimatedTransition
      type="fade"
      speed="normal"
      className={cn('relative overflow-hidden', className)}
    >
      <HoverEffect 
        effect="glow" 
        intensity="medium"
        className="w-full h-full"
      >
        <div className="pip-container relative">
          {/* Status indicator */}
          <div className="absolute top-2 right-2 z-10">
            <StatusIndicator 
              status={status === 'active' ? 'online' : status === 'error' ? 'busy' : 'offline'}
              size="sm"
              animated
            />
          </div>

          {/* Loading overlay */}
          {isLoading && (
            <div className="absolute inset-0 bg-pip-bg-overlay/80 backdrop-blur-sm z-20 flex items-center justify-center">
              <div className="text-center space-y-4">
                <div className="animate-pip-static text-pip-green-primary">
                  Loading {widget.type}...
                </div>
                <PipBoyProgress 
                  progress={loadingProgress}
                  className="w-32"
                  showPercentage={false}
                />
              </div>
            </div>
          )}

          {/* Content with staggered animation */}
          <StaggeredContainer stagger={100}>
            {children}
          </StaggeredContainer>
        </div>
      </HoverEffect>
    </AnimatedTransition>
  );
});

WidgetTransitions.displayName = 'WidgetTransitions';

// Enhanced Widget Grid with animations
interface AnimatedWidgetGridProps {
  children: React.ReactNode;
  className?: string;
}

export const AnimatedWidgetGrid: React.FC<AnimatedWidgetGridProps> = memo(({
  children,
  className
}) => {
  return (
    <div 
      className={cn(
        'grid gap-6 auto-rows-max p-4',
        'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
        'widget-grid-stable',
        className
      )}
      style={{
        contain: 'layout',
        minHeight: '400px'
      }}
    >
      <StaggeredContainer stagger={150}>
        {children}
      </StaggeredContainer>
    </div>
  );
});

AnimatedWidgetGrid.displayName = 'AnimatedWidgetGrid';

// Widget Loading States
export const WidgetLoadingStates = {
  Skeleton: memo(() => (
    <div className="pip-container animate-pulse p-4 space-y-3">
      <div className="flex items-center space-x-3">
        <div className="w-5 h-5 bg-pip-bg-secondary rounded animate-pip-glow" />
        <div className="h-4 bg-pip-bg-secondary rounded w-24 animate-pip-glow" />
      </div>
      <div className="space-y-2">
        <div className="h-3 bg-pip-bg-secondary/50 rounded w-full animate-pip-glow" />
        <div className="h-3 bg-pip-bg-secondary/50 rounded w-3/4 animate-pip-glow" />
        <div className="h-3 bg-pip-bg-secondary/50 rounded w-1/2 animate-pip-glow" />
      </div>
    </div>
  )),

  Boot: memo(({ message = 'Initializing...' }: { message?: string }) => (
    <div className="pip-container flex items-center justify-center p-8">
      <div className="text-center space-y-4">
        <div className="animate-pip-boot text-pip-green-primary font-mono text-lg">
          {message}
        </div>
        <div className="w-16 h-0.5 bg-pip-green-primary animate-pip-glow mx-auto" />
      </div>
    </div>
  )),

  Error: memo(({ error = 'Widget Error' }: { error?: string }) => (
    <div className="pip-container border-red-500/50 p-4">
      <InteractiveFeedback 
        type="error"
        message={error}
        duration={0}
        showIcon
        className="bg-transparent border-0 p-0"
      />
    </div>
  )),
};

WidgetLoadingStates.Skeleton.displayName = 'WidgetSkeleton';
WidgetLoadingStates.Boot.displayName = 'WidgetBoot';
WidgetLoadingStates.Error.displayName = 'WidgetError';