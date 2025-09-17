import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { TabEditor } from '@/components/tabManagement/TabEditor';
import { TabConfiguration } from '@/types/tabManagement';

interface DashboardModalsProps {
  showTabEditor: boolean;
  onCloseTabEditor: () => void;
  onSaveTab: (tabData: Partial<TabConfiguration>) => Promise<void>;
  currentTab?: TabConfiguration;
  
  showDeleteConfirm: boolean;
  onCloseDeleteConfirm: () => void;
  onDeleteTab: () => void;
}

export const DashboardModals = ({
  showTabEditor,
  onCloseTabEditor,
  onSaveTab,
  currentTab,
  showDeleteConfirm,
  onCloseDeleteConfirm,
  onDeleteTab
}) => {
  return (
    <>
      {/* Tab Editor Modal */}
      {showTabEditor && currentTab && (
        <TabEditor
          tab={currentTab}
          isOpen={showTabEditor}
          onClose={onCloseTabEditor}
          onSave={onSaveTab}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteConfirm} onOpenChange={onCloseDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Tab</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{currentTab?.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={onDeleteTab}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete Tab
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};