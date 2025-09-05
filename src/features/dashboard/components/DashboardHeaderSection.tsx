import { TabActionsMenu } from './TabActionsMenu';

interface DashboardHeaderSectionProps {
  activeTab: string;
  onShowCatalog: () => void;
  onShowTabEditor: () => void;
  onArchiveTab: () => void;
  onShowDeleteConfirm: () => void;
  isDefaultTab: boolean;
}

export const DashboardHeaderSection = ({
  activeTab,
  onShowCatalog,
  onShowTabEditor,
  onArchiveTab,
  onShowDeleteConfirm,
  isDefaultTab
}) => {
  const getTabDescription = (tab: string) => {
    const descriptions: Record<string, string> = {
      'STAT': 'Character Statistics & System Status',
      'INV': 'Digital Inventory & File Management', 
      'DATA': 'Information & Communication Hub',
      'MAP': 'Location Services & Navigation',
      'RADIO': 'Media & Entertainment Center'
    };
    return descriptions[tab] || 'Custom dashboard tab';
  };

  return (
    <div className="flex justify-between items-center pb-3 mb-4 border-b border-pip-border">
      <div className="flex items-baseline gap-4">
        <h2 className="text-3xl font-pip-display font-bold text-pip-text-bright pip-text-glow">
          {activeTab}
        </h2>
        <span className="text-sm text-pip-text-secondary font-pip-mono opacity-70">
          {getTabDescription(activeTab)}
        </span>
      </div>
      
      <TabActionsMenu
        onShowCatalog={onShowCatalog}
        onShowTabEditor={onShowTabEditor}
        onArchiveTab={onArchiveTab}
        onShowDeleteConfirm={onShowDeleteConfirm}
        isDefaultTab={isDefaultTab}
      />
    </div>
  );
};