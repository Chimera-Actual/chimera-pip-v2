import React, { useState, useEffect, memo } from 'react';
import { BaseWidget } from '@/types/widgets';
import { useWidgetState } from '@/hooks/useWidgetState';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy, Star, Target, Users, Zap, Award } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface AchievementGalleryWidgetProps {
  widget: BaseWidget;
}

interface Achievement {
  id: string;
  achievement_type: string;
  achievement_data: {
    title: string;
    description: string;
    category: string;
    points: number;
    icon: string;
    rarity: 'common' | 'uncommon' | 'rare' | 'legendary';
    progress?: number;
    maxProgress?: number;
  };
  unlocked_at: string | null;
}

const categoryIcons = {
  combat: Target,
  exploration: Star,
  social: Users,
  technical: Zap,
  milestone: Trophy,
  special: Award,
};

const rarityColors = {
  common: 'text-pip-text-muted',
  uncommon: 'text-pip-accent-green',
  rare: 'text-pip-accent-blue',
  legendary: 'text-pip-accent-amber',
};

export const AchievementGalleryWidget: React.FC<AchievementGalleryWidgetProps> = memo(({ widget }) => {
  const { settings, collapsed, setCollapsed, isLoading } = useWidgetState(widget.id, widget.settings);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  const loadAchievements = async () => {
    try {
      const { data, error } = await supabase
        .from('user_achievements')
        .select('*')
        .order('unlocked_at', { ascending: false });

      if (error) throw error;

      // Add some mock achievements for demo
      const mockAchievements: Achievement[] = [
        {
          id: '1',
          achievement_type: 'first_login',
          achievement_data: {
            title: 'Vault Dweller',
            description: 'Successfully logged into your Pip-Boy for the first time',
            category: 'milestone',
            points: 50,
            icon: 'trophy',
            rarity: 'common',
          },
          unlocked_at: new Date().toISOString(),
        },
        {
          id: '2',
          achievement_type: 'widget_master',
          achievement_data: {
            title: 'Widget Master',
            description: 'Add 5 widgets to your dashboard',
            category: 'technical',
            points: 100,
            icon: 'star',
            rarity: 'uncommon',
            progress: 3,
            maxProgress: 5,
          },
          unlocked_at: null,
        },
        {
          id: '3',
          achievement_type: 'explorer',
          achievement_data: {
            title: 'Wasteland Explorer',
            description: 'Visit all tabs in your Pip-Boy',
            category: 'exploration',
            points: 75,
            icon: 'target',
            rarity: 'rare',
          },
          unlocked_at: new Date(Date.now() - 86400000).toISOString(),
        },
      ];

      // Transform database data to match our interface
      const dbAchievements: Achievement[] = data.map(item => ({
        id: item.id,
        achievement_type: item.achievement_type,
        achievement_data: item.achievement_data as Achievement['achievement_data'],
        unlocked_at: item.unlocked_at,
      }));
      
      setAchievements([...dbAchievements, ...mockAchievements]);
    } catch (error) {
      console.error('Error loading achievements:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAchievements();
  }, []);

  const filteredAchievements = achievements.filter(achievement => 
    selectedCategory === 'all' || achievement.achievement_data.category === selectedCategory
  );

  const categories = ['all', ...new Set(achievements.map(a => a.achievement_data.category))];
  const unlockedCount = achievements.filter(a => a.unlocked_at).length;
  const totalPoints = achievements
    .filter(a => a.unlocked_at)
    .reduce((sum, a) => sum + a.achievement_data.points, 0);

  if (loading) {
    return (
      <div className="text-center text-pip-text-muted font-pip-mono py-4">
        Loading achievements...
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Stats Header */}
      <div className="grid grid-cols-3 gap-4 text-center">
        <div className="pip-special-stat p-3">
          <div className="text-2xl font-bold text-pip-accent-green">{unlockedCount}</div>
          <div className="text-sm text-pip-text-muted font-pip-mono">Unlocked</div>
        </div>
        <div className="pip-special-stat p-3">
          <div className="text-2xl font-bold text-pip-accent-amber">{totalPoints}</div>
          <div className="text-sm text-pip-text-muted font-pip-mono">Points</div>
        </div>
        <div className="pip-special-stat p-3">
          <div className="text-2xl font-bold text-pip-accent-blue">
            {Math.round((unlockedCount / achievements.length) * 100) || 0}%
          </div>
          <div className="text-sm text-pip-text-muted font-pip-mono">Complete</div>
        </div>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2">
        {categories.map(category => (
          <Badge
            key={category}
            variant={selectedCategory === category ? "default" : "outline"}
            className="cursor-pointer capitalize font-pip-mono"
            onClick={() => setSelectedCategory(category)}
          >
            {category}
          </Badge>
        ))}
      </div>

      {/* Achievements List */}
      <div className="space-y-3 max-h-64 overflow-y-auto">
        {loading ? (
          <div className="text-center text-pip-text-muted font-pip-mono py-4">
            Loading achievements...
          </div>
        ) : filteredAchievements.length === 0 ? (
          <div className="text-center text-pip-text-muted font-pip-mono py-4">
            No achievements found
          </div>
        ) : (
          filteredAchievements.map(achievement => {
            const IconComponent = categoryIcons[achievement.achievement_data.category as keyof typeof categoryIcons] || Trophy;
            const isUnlocked = !!achievement.unlocked_at;
            const hasProgress = achievement.achievement_data.progress !== undefined;
            
            return (
              <Card key={achievement.id} className={`pip-special-stat ${isUnlocked ? '' : 'opacity-60'}`}>
                <CardContent className="p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <IconComponent 
                        className={`h-5 w-5 ${isUnlocked ? rarityColors[achievement.achievement_data.rarity] : 'text-pip-text-muted'}`}
                      />
                      <h4 className="text-sm font-pip-mono font-semibold">
                        {achievement.achievement_data.title}
                      </h4>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs font-pip-mono">
                        {achievement.achievement_data.points} pts
                      </Badge>
                      {isUnlocked && <Trophy className="h-4 w-4 text-pip-accent-amber" />}
                    </div>
                  </div>
                  <p className="text-xs text-pip-text-muted font-pip-mono mb-2">
                    {achievement.achievement_data.description}
                  </p>
                  
                  {hasProgress && !isUnlocked && (
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs font-pip-mono">
                        <span>Progress</span>
                        <span>{achievement.achievement_data.progress}/{achievement.achievement_data.maxProgress}</span>
                      </div>
                      <Progress 
                        value={(achievement.achievement_data.progress! / achievement.achievement_data.maxProgress!) * 100}
                        className="h-2"
                      />
                    </div>
                  )}
                  
                  {isUnlocked && (
                    <div className="text-xs text-pip-accent-green font-pip-mono">
                      Unlocked: {new Date(achievement.unlocked_at!).toLocaleDateString()}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
});

AchievementGalleryWidget.displayName = 'AchievementGalleryWidget';