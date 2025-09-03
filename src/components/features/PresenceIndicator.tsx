import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { usePresence } from '@/hooks/usePresence';
import { Users, Circle } from 'lucide-react';

export const PresenceIndicator: React.FC = () => {
  const { presenceList, onlineCount, isLoading } = usePresence();

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-primary/70">
        <Circle className="w-3 h-3 animate-pulse" />
        <span className="text-sm">Loading...</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-1">
        <Circle className="w-3 h-3 fill-primary text-primary animate-pulse" />
        <span className="text-sm text-primary font-medium">
          {onlineCount} online
        </span>
      </div>
      
      {presenceList.length > 0 && (
        <div className="flex -space-x-2">
          {presenceList.slice(0, 5).map((presence) => (
            <Avatar key={presence.userId} className="w-6 h-6 border-2 border-background">
              <AvatarFallback className="text-xs bg-primary text-primary-foreground">
                {presence.userId.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          ))}
          {presenceList.length > 5 && (
            <Badge variant="secondary" className="w-6 h-6 rounded-full p-0 text-xs">
              +{presenceList.length - 5}
            </Badge>
          )}
        </div>
      )}
    </div>
  );
};