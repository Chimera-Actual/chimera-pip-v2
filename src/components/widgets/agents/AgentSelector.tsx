import React from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ChevronDown } from 'lucide-react';
import { Icon } from 'lucide-react';
import type { AgentDefinition } from '@/types/agents';
import * as LucideIcons from 'lucide-react';

interface AgentSelectorProps {
  agents: AgentDefinition[];
  selectedAgent: AgentDefinition;
  onAgentChange: (agent: AgentDefinition) => void;
  disabled?: boolean;
}

export function AgentSelector({ 
  agents, 
  selectedAgent, 
  onAgentChange, 
  disabled = false 
}: AgentSelectorProps) {
  const getIconComponent = (iconName?: string) => {
    if (!iconName) return null;
    const IconComponent = (LucideIcons as any)[iconName];
    return IconComponent ? <IconComponent className="h-4 w-4" /> : null;
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          disabled={disabled}
          className="h-8 px-3 gap-2 text-xs bg-background/20 border-primary/20 hover:bg-primary/10"
        >
          {getIconComponent(selectedAgent.icon)}
          <span className="truncate max-w-[120px]">{selectedAgent.name}</span>
          <ChevronDown className="h-3 w-3 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="start" 
        className="w-56 bg-background/95 backdrop-blur-sm border-primary/20"
      >
        {agents.map((agent) => (
          <DropdownMenuItem
            key={agent.id}
            onClick={() => onAgentChange(agent)}
            className="gap-2 cursor-pointer hover:bg-primary/10 focus:bg-primary/20"
          >
            {getIconComponent(agent.icon)}
            <div className="flex flex-col gap-1">
              <span className="text-sm font-medium">{agent.name}</span>
              {agent.description && (
                <span className="text-xs text-muted-foreground line-clamp-1">
                  {agent.description}
                </span>
              )}
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}