import { 
  // System & Navigation
  Folder, Settings, BarChart3, Gamepad2, Music, Video, Code, 
  Book, Camera, Terminal, Database, Network, Shield, Rocket, Star,
  Package, Map, Radio, Home, Menu, Search, Bell, User, Heart,
  
  // Communication & Social
  Mail, MessageCircle, Phone, Users, UserPlus, Share, Send,
  Globe, Wifi, Bluetooth, Rss, Megaphone, AtSign,
  
  // Media & Files
  Image, FileText, File, Download, Upload, Save, FolderOpen,
  Archive, Paperclip, Mic, Volume2, Play, Pause, SkipForward,
  
  // UI & Interface
  Eye, EyeOff, Edit, Trash2, Plus, Minus, X, Check, ArrowLeft,
  ArrowRight, ArrowUp, ArrowDown, ChevronLeft, ChevronRight,
  ChevronUp, ChevronDown, MoreHorizontal, MoreVertical, Grid,
  List, Filter, ArrowUpDown, RotateCcw, Maximize, Minimize, Copy,
  
  // Business & Productivity
  Calendar, Clock, Timer, Target, Flag, Bookmark, Tag, Tags,
  Briefcase, Building, TrendingUp, TrendingDown, PieChart,
  Activity, Award, Gift, ShoppingCart, CreditCard, DollarSign,
  
  // Science & Technology
  Cpu, HardDrive, Monitor, Smartphone, Tablet, Laptop, Server,
  Cloud, CloudDownload, CloudUpload, Key, Lock, Unlock, Zap,
  Battery, Signal, Router, Usb, Bluetooth as BluetoothIcon,
  
  // Creative & Design
  Palette, Brush, Scissors, Layers, Move, RotateCcw as Rotate, Crop,
  Square, Circle, Triangle, Hexagon, Diamond, Pen, PenTool,
  
  // Weather & Nature
  Sun, Moon, Cloud as CloudIcon, CloudRain, Zap as Lightning,
  Snowflake, Wind, Thermometer, Umbrella, TreePine, Flower,
  
  // Transportation
  Car, Truck, Plane, Train, Ship, Bike, Bus, MapPin, Navigation,
  Compass, Route, Fuel, ParkingCircle,
  
  // Health & Medical
  Activity as Pulse, Heart as HeartIcon, Pill, Stethoscope,
  Cross, Shield as MedicalShield, Thermometer as Temperature,
  
  // Tools & Utilities
  Wrench, Hammer, WrenchIcon, Scissors as ScissorsIcon,
  Ruler, Calculator, Flashlight, Magnet, Anchor, Gauge
} from 'lucide-react';

