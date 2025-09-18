import React, { createContext, useContext } from 'react';
import { useTabManager } from '@/hooks/useTabManagerRefactored';

// Creates a single shared instance of useTabManager across the app
const TabManagerContext = createContext<ReturnType<typeof useTabManager> | null>(null);

export const TabManagerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const tabManager = useTabManager();
  return (
    <TabManagerContext.Provider value={tabManager}>
      {children}
    </TabManagerContext.Provider>
  );
};

export const useTabManagerContext = () => {
  const ctx = useContext(TabManagerContext);
  if (!ctx) {
    throw new Error('useTabManagerContext must be used within a TabManagerProvider');
  }
  return ctx;
};
