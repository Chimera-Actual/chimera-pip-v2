import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FieldErrors, UseFormRegister } from 'react-hook-form';

interface CharacterFormData {
  character_name: string;
}

interface CharacterNameSectionProps {
  register: UseFormRegister<CharacterFormData>;
  errors: FieldErrors<CharacterFormData>;
  vaultNumber?: number;
}

export const CharacterNameSection: React.FC<CharacterNameSectionProps> = ({
  register,
  errors,
  vaultNumber
}) => {
  return (
    <>
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-2xl font-display font-bold text-pip-text-bright pip-text-glow">
          CHARACTER CREATION
        </h1>
        <p className="text-pip-text-secondary mt-2 font-mono text-sm">
          Define your vault identity and optionally customize your S.P.E.C.I.A.L. attributes
        </p>
        {vaultNumber && (
          <p className="text-primary font-mono text-lg mt-2">
            VAULT {vaultNumber.toString().padStart(3, '0')}
          </p>
        )}
      </div>

      {/* Character Name Input */}
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
    </>
  );
};