// Icon mapping for tabs - comprehensive collection
export const iconMapping = {
  // Default system icons
  'STAT': BarChart3,
  'INV': Package,
  'DATA': Database,
  'MAP': Map,
  'RADIO': Radio,
  'MAIN': Settings,
  
  // System & Navigation
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
  'PackageIcon': Package,
  'MapIcon': Map,
  'RadioIcon': Radio,
  'HomeIcon': Home,
  'MenuIcon': Menu,
  'SearchIcon': Search,
  'BellIcon': Bell,
  'UserIcon': User,
  'HeartIcon': Heart,
  
  // Communication & Social
  'MailIcon': Mail,
  'MessageIcon': MessageCircle,
  'PhoneIcon': Phone,
  'UsersIcon': Users,
  'UserPlusIcon': UserPlus,
  'ShareIcon': Share,
  'SendIcon': Send,
  'GlobeIcon': Globe,
  'WifiIcon': Wifi,
  'BluetoothIcon': Bluetooth,
  'RssIcon': Rss,
  'MegaphoneIcon': Megaphone,
  'AtSignIcon': AtSign,
  
  // Media & Files
  'ImageIcon': Image,
  'FileTextIcon': FileText,
  'FileIcon': File,
  'DownloadIcon': Download,
  'UploadIcon': Upload,
  'SaveIcon': Save,
  'FolderOpenIcon': FolderOpen,
  'ArchiveIcon': Archive,
  'PaperclipIcon': Paperclip,
  'MicIcon': Mic,
  'VolumeIcon': Volume2,
  'PlayIcon': Play,
  'PauseIcon': Pause,
  'SkipForwardIcon': SkipForward,
  
  // UI & Interface
  'EyeIcon': Eye,
  'EyeOffIcon': EyeOff,
  'EditIcon': Edit,
  'TrashIcon': Trash2,
  'PlusIcon': Plus,
  'MinusIcon': Minus,
  'XIcon': X,
  'CheckIcon': Check,
  'ArrowLeftIcon': ArrowLeft,
  'ArrowRightIcon': ArrowRight,
  'ArrowUpIcon': ArrowUp,
  'ArrowDownIcon': ArrowDown,
  'ChevronLeftIcon': ChevronLeft,
  'ChevronRightIcon': ChevronRight,
  'ChevronUpIcon': ChevronUp,
  'ChevronDownIcon': ChevronDown,
  'MoreHorizontalIcon': MoreHorizontal,
  'MoreVerticalIcon': MoreVertical,
  'GridIcon': Grid,
  'ListIcon': List,
  'FilterIcon': Filter,
  'SortIcon': ArrowUpDown,
  'RefreshIcon': RotateCcw,
  'MaximizeIcon': Maximize,
  'MinimizeIcon': Minimize,
  'CopyIcon': Copy,
  
  // Business & Productivity
  'CalendarIcon': Calendar,
  'ClockIcon': Clock,
  'TimerIcon': Timer,
  'TargetIcon': Target,
  'FlagIcon': Flag,
  'BookmarkIcon': Bookmark,
  'TagIcon': Tag,
  'TagsIcon': Tags,
  'BriefcaseIcon': Briefcase,
  'BuildingIcon': Building,
  'TrendingUpIcon': TrendingUp,
  'TrendingDownIcon': TrendingDown,
  'PieChartIcon': PieChart,
  'ActivityIcon': Activity,
  'AwardIcon': Award,
  'GiftIcon': Gift,
  'ShoppingIcon': ShoppingCart,
  'CreditCardIcon': CreditCard,
  'DollarSignIcon': DollarSign,
  
  // Science & Technology
  'CpuIcon': Cpu,
  'HardDriveIcon': HardDrive,
  'MonitorIcon': Monitor,
  'SmartphoneIcon': Smartphone,
  'TabletIcon': Tablet,
  'LaptopIcon': Laptop,
  'ServerIcon': Server,
  'CloudIcon': Cloud,
  'CloudDownloadIcon': CloudDownload,
  'CloudUploadIcon': CloudUpload,
  'KeyIcon': Key,
  'LockIcon': Lock,
  'UnlockIcon': Unlock,
  'ZapIcon': Zap,
  'BatteryIcon': Battery,
  'SignalIcon': Signal,
  'RouterIcon': Router,
  'UsbIcon': Usb,
  
  // Creative & Design
  'PaletteIcon': Palette,
  'BrushIcon': Brush,
  'ScissorsIcon': Scissors,
  'LayersIcon': Layers,
  'MoveIcon': Move,
  'RotateIcon': RotateCcw,
  'CropIcon': Crop,
  'SquareIcon': Square,
  'CircleIcon': Circle,
  'TriangleIcon': Triangle,
  'HexagonIcon': Hexagon,
  'DiamondIcon': Diamond,
  'PenIcon': Pen,
  'PenToolIcon': PenTool,
  
  // Weather & Nature
  'SunIcon': Sun,
  'MoonIcon': Moon,
  'CloudWeatherIcon': CloudIcon,
  'RainIcon': CloudRain,
  'LightningIcon': Lightning,
  'SnowflakeIcon': Snowflake,
  'WindIcon': Wind,
  'ThermometerIcon': Thermometer,
  'UmbrellaIcon': Umbrella,
  'TreeIcon': TreePine,
  'FlowerIcon': Flower,
  
  // Transportation
  'CarIcon': Car,
  'TruckIcon': Truck,
  'PlaneIcon': Plane,
  'TrainIcon': Train,
  'ShipIcon': Ship,
  'BikeIcon': Bike,
  'BusIcon': Bus,
  'MapPinIcon': MapPin,
  'NavigationIcon': Navigation,
  'CompassIcon': Compass,
  'RouteIcon': Route,
  'FuelIcon': Fuel,
  'ParkingIcon': ParkingCircle,
  
  // Health & Medical
  'PulseIcon': Pulse,
  'HeartMedicalIcon': HeartIcon,
  'PillIcon': Pill,
  'StethoscopeIcon': Stethoscope,
  'CrossIcon': Cross,
  'MedicalShieldIcon': MedicalShield,
  'TemperatureIcon': Temperature,
  
  // Tools & Utilities
  'WrenchIcon': Wrench,
  'HammerIcon': Hammer,
  'ScrewdriverIcon': Wrench,
  'RulerIcon': Ruler,
  'CalculatorIcon': Calculator,
  'FlashlightIcon': Flashlight,
  'MagnetIcon': Magnet,
  'AnchorIcon': Anchor,
  'GaugeIcon': Gauge,
} as const;

