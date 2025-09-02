import React from 'react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Settings, LogOut, UserCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';

interface UserAvatarProps {
  className?: string;
}

export const UserAvatar: React.FC<UserAvatarProps> = ({ className }) => {
  const { profile, signOut } = useAuth();

  const getInitials = () => {
    if (profile?.character_name) {
      return profile.character_name
        .split(' ')
        .map(name => name[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }
    return 'V';
  };

  const formatVaultNumber = () => {
    return profile?.vault_number?.toString().padStart(3, '0') || '000';
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "relative h-10 w-10 rounded-full border border-pip-border hover:border-primary transition-all duration-300 pip-glow",
            className
          )}
        >
          <Avatar className="h-9 w-9">
            <AvatarFallback className="bg-pip-bg-secondary border border-pip-border text-primary font-pip-mono text-xs pip-text-glow">
              {getInitials()}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent 
        align="end" 
        className="w-64 bg-pip-bg-primary/95 backdrop-blur-sm border border-pip-border-bright pip-glow pip-terminal"
        sideOffset={5}
      >
        <DropdownMenuLabel className="font-pip-display text-pip-text-bright pip-text-glow border-b border-pip-border/30 pb-2">
          <div className="flex items-center space-x-3">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-pip-bg-secondary text-primary font-pip-mono text-xs">
                {getInitials()}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="text-sm font-semibold">
                {profile?.character_name || 'UNNAMED DWELLER'}
              </span>
              <span className="text-xs text-pip-text-muted font-pip-mono">
                VAULT {formatVaultNumber()}
              </span>
            </div>
          </div>
        </DropdownMenuLabel>

        <div className="py-1">
          <DropdownMenuItem className="font-pip-mono text-pip-text-primary hover:bg-pip-bg-secondary/50 hover:text-primary cursor-pointer">
            <UserCircle className="w-4 h-4 mr-2" />
            <span className="text-xs">VIEW PROFILE</span>
          </DropdownMenuItem>

          <DropdownMenuItem className="font-pip-mono text-pip-text-primary hover:bg-pip-bg-secondary/50 hover:text-primary cursor-pointer">
            <Settings className="w-4 h-4 mr-2" />
            <span className="text-xs">PREFERENCES</span>
          </DropdownMenuItem>

          <DropdownMenuSeparator className="bg-pip-border/30" />

          <DropdownMenuItem 
            onClick={signOut}
            className="font-pip-mono text-pip-text-primary hover:bg-destructive/20 hover:text-destructive cursor-pointer"
          >
            <LogOut className="w-4 h-4 mr-2" />
            <span className="text-xs">EXIT VAULT</span>
          </DropdownMenuItem>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};