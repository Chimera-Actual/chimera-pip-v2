import type { ReactNode } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter, SheetClose } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

interface SettingsSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children: ReactNode;
  onSave?: () => Promise<void> | void;
  onCancel?: () => void;
  onReset?: () => Promise<void> | void;
  isSaving?: boolean;
  isDirty?: boolean;
  showSaveButton?: boolean;
  showResetButton?: boolean;
  saveLabel?: string;
  cancelLabel?: string;
  className?: string;
  footer?: ReactNode;
}

export function SettingsSheet({
  open,
  onOpenChange,
  title,
  description,
  children,
  onSave,
  onCancel,
  onReset,
  isSaving = false,
  isDirty,
  showSaveButton = true,
  showResetButton,
  saveLabel = "Save Changes",
  cancelLabel = "Cancel",
  className,
  footer,
}: SettingsSheetProps) {
  const handleCancel = () => {
    onCancel?.();
  };

  const handleSave = () => {
    if (onSave) {
      onSave();
    }
  };

  const handleReset = () => {
    onReset?.();
  };

  const isSaveDisabled = Boolean(isSaving) || (typeof isDirty === "boolean" && !isDirty);
  const shouldShowReset = showResetButton ?? Boolean(onReset);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className={`w-[420px] sm:w-[540px] flex flex-col ${className ?? ""}`}>
        <SheetHeader className="flex-shrink-0">
          <SheetTitle className="text-primary">{title}</SheetTitle>
          {description ? <SheetDescription>{description}</SheetDescription> : null}
        </SheetHeader>
        <ScrollArea className="flex-1 mt-4">
          <div className="pr-4">{children}</div>
        </ScrollArea>
        <SheetFooter className="mt-6 flex-shrink-0">
          <div className="flex w-full flex-col-reverse gap-2 sm:flex-row sm:items-center">
            {shouldShowReset && onReset ? (
              <Button
                variant="outline"
                onClick={handleReset}
                disabled={Boolean(isSaving)}
                className="sm:mr-auto text-muted-foreground"
              >
                Reset
              </Button>
            ) : (
              <div className="sm:mr-auto" />
            )}
            <div className="flex items-center justify-end gap-2">
              <SheetClose asChild>
                <Button variant="outline" onClick={handleCancel} disabled={Boolean(isSaving)}>
                  {cancelLabel}
                </Button>
              </SheetClose>
              {showSaveButton && onSave ? (
                <Button onClick={handleSave} disabled={isSaveDisabled}>
                  {isSaving ? "Saving..." : saveLabel}
                </Button>
              ) : null}
            </div>
          </div>
        </SheetFooter>
        {footer ? <div className="mt-2">{footer}</div> : null}
      </SheetContent>
    </Sheet>
  );
}
