import { TabActionsMenu } from './TabActionsMenu';
import { TabTitleSection } from './TabTitleSection';

interface DashboardHeaderSectionProps {
  activeTab: string;
  description?: string;
  onShowTabEditor: () => void;
  onArchiveTab: () => void;
  onShowDeleteConfirm: () => void;
  onShowWidgetSelector: () => void;
  isDefaultTab: boolean;
}

export const DashboardHeaderSection = ({
  activeTab,
  description,
  onShowTabEditor,
  onArchiveTab,
  onShowDeleteConfirm,
  onShowWidgetSelector,
  isDefaultTab
}: DashboardHeaderSectionProps) => {
  return (
    <div className="flex justify-between items-center pb-3 mb-4 border-b border-pip-border">
      <TabTitleSection activeTab={activeTab} description={description} />
      
      <TabActionsMenu
        onShowTabEditor={onShowTabEditor}
        onArchiveTab={onArchiveTab}
        onShowDeleteConfirm={onShowDeleteConfirm}
        onShowWidgetSelector={onShowWidgetSelector}
        isDefaultTab={isDefaultTab}
      />
    </div>
  );
};