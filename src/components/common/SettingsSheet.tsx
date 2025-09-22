import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter, SheetClose } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

type SettingsSheetProps = {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  title: string;
  description?: string;
  onSave?: () => Promise<void> | void;
  isSaving?: boolean;
  children: React.ReactNode;
};

export function SettingsSheet({ open, onOpenChange, title, description, onSave, isSaving, children }: SettingsSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-[420px] sm:w-[540px] flex flex-col">
        <SheetHeader className="flex-shrink-0">
          <SheetTitle className="text-primary">{title}</SheetTitle>
          {description ? <SheetDescription>{description}</SheetDescription> : null}
        </SheetHeader>
        <ScrollArea className="flex-1 mt-4">
          <div className="pr-4">{children}</div>
        </ScrollArea>
        <SheetFooter className="mt-6 flex-shrink-0">
          <SheetClose asChild>
            <Button variant="outline">Cancel</Button>
          </SheetClose>
          <Button onClick={() => onSave?.()} disabled={!!isSaving}>
            {isSaving ? "Saving…" : "Save Changes"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}