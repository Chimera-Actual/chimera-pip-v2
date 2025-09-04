import React, { memo, forwardRef } from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { cva, type VariantProps } from 'class-variance-authority';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AnimatedTransition } from './animated-transitions';

const modalVariants = cva(
  "fixed left-[50%] top-[50%] z-50 w-full translate-x-[-50%] translate-y-[-50%] border shadow-lg duration-300 data-[state=open]:animate-scale-in data-[state=closed]:animate-scale-out",
  {
    variants: {
      variant: {
        default: "bg-background border-border",
        pipPrimary: "bg-pip-bg-primary border-pip-border pip-glow pip-scanlines",
        pipSecondary: "bg-pip-bg-secondary border-pip-border-bright shadow-glow",
        pipTransparent: "bg-pip-bg-overlay backdrop-blur-md border-pip-border/30",
      },
      size: {
        sm: "max-w-md",
        md: "max-w-lg", 
        lg: "max-w-xl",
        xl: "max-w-3xl",
        full: "max-w-[95vw] max-h-[95vh]",
      },
      padding: {
        none: "",
        sm: "p-4",
        md: "p-6",
        lg: "p-8",
      }
    },
    defaultVariants: {
      variant: "default",
      size: "md",
      padding: "md",
    },
  }
)

const EnhancedModal = DialogPrimitive.Root;

const EnhancedModalTrigger = DialogPrimitive.Trigger;

const EnhancedModalPortal = DialogPrimitive.Portal;

const EnhancedModalClose = DialogPrimitive.Close;

const EnhancedModalOverlay = memo(forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay> & {
    blur?: boolean;
  }
>(({ className, blur = true, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      "fixed inset-0 z-50 bg-pip-bg-overlay/80 data-[state=open]:animate-fade-in data-[state=closed]:animate-fade-out",
      blur && "backdrop-blur-sm",
      className
    )}
    {...props}
  />
)));
EnhancedModalOverlay.displayName = "EnhancedModalOverlay";

const EnhancedModalContent = memo(forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> & 
  VariantProps<typeof modalVariants> & {
    showClose?: boolean;
  }
>(({ className, variant, size, padding, showClose = true, children, ...props }, ref) => (
  <EnhancedModalPortal>
    <EnhancedModalOverlay />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(modalVariants({ variant, size, padding }), className)}
      {...props}
    >
      <AnimatedTransition type="fade" delay="short">
        {children}
        {showClose && (
          <EnhancedModalClose className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </EnhancedModalClose>
        )}
      </AnimatedTransition>
    </DialogPrimitive.Content>
  </EnhancedModalPortal>
)));
EnhancedModalContent.displayName = "EnhancedModalContent";

const EnhancedModalHeader = memo(forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    glow?: boolean;
  }
>(({ className, glow, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex flex-col space-y-1.5 text-center sm:text-left border-b border-pip-border/20 pb-4 mb-4",
      glow && "animate-pip-glow",
      className
    )}
    {...props}
  />
)));
EnhancedModalHeader.displayName = "EnhancedModalHeader";

const EnhancedModalFooter = memo(forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 border-t border-pip-border/20 pt-4 mt-4",
      className
    )}
    {...props}
  />
)));
EnhancedModalFooter.displayName = "EnhancedModalFooter";

const EnhancedModalTitle = memo(forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title> & {
    glow?: boolean;
  }
>(({ className, glow, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn(
      "text-lg font-semibold leading-none tracking-tight text-pip-text-primary font-mono",
      glow && "pip-glow animate-pip-glow",
      className
    )}
    {...props}
  />
)));
EnhancedModalTitle.displayName = "EnhancedModalTitle";

const EnhancedModalDescription = memo(forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn("text-sm text-pip-text-secondary", className)}
    {...props}
  />
)));
EnhancedModalDescription.displayName = "EnhancedModalDescription";

export {
  EnhancedModal,
  EnhancedModalPortal,
  EnhancedModalOverlay,
  EnhancedModalTrigger,
  EnhancedModalClose,
  EnhancedModalContent,
  EnhancedModalHeader,
  EnhancedModalFooter,
  EnhancedModalTitle,
  EnhancedModalDescription,
};