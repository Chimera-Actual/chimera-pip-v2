import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const enhancedCardVariants = cva(
  "rounded-lg border text-card-foreground shadow-sm transition-all",
  {
    variants: {
      variant: {
        default: "bg-card border-border",
        // Enhanced Pip-Boy variants
        pipPrimary: "pip-container bg-pip-bg-secondary border-pip-border",
        pipGlow: "pip-container bg-pip-bg-secondary border-pip-primary/30 shadow-glow",
        pipTransparent: "bg-pip-bg-overlay border-pip-border/50 backdrop-blur-sm",
        pipSolid: "bg-pip-bg-primary border-pip-border-active",
      },
      padding: {
        none: "",
        sm: "p-3",
        default: "p-6", 
        lg: "p-8",
      },
      hover: {
        none: "",
        lift: "hover:translate-y-[-2px] hover:shadow-lg",
        glow: "hover:shadow-glow hover:border-pip-primary/50",
        scale: "hover:scale-[1.02]",
      }
    },
    defaultVariants: {
      variant: "default",
      padding: "default",
      hover: "none",
    },
  }
)

const EnhancedCard = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof enhancedCardVariants>
>(({ className, variant, padding, hover, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(enhancedCardVariants({ variant, padding, hover, className }))}
    {...props}
  />
))
EnhancedCard.displayName = "EnhancedCard"

const EnhancedCardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6", className)}
    {...props}
  />
))
EnhancedCardHeader.displayName = "EnhancedCardHeader"

const EnhancedCardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement> & {
    glow?: boolean;
  }
>(({ className, glow, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "text-2xl font-semibold leading-none tracking-tight",
      glow && "pip-glow text-pip-primary",
      className
    )}
    {...props}
  />
))
EnhancedCardTitle.displayName = "EnhancedCardTitle"

const EnhancedCardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
))
EnhancedCardDescription.displayName = "EnhancedCardDescription"

const EnhancedCardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
))
EnhancedCardContent.displayName = "EnhancedCardContent"

const EnhancedCardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-0", className)}
    {...props}
  />
))
EnhancedCardFooter.displayName = "EnhancedCardFooter"

export { 
  EnhancedCard, 
  EnhancedCardHeader, 
  EnhancedCardFooter, 
  EnhancedCardTitle, 
  EnhancedCardDescription, 
  EnhancedCardContent,
  enhancedCardVariants 
}