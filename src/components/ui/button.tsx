import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90 pip-button-glow",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline:
          "border border-pip-border bg-transparent text-pip-text-secondary hover:bg-pip-bg-secondary/50 hover:text-primary hover:border-primary/60",
        secondary:
          "bg-pip-bg-secondary text-pip-text-secondary hover:bg-pip-bg-tertiary hover:text-pip-text-bright border border-pip-border",
        ghost: "text-pip-text-secondary hover:bg-pip-bg-secondary/50 hover:text-primary",
        link: "text-primary underline-offset-4 hover:underline pip-text-glow",
        "pip-terminal": "bg-pip-bg-tertiary text-pip-text-bright border-2 border-pip-border hover:border-pip-border-bright pip-glow font-pip-display",
        "pip-danger": "bg-destructive/20 text-destructive border border-destructive/40 hover:bg-destructive/30 hover:border-destructive pip-button-glow",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
        "touch": "h-11 px-6 py-3 touch-target", // iOS 44px minimum
        "touch-large": "h-12 px-6 py-3 touch-target-large", // Android 48px minimum
        "touch-xl": "h-14 px-8 py-4 touch-target-xl", // High-frequency actions
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
