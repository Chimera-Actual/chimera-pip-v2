import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { WidgetContainer } from './WidgetContainer';
import { BaseWidget, SpecialStatsSettings } from '@/types/widgets';
import { useWidgetState } from '@/hooks/useWidgetState';
import { Progress } from '@/components/ui/progress';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface SpecialStatsWidgetProps {
  widget: BaseWidget;
}

const specialStats = [
  {
    name: 'strength',
    label: 'S',
    fullName: 'STRENGTH',
    description: 'Raw physical strength. A high Strength is good for physical characters.'
  },
  {
    name: 'perception',
    label: 'P',
    fullName: 'PERCEPTION',
    description: 'The ability to see, hear, taste and notice unusual things. A high Perception is important for a sharpshooter.'
  },
  {
    name: 'endurance',
    label: 'E',
    fullName: 'ENDURANCE',
    description: 'Stamina and physical toughness. A character with high Endurance will survive where others may not.'
  },
  {
    name: 'charisma',
    label: 'C',
    fullName: 'CHARISMA',
    description: 'A combination of appearance and charm. A high Charisma is important for characters who want to influence people with words.'
  },
  {
    name: 'intelligence',
    label: 'I',
    fullName: 'INTELLIGENCE',
    description: 'Knowledge, wisdom and the ability to think quickly. A high Intelligence is important for any character who wants to have maximum skills.'
  },
  {
    name: 'agility',
    label: 'A',
    fullName: 'AGILITY',
    description: 'Coordination and the ability to move well. A high Agility is important for any active character.'
  },
  {
    name: 'luck',
    label: 'L',
    fullName: 'LUCK',
    description: 'Fate. Karma. An extremely high or low Luck will affect the character - somehow. Events and situations will be changed by how lucky (or unlucky) your character is.'
  }
];

export const SpecialStatsWidget: React.FC<SpecialStatsWidgetProps> = ({ widget }) => {
  const { profile } = useAuth();
  const { settings, setSettings, collapsed, setCollapsed, isLoading, error } = useWidgetState(
    widget.id,
    widget.settings as SpecialStatsSettings
  );

  if (!profile || !profile.special_stats) {
    return (
      <WidgetContainer
        widgetId={widget.id}
        title={widget.title}
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed(!collapsed)}
        isLoading={isLoading}
        error={error}
      >
        <div className="flex items-center justify-center h-32 text-pip-text-muted font-pip-mono">
          No S.P.E.C.I.A.L. data available
        </div>
      </WidgetContainer>
    );
  }

  const userStats = profile.special_stats;

  const renderStatRow = (stat: typeof specialStats[0]) => {
    const value = userStats[stat.name] || 5;
    
    const StatContent = (
      <div className="stat-row flex items-center justify-between p-2 rounded border border-pip-border bg-pip-bg-secondary/50 hover:border-primary/40 transition-colors">
        <div className="flex items-center gap-3">
          <div className="stat-letter w-8 h-8 rounded-full bg-pip-green-primary/20 border border-pip-green-primary/50 flex items-center justify-center">
            <span className="text-sm font-pip-display font-bold text-pip-green-primary">
              {stat.label}
            </span>
          </div>
          
          <div className="stat-info">
            {settings.displayStyle === 'detailed' && (
              <div className="text-xs text-pip-text-muted font-pip-mono">
                {stat.fullName}
              </div>
            )}
            {settings.displayStyle !== 'minimal' && (
              <div className="text-sm font-pip-mono text-pip-text-bright">
                {stat.name.charAt(0).toUpperCase() + stat.name.slice(1)}
              </div>
            )}
          </div>
        </div>
        
        <div className="stat-value-container flex items-center gap-3">
          <span className="text-xl font-pip-display font-bold text-primary pip-text-glow">
            {value}
          </span>
          
          {settings.showProgressBars && (
            <div className="w-16">
              <Progress 
                value={(value / 10) * 100} 
                className="h-2"
              />
            </div>
          )}
        </div>
      </div>
    );

    if (settings.showTooltips) {
      return (
        <TooltipProvider key={stat.name}>
          <Tooltip>
            <TooltipTrigger asChild>
              {StatContent}
            </TooltipTrigger>
            <TooltipContent side="right" className="max-w-xs">
              <p className="font-pip-mono text-xs">{stat.description}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    }

    return <div key={stat.name}>{StatContent}</div>;
  };

  return (
    <WidgetContainer
      widgetId={widget.id}
      title={widget.title}
      collapsed={collapsed}
      onToggleCollapse={() => setCollapsed(!collapsed)}
      onSettingsChange={setSettings}
      isLoading={isLoading}
      error={error}
    >
      <div className="space-y-2">
        {specialStats.map(renderStatRow)}
        
        {settings.displayStyle === 'detailed' && (
          <div className="mt-4 p-3 rounded border border-pip-border/50 bg-pip-bg-tertiary/30">
            <div className="text-xs text-pip-text-muted font-pip-mono mb-1">
              TOTAL POINTS
            </div>
            <div className="text-lg font-pip-display font-bold text-primary">
              {specialStats.reduce((total, stat) => total + (userStats[stat.name] || 5), 0)}
            </div>
          </div>
        )}
      </div>
    </WidgetContainer>
  );
};