import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, User } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { CharacterNameSection, SpecialStatsSection } from '@/features/auth';

interface CharacterFormData {
  character_name: string;
}

interface SpecialStats {
  strength: number;
  perception: number;
  endurance: number;
  charisma: number;
  intelligence: number;
  agility: number;
  luck: number;
}

export const CharacterCreation: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { updateProfile, profile } = useAuth();
  const navigate = useNavigate();
  
  const [specialStats, setSpecialStats] = useState<SpecialStats>({
    strength: 5,
    perception: 5,
    endurance: 5,
    charisma: 5,
    intelligence: 5,
    agility: 5,
    luck: 5,
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CharacterFormData>();

  const totalPoints = Object.values(specialStats).reduce((sum, stat) => sum + stat, 0);
  // Allow meaningful allocation starting from base 1 for each stat with a 35-point pool
  const BASE_POOL = 35; // total allocatable points above the base minimum of 1 per stat
  const MIN_SUM = 7; // 7 stats * min value 1
  const pointsSpent = totalPoints - MIN_SUM;
  const availablePoints = BASE_POOL - pointsSpent;

  const adjustStat = (stat: keyof SpecialStats, delta: number) => {
    console.log('Adjusting stat:', stat, 'delta:', delta, 'current:', specialStats[stat], 'available points:', availablePoints);
    const newValue = specialStats[stat] + delta;
    
    if (newValue >= 1 && newValue <= 10) {
      if (delta > 0 && availablePoints > 0) {
        console.log('Increasing stat to:', newValue);
        setSpecialStats(prev => ({ ...prev, [stat]: newValue }));
      } else if (delta < 0) {
        console.log('Decreasing stat to:', newValue);
        setSpecialStats(prev => ({ ...prev, [stat]: newValue }));
      } else {
        console.log('Cannot adjust stat - no points available or at limit');
      }
    } else {
      console.log('Cannot adjust stat - out of bounds (1-10)');
    }
  };

  const onSubmit = async (data: CharacterFormData) => {
    setIsLoading(true);
    
    const { error } = await updateProfile({
      character_name: data.character_name,
      special_stats: specialStats,
    });
    
    if (!error) {
      navigate('/');
    }
    
    setIsLoading(false);
  };

  const handleSkipAllocation = async (data: CharacterFormData) => {
    setIsLoading(true);

    // Use default S.P.E.C.I.A.L. stats (all 5s) when skipping
    const defaultStats = {
      strength: 5,
      perception: 5,
      endurance: 5,
      charisma: 5,
      intelligence: 5,
      agility: 5,
      luck: 5,
    };

    const { error } = await updateProfile({
      character_name: data.character_name,
      special_stats: defaultStats,
    });

    if (!error) {
      navigate('/');
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen pip-scanlines bg-pip-bg-primary flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <Card variant="pip-terminal" className="p-pip-lg">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            <CharacterNameSection 
              register={register}
              errors={errors}
              vaultNumber={profile?.vault_number}
            />

            <SpecialStatsSection
              specialStats={specialStats}
              onAdjustStat={adjustStat}
              availablePoints={availablePoints}
            />

            {/* Action Buttons */}
            <div className="flex flex-col gap-3">
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full pip-button-glow font-mono font-bold text-base py-3"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    INITIALIZING VAULT...
                  </>
                ) : availablePoints === 0 ? (
                  'COMPLETE REGISTRATION'
                ) : (
                  'REGISTER WITH CUSTOM STATS'
                )}
              </Button>
              
              {availablePoints > 0 && (
                <Button
                  type="button"
                  variant="outline"
                  disabled={isLoading}
                  onClick={handleSubmit(handleSkipAllocation)}
                  className="w-full pip-terminal border-pip-border hover:border-primary font-mono font-bold text-base py-3"
                >
                  SKIP ALLOCATION & USE DEFAULTS
                </Button>
              )}
              
              {availablePoints > 0 && (
                <p className="text-center text-pip-text-muted font-mono text-xs">
                  You can customize your S.P.E.C.I.A.L. stats later from your profile
                </p>
              )}
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
};