import { memo, useState, useEffect } from 'react';
import { BaseWidget } from '@/types/widgets';
import { WidgetContainer } from './WidgetContainer';
import { useWidgetState } from '@/hooks/useWidgetState';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { 
  Folder, 
  File, 
  FileText, 
  FileImage, 
  FileAudio, 
  FileVideo, 
  Database, 
  ChevronRight, 
  ChevronDown, 
  HardDrive,
  Lock
} from 'lucide-react';

interface FileExplorerWidgetProps {
  widget: BaseWidget;
}

interface FileItem {
  id: string;
  name: string;
  type: 'folder' | 'file';
  fileType?: 'text' | 'image' | 'audio' | 'video' | 'data' | 'executable' | 'unknown';
  size?: number;
  modified: Date;
  locked?: boolean;
  children?: FileItem[];
  expanded?: boolean;
}

const mockFileSystem: FileItem = {
  id: 'root',
  name: 'VAULT-TEC System',
  type: 'folder',
  modified: new Date(),
  expanded: true,
  children: [
    {
      id: 'system',
      name: 'SYSTEM',
      type: 'folder',
      modified: new Date(Date.now() - 24 * 60 * 60 * 1000),
      locked: true,
      children: [
        {
          id: 'boot',
          name: 'boot.cfg',
          type: 'file',
          fileType: 'text',
          size: 2048,
          modified: new Date(Date.now() - 48 * 60 * 60 * 1000),
          locked: true
        },
        {
          id: 'reactor',
          name: 'reactor_control.exe',
          type: 'file',
          fileType: 'executable',
          size: 15360,
          modified: new Date(Date.now() - 72 * 60 * 60 * 1000),
          locked: true
        }
      ]
    },
    {
      id: 'users',
      name: 'USERS',
      type: 'folder',
      modified: new Date(Date.now() - 12 * 60 * 60 * 1000),
      children: [
        {
          id: 'profile',
          name: 'profile_data.dat',
          type: 'file',
          fileType: 'data',
          size: 4096,
          modified: new Date(Date.now() - 6 * 60 * 60 * 1000)
        },
        {
          id: 'avatar',
          name: 'avatar.img',
          type: 'file',
          fileType: 'image',
          size: 8192,
          modified: new Date(Date.now() - 8 * 60 * 60 * 1000)
        }
      ]
    },
    {
      id: 'media',
      name: 'MEDIA',
      type: 'folder',
      modified: new Date(Date.now() - 6 * 60 * 60 * 1000),
      children: [
        {
          id: 'radio',
          name: 'radio_logs.txt',
          type: 'file',
          fileType: 'text',
          size: 12288,
          modified: new Date(Date.now() - 2 * 60 * 60 * 1000)
        },
        {
          id: 'holotapes',
          name: 'HOLOTAPES',
          type: 'folder',
          modified: new Date(Date.now() - 4 * 60 * 60 * 1000),
          children: [
            {
              id: 'welcome',
              name: 'welcome_msg.audio',
              type: 'file',
              fileType: 'audio',
              size: 24576,
              modified: new Date(Date.now() - 48 * 60 * 60 * 1000)
            },
            {
              id: 'training',
              name: 'safety_training.video',
              type: 'file',
              fileType: 'video',
              size: 102400,
              modified: new Date(Date.now() - 96 * 60 * 60 * 1000)
            }
          ]
        }
      ]
    },
    {
      id: 'logs',
      name: 'LOGS',
      type: 'folder',
      modified: new Date(Date.now() - 1 * 60 * 60 * 1000),
      children: [
        {
          id: 'error_log',
          name: 'error.log',
          type: 'file',
          fileType: 'text',
          size: 1024,
          modified: new Date(Date.now() - 30 * 60 * 1000)
        },
        {
          id: 'access_log',
          name: 'access.log',
          type: 'file',
          fileType: 'text',
          size: 8192,
          modified: new Date(Date.now() - 15 * 60 * 1000)
        }
      ]
    }
  ]
};

const getFileIcon = (item: FileItem) => {
  if (item.type === 'folder') {
    return <Folder className="h-4 w-4 text-pip-accent" />;
  }

  switch (item.fileType) {
    case 'text':
      return <FileText className="h-4 w-4 text-pip-text-secondary" />;
    case 'image':
      return <FileImage className="h-4 w-4 text-pip-primary" />;
    case 'audio':
      return <FileAudio className="h-4 w-4 text-orange-400" />;
    case 'video':
      return <FileVideo className="h-4 w-4 text-purple-400" />;
    case 'data':
      return <Database className="h-4 w-4 text-pip-accent" />;
    case 'executable':
      return <HardDrive className="h-4 w-4 text-destructive" />;
    default:
      return <File className="h-4 w-4 text-pip-text-muted" />;
  }
};

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
};

