import React from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

interface SpecialStats {
  strength: number;
  perception: number;
  endurance: number;
  charisma: number;
  intelligence: number;
  agility: number;
  luck: number;
}

interface SpecialStatsSectionProps {
  specialStats: SpecialStats;
  onAdjustStat: (stat: keyof SpecialStats, delta: number) => void;
  availablePoints: number;
}

const SPECIAL_DESCRIPTIONS = {
  strength: 'Raw physical power and melee damage',
  perception: 'Awareness and accuracy in combat',
  endurance: 'Health points and resistance to damage',
  charisma: 'Speech success and companion affinity',
  intelligence: 'Experience points gained and hacking ability',
  agility: 'Action points and movement speed',
  luck: 'Critical hit chance and random encounters',
};

export const SpecialStatsSection: React.FC<SpecialStatsSectionProps> = ({
  specialStats,
  onAdjustStat,
  availablePoints
}) => {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-display font-bold text-pip-text-bright">
          S.P.E.C.I.A.L. ATTRIBUTES
        </h2>
        <span className="font-mono text-pip-text-secondary">
          Points Remaining: <span className="text-primary font-bold">{availablePoints}</span>
        </span>
      </div>
      
      <div className="grid grid-cols-1 gap-4">
        {Object.entries(specialStats).map(([stat, value]) => (
          <div key={stat} className="pip-special-stat p-4 rounded">
            <div className="flex justify-between items-center mb-2">
              <div>
                <h3 className="font-display font-bold text-pip-text-bright uppercase">
                  {stat}
                </h3>
                <p className="text-xs text-pip-text-secondary font-mono">
                  {SPECIAL_DESCRIPTIONS[stat as keyof typeof SPECIAL_DESCRIPTIONS]}
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => onAdjustStat(stat as keyof SpecialStats, -1)}
                  disabled={value <= 1}
                  className="pip-terminal border-pip-border hover:border-primary font-mono"
                >
                  -
                </Button>
                <span className="font-mono font-bold text-primary text-xl min-w-[2ch] text-center">
                  {value}
                </span>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => onAdjustStat(stat as keyof SpecialStats, 1)}
                  disabled={value >= 10 || availablePoints <= 0}
                  className="pip-terminal border-pip-border hover:border-primary font-mono"
                >
                  +
                </Button>
              </div>
            </div>
            <Progress value={(value / 10) * 100} className="h-2" />
          </div>
        ))}
      </div>
    </div>
  );
};