import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';

export type WidgetAction =
  | { type: 'tab'; id: string; label: string; active: boolean; onSelect: () => void; icon?: LucideIcon }
  | { type: 'button'; id: string; label: string; onClick: () => void; icon?: LucideIcon; disabled?: boolean }
  | { type: 'toggle'; id: string; label: string; on: boolean; onChange: (v: boolean) => void; icon?: LucideIcon }
  | { type: 'input'; id: string; placeholder?: string; value: string; onChange: (v: string) => void; icon?: LucideIcon }
  | { type: 'menu'; id: string; label?: string; icon?: LucideIcon; items: { id: string; label: string; onClick: () => void; icon?: LucideIcon }[] };

export interface WidgetActionBarProps {
  actions: WidgetAction[];
  className?: string;
}

export const WidgetActionBar: React.FC<WidgetActionBarProps> = ({
  actions,
  className,
}) => {
  const [showOverflow, setShowOverflow] = useState(false);
  
  if (actions.length === 0) return null;

  // For now, show all actions (responsive overflow can be added later)
  const visibleActions = actions;
  const overflowActions: WidgetAction[] = [];

  const renderAction = (action: WidgetAction) => {
    const key = action.id;
    
    switch (action.type) {
      case 'tab':
        return (
          <Button
            key={key}
            variant={action.active ? 'default' : 'ghost'}
            size="sm"
            onClick={action.onSelect}
            className="h-8 px-3 text-xs"
            aria-label={action.label}
          >
            {action.icon && <action.icon className="h-3 w-3 mr-1" />}
            {action.label}
          </Button>
        );
        
      case 'button':
        return (
          <Button
            key={key}
            variant="ghost"
            size="sm"
            onClick={action.onClick}
            disabled={action.disabled}
            className="h-8 w-8 p-0"
            title={action.label}
            aria-label={action.label}
          >
            {action.icon && <action.icon className="h-4 w-4" />}
          </Button>
        );
        
      case 'toggle':
        return (
          <div key={key} className="flex items-center gap-2">
            <Switch
              checked={action.on}
              onCheckedChange={action.onChange}
              aria-label={action.label}
            />
            <span className="text-xs text-pip-text-muted">{action.label}</span>
          </div>
        );
        
      case 'input':
        return (
          <div key={key} className="relative flex-1 min-w-0">
            {action.icon && (
              <action.icon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-pip-text-muted" />
            )}
            <Input
              placeholder={action.placeholder}
              value={action.value}
              onChange={(e) => action.onChange(e.target.value)}
              className={cn(
                "h-8 text-xs",
                action.icon && "pl-10"
              )}
              aria-label={action.placeholder}
            />
          </div>
        );
        
      case 'menu':
        return (
          <DropdownMenu key={key}>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                title={action.label}
                aria-label={action.label}
              >
                {action.icon && <action.icon className="h-4 w-4" />}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {action.items.map((item) => (
                <DropdownMenuItem key={item.id} onClick={item.onClick}>
                  {item.icon && <item.icon className="h-4 w-4 mr-2" />}
                  {item.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        );
        
      default:
        return null;
    }
  };

  return (
    <div className={cn(
      "w-full px-4 py-2 bg-pip-bg-secondary/30 border-b border-pip-border",
      "flex items-center gap-3 overflow-x-auto scrollbar-hide",
      className
    )}>
      {/* Visible Actions */}
      {visibleActions.map(renderAction)}
      
      {/* Overflow Menu */}
      {overflowActions.length > 0 && (
        <DropdownMenu open={showOverflow} onOpenChange={setShowOverflow}>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 flex-shrink-0"
              title="More actions"
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            {overflowActions.map((action) => {
              let label: string;
              switch (action.type) {
                case 'input':
                  label = action.placeholder || 'Input';
                  break;
                case 'menu':
                  label = action.label || 'Menu';
                  break;
                case 'tab':
                case 'button':
                case 'toggle':
                  label = action.label;
                  break;
                default:
                  label = 'Action';
              }
              
              return (
                <DropdownMenuItem 
                  key={action.id}
                  onClick={action.type === 'button' ? action.onClick : undefined}
                >
                  {action.icon && <action.icon className="h-4 w-4 mr-2" />}
                  {label}
                </DropdownMenuItem>
              );
            })}
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
};