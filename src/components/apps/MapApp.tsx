import React, { memo } from 'react';
import { MapTab } from '@/components/PipBoy/tabs/MapTab';

interface MapAppProps {
  settings?: Record<string, any>;
}

export const MapApp = memo<MapAppProps>(({ settings }) => {
  return (
    <div className="h-full overflow-auto">
      <MapTab />
    </div>
  );
});