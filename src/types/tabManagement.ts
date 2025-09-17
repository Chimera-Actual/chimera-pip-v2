// Tab Management Types

export interface TabConfiguration {
  id: string;
  name: string;
  icon: string;
  description?: string;
  color?: string;
  position: number;
  isDefault: boolean;
  isCustom: boolean;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export type TabAssignment = 'STAT' | 'INV' | 'DATA' | 'MAP' | 'RADIO';