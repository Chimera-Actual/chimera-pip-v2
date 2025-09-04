import React, { memo, forwardRef } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const transitionVariants = cva(
  "transition-all duration-300 ease-out",
  {
    variants: {
      type: {
        fade: "animate-fade-in",
        scale: "animate-scale-in", 
        slide: "animate-slide-in-right",
        enter: "animate-enter",
        exit: "animate-exit",
        pipGlow: "animate-pip-glow",
        pipBoot: "animate-pip-boot",
        pipStatic: "animate-pip-static",
      },
      speed: {
        slow: "duration-700",
        normal: "duration-300",
        fast: "duration-150",
      },
      delay: {
        none: "delay-0",
        short: "delay-75",
        medium: "delay-150", 
        long: "delay-300",
      }
    },
    defaultVariants: {
      type: "fade",
      speed: "normal",
      delay: "none",
    },
  }
)

export interface AnimatedTransitionProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof transitionVariants> {
  children: React.ReactNode;
  appear?: boolean;
}

export const AnimatedTransition = memo(forwardRef<HTMLDivElement, AnimatedTransitionProps>(
  ({ className, type, speed, delay, children, appear = true, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          transitionVariants({ type, speed, delay }),
          !appear && "opacity-0",
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
));

AnimatedTransition.displayName = "AnimatedTransition";

// Hover Effects Component
export const HoverEffect = memo(forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    effect?: 'scale' | 'glow' | 'lift' | 'pulse';
    intensity?: 'subtle' | 'medium' | 'strong';
  }
>(({ className, effect = 'scale', intensity = 'medium', children, ...props }, ref) => {
  const effectClasses = {
    scale: {
      subtle: 'hover:scale-[1.02] transition-transform duration-200',
      medium: 'hover:scale-105 transition-transform duration-200',
      strong: 'hover:scale-110 transition-transform duration-200',
    },
    glow: {
      subtle: 'hover:shadow-glow transition-all duration-300',
      medium: 'hover:shadow-glow hover:border-pip-primary/50 transition-all duration-300',
      strong: 'hover:shadow-glow hover:border-pip-primary animate-pip-glow transition-all duration-300',
    },
    lift: {
      subtle: 'hover:-translate-y-0.5 hover:shadow-md transition-all duration-200',
      medium: 'hover:-translate-y-1 hover:shadow-lg transition-all duration-200',
      strong: 'hover:-translate-y-2 hover:shadow-xl transition-all duration-200',
    },
    pulse: {
      subtle: 'hover:animate-pulse',
      medium: 'hover:pip-pulse',
      strong: 'hover:animate-pip-glow',
    }
  };

  return (
    <div
      ref={ref}
      className={cn(effectClasses[effect][intensity], className)}
      {...props}
    >
      {children}
    </div>
  );
}));

HoverEffect.displayName = "HoverEffect";

// Staggered Animation Container
export const StaggeredContainer = memo(({ 
  children, 
  stagger = 100,
  className 
}: {
  children: React.ReactNode;
  stagger?: number;
  className?: string;
}) => {
  const childrenArray = React.Children.toArray(children);
  
  return (
    <div className={className}>
      {childrenArray.map((child, index) => (
        <div
          key={index}
          className="animate-fade-in"
          style={{ animationDelay: `${index * stagger}ms` }}
        >
          {child}
        </div>
      ))}
    </div>
  );
});

StaggeredContainer.displayName = "StaggeredContainer";

// Loading Skeleton with Pip-Boy Theme
export const PipBoyLoader = memo(({ 
  lines = 3, 
  className 
}: { 
  lines?: number; 
  className?: string; 
}) => (
  <div className={cn("space-y-2", className)}>
    {Array.from({ length: lines }).map((_, i) => (
      <div
        key={i}
        className="h-3 bg-pip-bg-secondary/30 rounded animate-pip-glow"
        style={{ 
          width: `${Math.random() * 40 + 60}%`,
          animationDelay: `${i * 0.2}s`
        }}
      />
    ))}
  </div>
));

PipBoyLoader.displayName = "PipBoyLoader";