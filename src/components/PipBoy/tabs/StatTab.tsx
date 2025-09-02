import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { User, Star, Trophy, Activity } from 'lucide-react';

interface SpecialStat {
  name: string;
  fullName: string;
  value: number;
  description: string;
}

const specialStats: SpecialStat[] = [
  { name: 'S', fullName: 'Strength', value: 7, description: 'Physical power and carry capacity' },
  { name: 'P', fullName: 'Perception', value: 6, description: 'Environmental awareness and accuracy' },
  { name: 'E', fullName: 'Endurance', value: 8, description: 'Stamina and physical resilience' },
  { name: 'C', fullName: 'Charisma', value: 5, description: 'Social skills and leadership' },
  { name: 'I', fullName: 'Intelligence', value: 9, description: 'Reasoning ability and technical skill' },
  { name: 'A', fullName: 'Agility', value: 6, description: 'Speed and finesse' },
  { name: 'L', fullName: 'Luck', value: 4, description: 'Fate and random chance' }
];

const achievements = [
  { name: 'Vault Dweller', description: 'Welcome to your new PIP-Boy!', earned: true },
  { name: 'Data Analyst', description: 'View 10 different data widgets', earned: false },
  { name: 'Explorer', description: 'Use the map feature 5 times', earned: false },
  { name: 'Communications Expert', description: 'Send 50 messages', earned: false },
];

export const StatTab: React.FC = () => {
  const level = 12;
  const experience = 2847;
  const nextLevelXP = 3200;
  const xpProgress = (experience / nextLevelXP) * 100;

  return (
    <div className="space-y-6">
      {/* Character Profile */}
      <Card className="pip-widget">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-pip-text-bright font-pip-display">
            <User className="h-5 w-5" />
            <span>Character Profile</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-xs text-pip-text-muted font-pip-mono">VAULT</div>
              <div className="text-2xl font-pip-display font-bold text-primary pip-text-glow">111</div>
            </div>
            <div>
              <div className="text-xs text-pip-text-muted font-pip-mono">LEVEL</div>
              <div className="text-2xl font-pip-display font-bold text-primary pip-text-glow">{level}</div>
            </div>
            <div>
              <div className="text-xs text-pip-text-muted font-pip-mono">XP</div>
              <div className="text-2xl font-pip-display font-bold text-primary pip-text-glow">{experience.toLocaleString()}</div>
            </div>
            <div>
              <div className="text-xs text-pip-text-muted font-pip-mono">KARMA</div>
              <div className="text-2xl font-pip-display font-bold text-pip-green-secondary">GOOD</div>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm font-pip-mono text-pip-text-secondary">
              <span>Experience Progress</span>
              <span>{experience}/{nextLevelXP}</span>
            </div>
            <Progress value={xpProgress} className="h-2 bg-pip-bg-secondary" />
          </div>
        </CardContent>
      </Card>

      {/* S.P.E.C.I.A.L. Stats */}
      <Card className="pip-widget">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-pip-text-bright font-pip-display">
            <Star className="h-5 w-5" />
            <span>S.P.E.C.I.A.L. Attributes</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {specialStats.map((stat) => (
              <div key={stat.name} className="pip-special-stat p-3 rounded">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center border border-primary/40">
                      <span className="font-pip-display font-bold text-primary">{stat.name}</span>
                    </div>
                    <div>
                      <div className="font-pip-display font-semibold text-pip-text-bright">{stat.fullName}</div>
                      <div className="text-xs text-pip-text-muted font-pip-mono">{stat.description}</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="text-2xl font-pip-display font-bold text-primary pip-text-glow">
                      {stat.value}
                    </div>
                    <Progress value={stat.value * 10} className="w-20 h-2" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Achievements */}
      <Card className="pip-widget">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-pip-text-bright font-pip-display">
            <Trophy className="h-5 w-5" />
            <span>Achievements</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3">
            {achievements.map((achievement, index) => (
              <div key={index} className={`flex items-center justify-between p-3 rounded border ${
                achievement.earned 
                  ? 'border-primary/40 bg-primary/10' 
                  : 'border-pip-border bg-pip-bg-secondary/50'
              }`}>
                <div>
                  <div className={`font-pip-display font-semibold ${
                    achievement.earned ? 'text-primary' : 'text-pip-text-secondary'
                  }`}>
                    {achievement.name}
                  </div>
                  <div className="text-xs text-pip-text-muted font-pip-mono">
                    {achievement.description}
                  </div>
                </div>
                <Badge variant={achievement.earned ? "default" : "secondary"}>
                  {achievement.earned ? 'EARNED' : 'LOCKED'}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* System Stats */}
      <Card className="pip-widget">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2 text-pip-text-bright font-pip-display">
            <Activity className="h-5 w-5" />
            <span>System Monitor</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm font-pip-mono">
                <span className="text-pip-text-muted">CPU Usage</span>
                <span className="text-primary">34%</span>
              </div>
              <Progress value={34} className="h-2" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm font-pip-mono">
                <span className="text-pip-text-muted">Memory</span>
                <span className="text-primary">67%</span>
              </div>
              <Progress value={67} className="h-2" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm font-pip-mono">
                <span className="text-pip-text-muted">Network</span>
                <span className="text-pip-green-secondary">CONNECTED</span>
              </div>
              <Progress value={100} className="h-2" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm font-pip-mono">
                <span className="text-pip-text-muted">Power Level</span>
                <span className="text-primary">89%</span>
              </div>
              <Progress value={89} className="h-2" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};