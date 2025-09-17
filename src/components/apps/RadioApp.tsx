import React, { memo } from 'react';
import { RadioTab } from '@/components/PipBoy/tabs/RadioTab';

interface RadioAppProps {
  settings?: Record<string, any>;
}

export const RadioApp = memo<RadioAppProps>(({ settings }) => {
  return (
    <div className="h-full overflow-auto">
      <RadioTab />
    </div>
  );
});