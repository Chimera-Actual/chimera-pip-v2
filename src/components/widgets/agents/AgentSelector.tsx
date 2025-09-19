import React from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ChevronDown } from 'lucide-react';
import type { AgentDefinition } from '@/types/agents';

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
  const renderIcon = (IconComponent?: React.ComponentType<any>) => {
    if (!IconComponent) return null;
    return <IconComponent className="h-4 w-4" />;
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          disabled={disabled}
          className="h-8 px-3 gap-2 text-xs bg-pip-bg-primary/20 border-pip-border hover:bg-pip-accent/10"
        >
          {renderIcon(selectedAgent.icon)}
          <span className="truncate max-w-[120px]">{selectedAgent.name}</span>
          <ChevronDown className="h-3 w-3 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="start" 
        className="w-56 bg-pip-bg-primary/95 backdrop-blur-sm border-pip-border"
      >
        {agents.map((agent) => (
          <DropdownMenuItem
            key={agent.id}
            onClick={() => onAgentChange(agent)}
            className="gap-2 cursor-pointer hover:bg-pip-accent/10 focus:bg-pip-accent/20"
          >
            {renderIcon(agent.icon)}
            <div className="flex flex-col gap-1">
              <span className="text-sm font-medium">{agent.name}</span>
              {agent.description && (
                <span className="text-xs text-pip-text-muted line-clamp-1">
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