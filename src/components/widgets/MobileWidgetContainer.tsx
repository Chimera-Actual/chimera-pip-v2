import React, { useState, useCallback, useEffect } from 'react';
import { 
  MoreVertical, 
  Settings, 
  X, 
  ChevronUp, 
  ChevronDown,
  Edit3,
  Check,
  Move,
  ArrowLeftRight,
  Folder,
  BarChart3,
  Monitor,
  Cloud,
  Trophy,
  Shield,
  FileText,
  Music,
  Calendar,
  MessageCircle,
  DollarSign,
  Terminal as TerminalIcon
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useGestureHandler } from '@/hooks/useGestureHandler';
import { WidgetSettingsModal } from './WidgetSettingsModal';
import { cn } from '@/lib/utils';

interface MobileWidgetContainerProps {
  widgetId: string;
  widgetType: string;
  title: string;
  collapsed?: boolean;
  isLoading?: boolean;
  error?: string;
  children: React.ReactNode;
  onToggleCollapse?: () => void;
  onSettingsChange?: (settings: any) => void;
  onDelete?: () => void;
  onMove?: (order: number) => void;
  className?: string;
}

export const MobileWidgetContainer: React.FC<MobileWidgetContainerProps> = ({
  widgetId,
  widgetType,
  title,
  collapsed = false,
  isLoading = false,
  error,
  children,
  onToggleCollapse,
  onSettingsChange,
  onDelete,
  onMove,
  className
}) => {
  const [showContextMenu, setShowContextMenu] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const { gestureProps } = useGestureHandler({
    onLongPress: (event) => {
      // Long press on header to show context menu
      if ((event.target as HTMLElement).closest('.widget-header')) {
        setShowContextMenu(true);
        // Haptic feedback if available
        if ('vibrate' in navigator) {
          navigator.vibrate(50);
        }
      }
    },
    onSwipeUp: () => {
      // Swipe up to collapse
      if (!collapsed && onToggleCollapse) {
        onToggleCollapse();
      }
    },
    onSwipeDown: () => {
      // Swipe down to expand
      if (collapsed && onToggleCollapse) {
        onToggleCollapse();
      }
    }
  });

  const handleDragStart = () => {
    setIsDragging(true);
    setShowContextMenu(false);
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  return (
    <div 
      className={cn(
        "pip-widget relative rounded-lg overflow-hidden transition-all duration-300",
        isDragging && "scale-105 shadow-2xl z-50",
        className
      )}
      {...gestureProps}
    >
      {/* Header */}
      <div className="widget-header flex items-center justify-between p-4 bg-pip-bg-secondary/50 border-b border-pip-border">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          {/* Drag Handle - Enhanced for mobile */}
          <div
            className="drag-handle flex-shrink-0 p-2 -m-2 cursor-grab active:cursor-grabbing touch-target"
            onTouchStart={handleDragStart}
            onTouchEnd={handleDragEnd}
            onMouseDown={handleDragStart}
            onMouseUp={handleDragEnd}
          >
            <Move className="w-5 h-5 text-pip-text-secondary" />
          </div>
          
          <h3 className="text-sm font-semibold text-pip-text-bright uppercase tracking-wide truncate">
            {title}
          </h3>
        </div>

        <div className="flex items-center gap-2 touch-spacing">
          {/* Collapse Button */}
          {onToggleCollapse && (
            <button
              className="widget-control-button touch-target-large touch-feedback p-2 text-pip-text-secondary hover:text-pip-text-bright hover:bg-pip-bg-tertiary rounded-md transition-colors"
              onClick={onToggleCollapse}
              aria-label={collapsed ? 'Expand widget' : 'Collapse widget'}
            >
              {collapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
            </button>
          )}

          {/* Context Menu Button */}
          <button
            className="widget-control-button touch-target-large touch-feedback p-2 text-pip-text-secondary hover:text-pip-text-bright hover:bg-pip-bg-tertiary rounded-md transition-colors"
            onClick={() => setShowContextMenu(!showContextMenu)}
            aria-label="Widget options"
          >
            <MoreVertical className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Context Menu - Mobile-optimized action sheet */}
      {showContextMenu && (
        <div className="absolute top-full right-4 mt-2 w-48 bg-pip-bg-secondary border border-pip-border rounded-lg shadow-2xl z-40 overflow-hidden">
          <div className="py-2">
            <button
              className="w-full px-4 py-3 text-left text-sm text-pip-text-secondary hover:bg-pip-bg-tertiary hover:text-pip-text-bright flex items-center gap-3 touch-target"
              onClick={() => {
                setShowSettings(true);
                setShowContextMenu(false);
              }}
            >
              <Settings className="w-4 h-4" />
              Settings
            </button>
            {onDelete && (
              <button
                className="w-full px-4 py-3 text-left text-sm text-destructive hover:bg-destructive/20 flex items-center gap-3 touch-target"
                onClick={() => {
                  onDelete();
                  setShowContextMenu(false);
                }}
              >
                <X className="w-4 h-4" />
                Remove Widget
              </button>
            )}
          </div>
        </div>
      )}

      {/* Backdrop for context menu */}
      {showContextMenu && (
        <div 
          className="fixed inset-0 z-30"
          onClick={() => setShowContextMenu(false)}
        />
      )}

      {/* Content */}
      {!collapsed && (
        <div className="p-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="w-6 h-6 border-2 border-pip-green-primary/20 border-t-pip-green-primary rounded-full animate-spin" />
            </div>
          ) : error ? (
            <div className="py-4 px-3 bg-destructive/10 border border-destructive/30 rounded-md text-destructive text-sm">
              {error}
            </div>
          ) : (
            <div className="space-y-4">
              {children}
            </div>
          )}
        </div>
      )}

      {/* Settings Modal */}
      {showSettings && (
        <WidgetSettingsModal
          widgetId={widgetId}
          widgetType={widgetType}
          widgetTitle={title}
          isOpen={showSettings}
          onClose={() => setShowSettings(false)}
          onSettingsChange={onSettingsChange}
        />
      )}
    </div>
  );
};