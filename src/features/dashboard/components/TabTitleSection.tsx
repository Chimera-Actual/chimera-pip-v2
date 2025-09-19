interface TabTitleSectionProps {
  activeTab: string;
  description?: string;
}

export const TabTitleSection = ({ activeTab, description }: TabTitleSectionProps) => {
  const getTabDescription = (tab: string) => {
    if (description && description.trim().length > 0) return description;
    const descriptions: Record<string, string> = {
      'STAT': 'Character Statistics & System Status',
      'INV': 'Digital Inventory & File Management', 
      'DATA': 'Information & Communication Hub',
      'MAP': 'Location Services & Navigation',
      'RADIO': 'Media & Entertainment Center',
      'MAIN': 'Main user interface'
    };
    return descriptions[tab] || 'Custom dashboard tab';
  };

  return (
    <div className="flex items-baseline gap-4">
      <h2 className="text-2xl font-pip-display font-bold text-pip-text-bright pip-text-glow">
        {activeTab}
      </h2>
      <span className="text-sm text-pip-text-secondary font-pip-mono opacity-70">
        {getTabDescription(activeTab)}
      </span>
    </div>
  );
};