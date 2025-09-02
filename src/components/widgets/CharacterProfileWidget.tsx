import React, { memo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { BaseWidget, CharacterProfileSettings } from '@/types/widgets';
import { useWidgetState } from '@/hooks/useWidgetState';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';

interface CharacterProfileWidgetProps {
  widget: BaseWidget;
}

const getKarmaLabel = (karma: number): string => {
  if (karma >= 1000) return 'Messiah';
  if (karma >= 750) return 'Saint';
  if (karma >= 500) return 'Good Natured';
  if (karma >= 250) return 'Do-Gooder';
  if (karma > 0) return 'Good Karma';
  if (karma === 0) return 'Neutral';
  if (karma >= -250) return 'Bad Karma';
  if (karma >= -500) return 'Vindictive';
  if (karma >= -750) return 'Evil';
  return 'Devil';
};

const getKarmaColor = (karma: number): string => {
  if (karma > 0) return 'text-pip-green-primary';
  if (karma === 0) return 'text-pip-text-muted';
  return 'text-destructive';
};

export const CharacterProfileWidget: React.FC<CharacterProfileWidgetProps> = memo(({ widget }) => {
  const { profile } = useAuth();
  const { settings, setSettings, collapsed, setCollapsed, isLoading, error } = useWidgetState(
    widget.id, 
    widget.settings as CharacterProfileSettings
  );

  if (!profile) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-pip-text-muted font-pip-mono text-sm">
          No character data available
        </div>
      </div>
    );
  }

  const experienceProgress = profile.level > 1 ? 
    ((profile.experience_points || 0) % 1000) / 10 : 
    (profile.experience_points || 0) / 10;

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 p-4 space-y-4">
        {/* Character Identity */}
        <div className="grid grid-cols-2 gap-4">
          {settings.showVaultNumber && (
            <div className="pip-special-stat p-3 text-center">
              <div className="text-xs text-pip-text-muted font-pip-mono mb-1">VAULT</div>
              <div className="text-2xl font-pip-display font-bold text-primary pip-text-glow">
                {profile.vault_number?.toString().padStart(3, '0')}
              </div>
            </div>
          )}
          
          <div className="pip-special-stat p-3 text-center">
            <div className="text-xs text-pip-text-muted font-pip-mono mb-1">NAME</div>
            <div className="text-lg font-pip-display font-bold text-pip-text-bright">
              {profile.character_name || 'Vault Dweller'}
            </div>
          </div>
        </div>

        {/* Level and Experience */}
        {settings.showLevel && (
          <div className="pip-special-stat p-3">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs text-pip-text-muted font-pip-mono">LEVEL</span>
              <span className="text-xl font-pip-display font-bold text-primary">{profile.level}</span>
            </div>
            
            {settings.showExperience && (
              <>
                <Progress 
                  value={experienceProgress} 
                  className="h-2 mb-1" 
                />
                <div className="flex justify-between text-xs text-pip-text-secondary font-pip-mono">
                  <span>XP: {profile.experience_points || 0}</span>
                  <span>Next: {1000 - ((profile.experience_points || 0) % 1000)}</span>
                </div>
              </>
            )}
          </div>
        )}

        {/* Karma */}
        {settings.showKarma && (
          <div className="pip-special-stat p-3">
            <div className="flex justify-between items-center">
              <span className="text-xs text-pip-text-muted font-pip-mono">KARMA</span>
              <div className="text-right">
                <div className={`text-lg font-pip-display font-bold ${getKarmaColor(profile.karma || 0)}`}>
                  {profile.karma || 0}
                </div>
                <Badge variant="outline" className="text-xs border-pip-border">
                  {getKarmaLabel(profile.karma || 0)}
                </Badge>
              </div>
            </div>
          </div>
        )}

        {/* Last Login */}
        {settings.showLastLogin && (
          <div className="pip-special-stat p-3">
            <div className="flex justify-between items-center">
              <span className="text-xs text-pip-text-muted font-pip-mono">LAST LOGIN</span>
              <span className="text-sm font-pip-mono text-pip-text-secondary">
                {new Date().toLocaleDateString()}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
});