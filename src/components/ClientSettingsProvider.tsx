'use client';

import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

type NetworkKey = 'ethereum' | 'polygon' | 'arbitrum' | 'bsc';

const resolveNetwork = (value?: string | null): NetworkKey | null => {
  if (value === 'ethereum' || value === 'polygon' || value === 'arbitrum' || value === 'bsc') {
    return value;
  }
  return null;
};

const defaultSmartAccountEnabled = process.env.NEXT_PUBLIC_SMART_ACCOUNT === 'yes';
const defaultChain = resolveNetwork(process.env.NEXT_PUBLIC_CHAIN) ?? 'polygon';

type ClientSettingsContextValue = {
  chain: NetworkKey;
  smartAccountEnabled: boolean;
  loading: boolean;
};

const ClientSettingsContext = createContext<ClientSettingsContextValue | null>(null);

export function ClientSettingsProvider({ children }: { children: React.ReactNode }) {
  const [chain, setChain] = useState<NetworkKey>(defaultChain);
  const [smartAccountEnabled, setSmartAccountEnabled] = useState(defaultSmartAccountEnabled);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    let interval: ReturnType<typeof setInterval> | null = null;

    const fetchSettings = async () => {
      try {
        const response = await fetch('/api/client/getClientInfo', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        const data = await response.json();
        const nextChain = resolveNetwork(data?.result?.clientInfo?.chain || data?.result?.chain);
        const nextSmartAccountEnabled = Boolean(data?.result?.clientInfo?.smartAccountEnabled);

        if (!isMounted) {
          return;
        }
        if (nextChain) {
          setChain(nextChain);
        }
        if (data?.result?.clientInfo?.smartAccountEnabled !== undefined) {
          setSmartAccountEnabled(nextSmartAccountEnabled);
        }
      } catch (error) {
        console.error('Failed to fetch client settings', error);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    const startPolling = () => {
      if (interval) {
        return;
      }
      interval = setInterval(fetchSettings, 60000);
    };

    const stopPolling = () => {
      if (!interval) {
        return;
      }
      clearInterval(interval);
      interval = null;
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchSettings();
        startPolling();
      } else {
        stopPolling();
      }
    };

    const handleSettingsUpdate = () => {
      fetchSettings();
    };

    handleVisibilityChange();
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('client-settings-updated', handleSettingsUpdate);

    return () => {
      isMounted = false;
      stopPolling();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('client-settings-updated', handleSettingsUpdate);
    };
  }, []);

  const value = useMemo(
    () => ({
      chain,
      smartAccountEnabled,
      loading,
    }),
    [chain, smartAccountEnabled, loading]
  );

  return <ClientSettingsContext.Provider value={value}>{children}</ClientSettingsContext.Provider>;
}

export function useClientSettings() {
  const context = useContext(ClientSettingsContext);
  if (!context) {
    return {
      chain: defaultChain,
      smartAccountEnabled: defaultSmartAccountEnabled,
      loading: true,
    };
  }
  return context;
}
