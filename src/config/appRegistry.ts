import { AppDefinition, AppCategory } from '@/types/appManagement';

// Registry of all available apps
export const APP_REGISTRY: AppDefinition[] = [
  {
    id: 'stat-app',
    name: 'Statistics',
    icon: 'User',
    description: 'View your character stats, SPECIAL attributes, and achievements',
    category: 'system',
    component: 'StatApp',
    isDefault: true,
  },
  {
    id: 'inv-app',
    name: 'Inventory',
    icon: 'Package',
    description: 'Manage your digital inventory and file storage',
    category: 'utility',
    component: 'InvApp',
    isDefault: true,
  },
  {
    id: 'data-app',
    name: 'Data Terminal',
    icon: 'Database',
    description: 'Access environmental data, news, and communications',
    category: 'data',
    component: 'DataApp',
    isDefault: true,
  },
  {
    id: 'map-app',
    name: 'Map Navigator',
    icon: 'Map',
    description: 'Navigate locations and view tactical maps',
    category: 'utility',
    component: 'MapApp',
    isDefault: true,
  },
  {
    id: 'radio-app',
    name: 'Radio Station',
    icon: 'Radio',
    description: 'Listen to radio stations and manage audio library',
    category: 'entertainment',
    component: 'RadioApp',
    isDefault: true,
  },
];

export const getAppByComponent = (component: string): AppDefinition | undefined => {
  return APP_REGISTRY.find(app => app.component === component);
};

export const getAppsByCategory = (category: AppCategory): AppDefinition[] => {
  return APP_REGISTRY.filter(app => app.category === category);
};

export const getDefaultApps = (): AppDefinition[] => {
  return APP_REGISTRY.filter(app => app.isDefault);
};