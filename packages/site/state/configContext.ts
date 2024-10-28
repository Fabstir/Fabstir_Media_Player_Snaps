import { createContext, useContext } from 'react';

import { Config } from './types';

export const ConfigContext = createContext<Config | null>(null);

export const useConfig = () => {
  const context = useContext(ConfigContext);
  if (!context) {
    throw new Error('useConfig must be used within a ConfigProvider');
  }
  return context;
};
