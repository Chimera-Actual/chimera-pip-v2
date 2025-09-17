import React, { memo } from 'react';
import { StatTab } from '@/components/PipBoy/tabs/StatTab';

interface StatAppProps {
  settings?: Record<string, any>;
}

export const StatApp = memo<StatAppProps>(({ settings }) => {
  return (
    <div className="h-full overflow-auto">
      <StatTab />
    </div>
  );
});