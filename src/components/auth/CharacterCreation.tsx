import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Loader2, User } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

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

const SPECIAL_DESCRIPTIONS = {
  strength: 'Raw physical power and melee damage',
  perception: 'Awareness and accuracy in combat',
  endurance: 'Health points and resistance to damage',
  charisma: 'Speech success and companion affinity',
  intelligence: 'Experience points gained and hacking ability',
  agility: 'Action points and movement speed',
  luck: 'Critical hit chance and random encounters',
};

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
  const availablePoints = 28 - totalPoints;

  const adjustStat = (stat: keyof SpecialStats, delta: number) => {
    const newValue = specialStats[stat] + delta;
    
    if (newValue >= 1 && newValue <= 10) {
      if (delta > 0 && availablePoints > 0) {
        setSpecialStats(prev => ({ ...prev, [stat]: newValue }));
      } else if (delta < 0) {
        setSpecialStats(prev => ({ ...prev, [stat]: newValue }));
      }
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
        <Card className="pip-terminal pip-glow border-2 border-pip-border-bright/30 p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <User className="h-12 w-12 text-primary pip-text-glow" />
            </div>
            <h1 className="text-2xl font-display font-bold text-pip-text-bright pip-text-glow">
              CHARACTER CREATION
            </h1>
            <p className="text-pip-text-secondary mt-2 font-mono text-sm">
              Define your vault identity and optionally customize your S.P.E.C.I.A.L. attributes
            </p>
            {profile && (
              <p className="text-primary font-mono text-lg mt-2">
                VAULT {profile.vault_number.toString().padStart(3, '0')}
              </p>
            )}
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            {/* Character Name */}
            <div className="space-y-2">
              <Label htmlFor="character_name" className="text-pip-text-primary font-mono">
                VAULT DWELLER NAME
              </Label>
              <Input
                id="character_name"
                type="text"
                placeholder="Enter your character name"
                className="pip-terminal border-pip-border focus:border-primary focus:ring-primary font-mono"
                {...register('character_name', {
                  required: 'Character name is required',
                  minLength: {
                    value: 2,
                    message: 'Name must be at least 2 characters',
                  },
                  maxLength: {
                    value: 50,
                    message: 'Name must be less than 50 characters',
                  },
                })}
              />
              {errors.character_name && (
                <p className="text-destructive text-sm font-mono">
                  {errors.character_name.message}
                </p>
              )}
            </div>

            {/* S.P.E.C.I.A.L. Stats */}
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
                          onClick={() => adjustStat(stat as keyof SpecialStats, -1)}
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
                          onClick={() => adjustStat(stat as keyof SpecialStats, 1)}
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