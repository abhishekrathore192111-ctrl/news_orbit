import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { SiteConfig } from '../types';
import { Api } from '../services/api';

interface SiteConfigContextType {
  config: SiteConfig;
  refreshConfig: () => Promise<void>;
  updateConfig: (newConfig: SiteConfig) => Promise<void>;
  loading: boolean;
}

const SiteConfigContext = createContext<SiteConfigContextType | undefined>(undefined);

export const SiteConfigProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [config, setConfig] = useState<SiteConfig>({
    siteName: 'Newsorbit India',
    logoUrl: '',
    promotions: []
  });
  const [loading, setLoading] = useState(true);

  const refreshConfig = async () => {
    try {
      const data = await Api.getSiteConfig();
      setConfig(data);
    } catch (e) {
      console.error("Config load failed", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshConfig();
  }, []);

  const updateConfig = async (newConfig: SiteConfig) => {
    setLoading(true);
    await Api.updateSiteConfig(newConfig);
    setConfig(newConfig);
    setLoading(false);
  };

  return (
    <SiteConfigContext.Provider value={{ config, refreshConfig, updateConfig, loading }}>
      {children}
    </SiteConfigContext.Provider>
  );
};

export const useSiteConfig = () => {
  const context = useContext(SiteConfigContext);
  if (context === undefined) {
    throw new Error('useSiteConfig must be used within a SiteConfigProvider');
  }
  return context;
};