// Icon categories for better organization
export const iconCategories = {
  'system': [
    'STAT', 'INV', 'DATA', 'MAP', 'RADIO', 'MAIN', 'FolderIcon', 'CogIcon', 
    'HomeIcon', 'MenuIcon', 'SearchIcon', 'BellIcon', 'UserIcon'
  ],
  'communication': [
    'MailIcon', 'MessageIcon', 'PhoneIcon', 'UsersIcon', 'UserPlusIcon', 
    'ShareIcon', 'SendIcon', 'GlobeIcon', 'WifiIcon', 'BluetoothIcon', 
    'RssIcon', 'MegaphoneIcon', 'AtSignIcon'
  ],
  'media': [
    'MusicIcon', 'VideoIcon', 'ImageIcon', 'CameraIcon', 'MicIcon', 
    'VolumeIcon', 'PlayIcon', 'PauseIcon', 'SkipForwardIcon'
  ],
  'files': [
    'FileTextIcon', 'FileIcon', 'DownloadIcon', 'UploadIcon', 'SaveIcon', 
    'FolderOpenIcon', 'ArchiveIcon', 'PaperclipIcon'
  ],
  'interface': [
    'EyeIcon', 'EyeOffIcon', 'EditIcon', 'TrashIcon', 'PlusIcon', 'MinusIcon', 
    'XIcon', 'CheckIcon', 'ArrowLeftIcon', 'ArrowRightIcon', 'ArrowUpIcon', 
    'ArrowDownIcon', 'ChevronLeftIcon', 'ChevronRightIcon', 'ChevronUpIcon', 
    'ChevronDownIcon', 'MoreHorizontalIcon', 'MoreVerticalIcon', 'GridIcon', 
    'ListIcon', 'FilterIcon', 'SortIcon', 'RefreshIcon', 'MaximizeIcon', 
    'MinimizeIcon', 'CopyIcon'
  ],
  'business': [
    'CalendarIcon', 'ClockIcon', 'TimerIcon', 'TargetIcon', 'FlagIcon', 
    'BookmarkIcon', 'TagIcon', 'TagsIcon', 'BriefcaseIcon', 'BuildingIcon', 
    'TrendingUpIcon', 'TrendingDownIcon', 'PieChartIcon', 'ActivityIcon', 
    'AwardIcon', 'GiftIcon', 'ShoppingIcon', 'CreditCardIcon', 'DollarSignIcon'
  ],
  'technology': [
    'CodeIcon', 'TerminalIcon', 'DatabaseIcon', 'NetworkIcon', 'ShieldIcon', 
    'RocketIcon', 'CpuIcon', 'HardDriveIcon', 'MonitorIcon', 'SmartphoneIcon', 
    'TabletIcon', 'LaptopIcon', 'ServerIcon', 'CloudIcon', 'CloudDownloadIcon', 
    'CloudUploadIcon', 'KeyIcon', 'LockIcon', 'UnlockIcon', 'ZapIcon', 
    'BatteryIcon', 'SignalIcon', 'RouterIcon', 'UsbIcon'
  ],
  'creative': [
    'BookIcon', 'PaletteIcon', 'BrushIcon', 'ScissorsIcon', 'LayersIcon', 
    'MoveIcon', 'RotateIcon', 'CropIcon', 'SquareIcon', 'CircleIcon', 
    'TriangleIcon', 'HexagonIcon', 'DiamondIcon', 'PenIcon', 'PenToolIcon'
  ],
  'weather': [
    'SunIcon', 'MoonIcon', 'CloudWeatherIcon', 'RainIcon', 'LightningIcon', 
    'SnowflakeIcon', 'WindIcon', 'ThermometerIcon', 'UmbrellaIcon'
  ],
  'nature': [
    'TreeIcon', 'FlowerIcon', 'HeartIcon'
  ],
  'transport': [
    'CarIcon', 'TruckIcon', 'PlaneIcon', 'TrainIcon', 'ShipIcon', 'BikeIcon', 
    'BusIcon', 'MapPinIcon', 'NavigationIcon', 'CompassIcon', 'RouteIcon', 
    'FuelIcon', 'ParkingIcon'
  ],
  'medical': [
    'PulseIcon', 'HeartMedicalIcon', 'PillIcon', 'StethoscopeIcon', 'CrossIcon', 
    'MedicalShieldIcon', 'TemperatureIcon'
  ],
  'tools': [
    'WrenchIcon', 'HammerIcon', 'ScrewdriverIcon', 'RulerIcon', 'CalculatorIcon', 
    'FlashlightIcon', 'MagnetIcon', 'AnchorIcon', 'GaugeIcon'
  ],
  'gaming': [
    'GamepadIcon', 'StarIcon', 'PackageIcon'
  ]
} as const;

export type IconName = keyof typeof iconMapping;
export type IconCategory = keyof typeof iconCategories;

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