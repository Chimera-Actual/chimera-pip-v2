import React, { useState } from 'react';
import { 
  Folder, Settings, BarChart3, Monitor, Cloud, Trophy, Shield, FileText, 
  Music, Calendar, MessageCircle, DollarSign, Terminal as TerminalIcon,
  Archive, Grip, Search, Grid, List, Plus, X, Filter, Star, 
  Camera, Database, Network, Rocket, Book, Video, Code, Gamepad2,
  Users, Bell, Heart, Lock, Unlock, Eye, EyeOff, Download, Upload,
  Edit3, Check, ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Home,
  User, Mail, Phone, MapPin, Globe, Wifi, Battery, Clock, Sun, Moon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

interface IconPickerProps {
  selectedIcon?: string;
  onIconSelect: (icon: string) => void;
  triggerClassName?: string;
}

// Available icons with their names and components
const AVAILABLE_ICONS = {
  // Widget specific icons
  'folder': { name: 'Folder', icon: Folder },
  'bar-chart-3': { name: 'Statistics', icon: BarChart3 },
  'monitor': { name: 'Monitor', icon: Monitor },
  'cloud': { name: 'Weather', icon: Cloud },
  'trophy': { name: 'Achievement', icon: Trophy },
  'shield': { name: 'Security', icon: Shield },
  'file-text': { name: 'Documents', icon: FileText },
  'music': { name: 'Audio', icon: Music },
  'calendar': { name: 'Calendar', icon: Calendar },
  'message-circle': { name: 'Messages', icon: MessageCircle },
  'dollar-sign': { name: 'Finance', icon: DollarSign },
  'terminal': { name: 'Terminal', icon: TerminalIcon },
  
  // Common UI icons
  'settings': { name: 'Settings', icon: Settings },
  'archive': { name: 'Archive', icon: Archive },
  'star': { name: 'Favorite', icon: Star },
  'camera': { name: 'Camera', icon: Camera },
  'database': { name: 'Database', icon: Database },
  'network': { name: 'Network', icon: Network },
  'rocket': { name: 'Launch', icon: Rocket },
  'book': { name: 'Manual', icon: Book },
  'video': { name: 'Video', icon: Video },
  'code': { name: 'Code', icon: Code },
  'gamepad-2': { name: 'Gaming', icon: Gamepad2 },
  
  // System icons
  'users': { name: 'Users', icon: Users },
  'bell': { name: 'Notifications', icon: Bell },
  'heart': { name: 'Health', icon: Heart },
  'lock': { name: 'Lock', icon: Lock },
  'unlock': { name: 'Unlock', icon: Unlock },
  'eye': { name: 'View', icon: Eye },
  'eye-off': { name: 'Hidden', icon: EyeOff },
  'download': { name: 'Download', icon: Download },
  'upload': { name: 'Upload', icon: Upload },
  
  // Navigation icons
  'home': { name: 'Home', icon: Home },
  'user': { name: 'Profile', icon: User },
  'mail': { name: 'Mail', icon: Mail },
  'phone': { name: 'Phone', icon: Phone },
  'map-pin': { name: 'Location', icon: MapPin },
  'globe': { name: 'Web', icon: Globe },
  
  // Status icons  
  'wifi': { name: 'Network', icon: Wifi },
  'battery': { name: 'Power', icon: Battery },
  'clock': { name: 'Time', icon: Clock },
  'sun': { name: 'Day', icon: Sun },
  'moon': { name: 'Night', icon: Moon },
};

const ICON_CATEGORIES = {
  'widgets': ['folder', 'bar-chart-3', 'monitor', 'cloud', 'trophy', 'shield', 'file-text', 'music', 'calendar', 'message-circle', 'dollar-sign', 'terminal'],
  'system': ['settings', 'archive', 'database', 'network', 'rocket', 'users', 'bell', 'lock', 'unlock'],
  'media': ['camera', 'video', 'music', 'book', 'code', 'gamepad-2'],
  'actions': ['download', 'upload', 'eye', 'eye-off', 'heart', 'star'],
  'navigation': ['home', 'user', 'mail', 'phone', 'map-pin', 'globe'],
  'status': ['wifi', 'battery', 'clock', 'sun', 'moon']
};

export const IconPicker: React.FC<IconPickerProps> = ({
  selectedIcon,
  onIconSelect,
  triggerClassName
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('widgets');

  const getIconComponent = (iconName?: string) => {
    if (!iconName) return Folder;
    return AVAILABLE_ICONS[iconName as keyof typeof AVAILABLE_ICONS]?.icon || Folder;
  };

  const filteredIcons = React.useMemo(() => {
    let icons = ICON_CATEGORIES[selectedCategory as keyof typeof ICON_CATEGORIES] || [];
    
    if (searchQuery) {
      icons = Object.keys(AVAILABLE_ICONS).filter(iconKey => {
        const iconData = AVAILABLE_ICONS[iconKey as keyof typeof AVAILABLE_ICONS];
        return iconData.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
               iconKey.toLowerCase().includes(searchQuery.toLowerCase());
      });
    }
    
    return icons;
  }, [selectedCategory, searchQuery]);

  const SelectedIcon = getIconComponent(selectedIcon);

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full h-10 px-3 justify-start bg-pip-bg-secondary/50 border-pip-border hover:bg-pip-green-primary/10 hover:border-pip-green-primary",
            triggerClassName
          )}
        >
          <SelectedIcon className="h-4 w-4 mr-2 text-pip-green-primary" />
          <span className="text-pip-text font-pip-mono text-sm">
            {selectedIcon ? AVAILABLE_ICONS[selectedIcon as keyof typeof AVAILABLE_ICONS]?.name || selectedIcon : 'Select Icon'}
          </span>
        </Button>
      </PopoverTrigger>
      
      <PopoverContent className="w-80 p-0 bg-pip-bg border-pip-border shadow-pip-glow" align="start">
        <div className="p-4 border-b border-pip-border">
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-pip-text-muted" />
            <Input
              type="text"
              placeholder="Search icons..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-pip-bg-secondary/50 border-pip-border focus:border-pip-green-primary font-pip-mono text-pip-text"
            />
          </div>
          
          <div className="flex flex-wrap gap-1">
            {Object.keys(ICON_CATEGORIES).map(category => (
              <Button
                key={category}
                variant="ghost"
                size="sm"
                onClick={() => setSelectedCategory(category)}
                className={cn(
                  "text-xs font-pip-mono capitalize transition-all",
                  selectedCategory === category
                    ? "bg-pip-green-primary/20 text-pip-green-primary border border-pip-green-primary/30"
                    : "text-pip-text-muted hover:text-pip-green-primary hover:bg-pip-green-primary/10"
                )}
              >
                {category}
              </Button>
            ))}
          </div>
        </div>
        
        <div className="p-2 max-h-64 overflow-y-auto pip-scrollbar">
          <div className="grid grid-cols-6 gap-1">
            {filteredIcons.map(iconKey => {
              const IconComponent = AVAILABLE_ICONS[iconKey as keyof typeof AVAILABLE_ICONS]?.icon;
              const iconName = AVAILABLE_ICONS[iconKey as keyof typeof AVAILABLE_ICONS]?.name;
              
              if (!IconComponent) return null;
              
              return (
                <Button
                  key={iconKey}
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    onIconSelect(iconKey);
                    setIsOpen(false);
                  }}
                  className={cn(
                    "h-10 w-10 p-0 transition-all hover:bg-pip-green-primary/20 hover:scale-105",
                    selectedIcon === iconKey && "bg-pip-green-primary/20 border border-pip-green-primary/30"
                  )}
                  title={iconName}
                >
                  <IconComponent className="h-4 w-4 text-pip-green-primary" />
                </Button>
              );
            })}
          </div>
          
          {filteredIcons.length === 0 && (
            <div className="text-center py-8 text-pip-text-muted font-pip-mono text-sm">
              No icons found for "{searchQuery}"
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};