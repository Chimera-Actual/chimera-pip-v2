import { 
  Folder, Settings, BarChart3, Gamepad2, Music, Video, Code, 
  Book, Camera, Terminal, Database, Network, Shield, Rocket, Star,
  Package, Map, Radio, User
} from 'lucide-react';

// Icon mapping for tabs - matches TabEditor's available icons
export const iconMapping = {
  // Default system icons
  'STAT': BarChart3,
  'INV': Package,
  'DATA': Database,
  'MAP': Map,
  'RADIO': Radio,
  'MAIN': Settings,
  
  // Custom icons from TabEditor
  'FolderIcon': Folder,
  'CogIcon': Settings,
  'ChartIcon': BarChart3,
  'GamepadIcon': Gamepad2,
  'MusicIcon': Music,
  'VideoIcon': Video,
  'CodeIcon': Code,
  'BookIcon': Book,
  'CameraIcon': Camera,
  'TerminalIcon': Terminal,
  'DatabaseIcon': Database,
  'NetworkIcon': Network,
  'ShieldIcon': Shield,
  'RocketIcon': Rocket,
  'StarIcon': Star,
} as const;

export const getTabIcon = (tabName: string, customIcon?: string) => {
  // First try to use custom icon from database
  if (customIcon && iconMapping[customIcon as keyof typeof iconMapping]) {
    return iconMapping[customIcon as keyof typeof iconMapping];
  }
  
  // Fall back to default system icon
  if (iconMapping[tabName as keyof typeof iconMapping]) {
    return iconMapping[tabName as keyof typeof iconMapping];
  }
  
  // Final fallback to Settings icon
  return Settings;
};

// Mapping for simple icon names to components
const simpleIconMapping = {
  'User': User,
  'Package': Package,
  'Database': Database,
  'Map': Map,
  'Radio': Radio,
  'Settings': Settings,
  'Folder': Folder,
  'BarChart3': BarChart3,
  'Terminal': Terminal,
  'Shield': Shield,
  'Star': Star,
} as const;

export const getIconComponent = (iconName: string) => {
  return simpleIconMapping[iconName as keyof typeof simpleIconMapping] || Settings;
};