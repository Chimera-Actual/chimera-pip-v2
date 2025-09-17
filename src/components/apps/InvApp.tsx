import React, { memo } from 'react';
import { InvTab } from '@/components/PipBoy/tabs/InvTab';

interface InvAppProps {
  settings?: Record<string, any>;
}

export const InvApp = memo<InvAppProps>(({ settings }) => {
  return (
    <div className="h-full overflow-auto">
      <InvTab />
    </div>
  );
});