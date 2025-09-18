import React, { useMemo } from 'react';
import { BaseSettingsModal } from '@/components/ui/BaseSettingsModal';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import type { UniversalSettingsProps, SettingsSection } from '@/types/settings';

export const UniversalSettingsTemplate: React.FC<UniversalSettingsProps> = ({
  isOpen,
  onClose,
  title,
  description,
  sections,
  onSave,
  onReset,
  isDirty = false,
  isLoading = false,
  size = 'large',
  showSaveButton = true,
  showResetButton = true,
  className,
}) => {
  // Sort sections by order if provided
  const sortedSections = useMemo(() => {
    return [...sections].sort((a, b) => {
      const aOrder = a.order ?? 999;
      const bOrder = b.order ?? 999;
      return aOrder - bOrder;
    });
  }, [sections]);

  return (
    <BaseSettingsModal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      description={description}
      size={size}
      onSave={onSave}
      onReset={onReset}
      isDirty={isDirty}
      isLoading={isLoading}
      showSaveButton={showSaveButton}
      showResetButton={showResetButton}
      className={className}
    >
      <ScrollArea className="flex-1 min-h-0 pr-4">
        <div className="space-y-8 py-6">
          {sortedSections.map((section, index) => (
            <div key={section.id}>
              <SettingsSectionRenderer section={section} />
              
              {/* Add separator between sections (except for last one) */}
              {index < sortedSections.length - 1 && (
                <Separator className="mt-8 border-pip-border/30" />
              )}
            </div>
          ))}
        </div>
      </ScrollArea>
    </BaseSettingsModal>
  );
};

interface SettingsSectionRendererProps {
  section: SettingsSection;
}

const SettingsSectionRenderer: React.FC<SettingsSectionRendererProps> = ({ section }) => {
  const IconComponent = section.icon;

  return (
    <div className="space-y-4">
      {/* Section Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          {IconComponent && (
            <IconComponent className="h-5 w-5 text-pip-text-bright" />
          )}
          <h3 className="text-lg font-pip-display font-semibold text-pip-text-bright pip-text-glow">
            {section.title}
          </h3>
        </div>
        
        {section.description && (
          <p className="text-sm text-pip-text-muted font-pip-mono leading-relaxed">
            {section.description}
          </p>
        )}
      </div>

      {/* Section Content */}
      <div className={cn(
        "space-y-6 pl-0",
        IconComponent && "pl-8" // Indent content if there's an icon
      )}>
        {section.content}
      </div>
    </div>
  );
};