const formatDate = (date: Date): string => {
  const now = new Date();
  const diffHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
  
  if (diffHours < 1) {
    return 'Just now';
  } else if (diffHours < 24) {
    return `${diffHours}h ago`;
  } else {
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  }
};

export const FileExplorerWidget: React.FC<FileExplorerWidgetProps> = memo(({ widget }) => {
  const { settings, setSettings, collapsed, setCollapsed, isLoading, error } = useWidgetState(
    widget.id,
    widget.settings
  );

  const [fileSystem, setFileSystem] = useState<FileItem>(mockFileSystem);
  const [currentPath, setCurrentPath] = useState<string[]>(['VAULT-TEC System']);

  const toggleFolder = (itemId: string, path: FileItem[] = [fileSystem]): void => {
    for (const item of path) {
      if (item.id === itemId && item.type === 'folder') {
        item.expanded = !item.expanded;
        setFileSystem({...fileSystem});
        return;
      }
      if (item.children) {
        toggleFolder(itemId, item.children);
      }
    }
  };

  const renderFileTree = (items: FileItem[], depth: number = 0): JSX.Element[] => {
    return items.map((item) => (
      <div key={item.id} className="select-none">
        <div
          className={`flex items-center gap-2 p-2 hover:bg-pip-bg-secondary/50 cursor-pointer rounded text-xs ${
            item.locked ? 'opacity-70' : ''
          }`}
          style={{ paddingLeft: `${(depth * 16) + 8}px` }}
          onClick={() => item.type === 'folder' && toggleFolder(item.id)}
        >
          {item.type === 'folder' && (
            <Button
              variant="ghost"
              size="sm"
              className="h-4 w-4 p-0 hover:bg-transparent"
            >
              {item.expanded ? (
                <ChevronDown className="h-3 w-3 text-pip-text-muted" />
              ) : (
                <ChevronRight className="h-3 w-3 text-pip-text-muted" />
              )}
            </Button>
          )}
          
          <div className="flex items-center gap-2 flex-1">
            {getFileIcon(item)}
            {item.locked && <Lock className="h-3 w-3 text-destructive" />}
            
            <span className={`font-mono ${item.locked ? 'text-destructive' : 'text-pip-text'}`}>
              {item.name}
            </span>
          </div>

          <div className="text-xs text-pip-text-muted font-mono flex items-center gap-3">
            {item.size && <span>{formatFileSize(item.size)}</span>}
            <span>{formatDate(item.modified)}</span>
          </div>
        </div>

        {item.type === 'folder' && item.expanded && item.children && (
          <div>
            {renderFileTree(item.children, depth + 1)}
          </div>
        )}
      </div>
    ));
  };

  if (isLoading) {
    return (
      <WidgetContainer
        widgetId={widget.id}
        widgetType={widget.type}
        title={widget.title}
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed(!collapsed)}
        onSettingsChange={() => {}}
        onDelete={() => {}}
        isLoading={true}
      >
        <div />
      </WidgetContainer>
    );
  }

  return (
    <WidgetContainer
      widgetId={widget.id}
      widgetType={widget.type}
      title={widget.title}
      collapsed={collapsed}
      onToggleCollapse={() => setCollapsed(!collapsed)}
      onSettingsChange={() => {}}
      onDelete={() => {}}
      error={error}
    >
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs">
          <span className="text-pip-text-muted flex items-center gap-1">
            <HardDrive className="h-3 w-3" />
            FILE SYSTEM
          </span>
          <span className="text-pip-accent font-mono">
            {currentPath.join(' / ')}
          </span>
        </div>

        <Card className="border-pip-border bg-pip-bg-secondary/30">
          <CardContent className="p-0">
            <ScrollArea className="h-64">
              <div className="p-2 space-y-1">
                {fileSystem.children && renderFileTree(fileSystem.children)}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        <div className="flex justify-between items-center text-xs text-pip-text-muted pt-2 border-t border-pip-border">
          <span>
            {fileSystem.children?.reduce((count, item) => 
              count + (item.children?.length || 0) + 1, 0
            )} items
          </span>
          <span className="animate-pulse">● CONNECTED</span>
        </div>
      </div>
    </WidgetContainer>
  );
});

FileExplorerWidget.displayName = 'FileExplorerWidget';