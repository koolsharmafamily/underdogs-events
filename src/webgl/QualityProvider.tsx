'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { QualityTier, TierSettings, TIER_CONFIG, getInitialTier } from './tiers';
import { useStore } from '@/state/store';

interface QualityContextValue {
  tier: QualityTier;
  settings: TierSettings;
  setTier: (t: QualityTier) => void;
}

const QualityContext = createContext<QualityContextValue>({
  tier: 'T3',
  settings: TIER_CONFIG.T3,
  setTier: () => {},
});

export function QualityProvider({ children }: { children: React.ReactNode }) {
  const [tier, setTierState] = useState<QualityTier>(getInitialTier);
  const setStoreTier = useStore((s) => s.setTier);

  const setTier = (newTier: QualityTier) => {
    setTierState(newTier);
    setStoreTier(newTier);
  };

  useEffect(() => {
    // Dynamically detect tier with detect-gpu if available
    let active = true;
    import('detect-gpu')
      .then(async ({ getGPUTier }) => {
        try {
          const gpuTier = await getGPUTier();
          if (!active) return;
          if (gpuTier.tier === 0 || !gpuTier.isMobile && gpuTier.tier < 1) {
            setTier('T1');
          } else if (gpuTier.isMobile) {
            setTier(gpuTier.tier >= 3 ? 'T2' : 'T1');
          } else {
            setTier(gpuTier.tier >= 3 ? 'T3' : gpuTier.tier === 2 ? 'T2' : 'T1');
          }
        } catch {
          // Keep heuristic tier on error
        }
      })
      .catch(() => {
        // Keep heuristic tier on import failure
      });

    return () => {
      active = false;
    };
  }, []);

  return (
    <QualityContext.Provider value={{ tier, settings: TIER_CONFIG[tier], setTier }}>
      {children}
    </QualityContext.Provider>
  );
}

export function useQuality() {
  return useContext(QualityContext);
}
