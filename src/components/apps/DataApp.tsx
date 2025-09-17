import React, { memo } from 'react';
import { DataTab } from '@/components/PipBoy/tabs/DataTab';

interface DataAppProps {
  settings?: Record<string, any>;
}

export const DataApp = memo<DataAppProps>(({ settings }) => {
  return (
    <div className="h-full overflow-auto">
      <DataTab />
    </div>
  );
});