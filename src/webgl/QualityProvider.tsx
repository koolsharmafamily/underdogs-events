'use client';

import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import {
  QualityTier,
  TierSettings,
  TIER_CONFIG,
  getInitialTier,
  isExplicitT0Requested,
} from './tiers';
import { useStore } from '@/state/store';

interface QualityContextValue {
  tier: QualityTier;
  settings: TierSettings;
  setTier: (t: QualityTier) => void;
  downgradeTier: () => void;
}

const QualityContext = createContext<QualityContextValue>({
  tier: 'T3',
  settings: TIER_CONFIG.T3,
  setTier: () => {},
  downgradeTier: () => {},
});

const TIER_RANK: Record<QualityTier, number> = {
  T0: 0,
  T1: 1,
  T2: 2,
  T3: 3,
};

export function QualityProvider({ children }: { children: React.ReactNode }) {
  const [tier, setTierState] = useState<QualityTier>(getInitialTier);
  const setStoreTier = useStore((s) => s.setTier);
  const lockedCapRef = useRef<QualityTier | null>(null);

  const setTier = useCallback(
    (newTier: QualityTier) => {
      if (isExplicitT0Requested() && newTier !== 'T0') {
        return;
      }
      // Enforce monotonic ceiling once adaptive degradation has stepped down (Part 16)
      if (lockedCapRef.current && TIER_RANK[newTier] > TIER_RANK[lockedCapRef.current]) {
        return;
      }
      setTierState(newTier);
      setStoreTier(newTier);
    },
    [setStoreTier]
  );

  // Monotonic one-way adaptive degradation (Part 5.5 & Part 16: never oscillates)
  const downgradeTier = useCallback(() => {
    setTierState((prev) => {
      const next: QualityTier =
        prev === 'T3' ? 'T2' : prev === 'T2' ? 'T1' : prev;
      if (next !== prev) {
        lockedCapRef.current = next;
        setStoreTier(next);
      }
      return next;
    });
  }, [setStoreTier]);

  useEffect(() => {
    const initial = getInitialTier();
    setTierState(initial);
    setStoreTier(initial);

    if (initial === 'T0' || isExplicitT0Requested()) {
      lockedCapRef.current = 'T0';
      return;
    }

    // Dynamically detect tier with detect-gpu if available
    let active = true;
    import('detect-gpu')
      .then(async ({ getGPUTier }) => {
        try {
          const gpuTier = await getGPUTier();
          if (!active || isExplicitT0Requested()) return;
          if (gpuTier.tier === 0 || (!gpuTier.isMobile && gpuTier.tier < 1)) {
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
  }, [setStoreTier, setTier]);

  return (
    <QualityContext.Provider
      value={{ tier, settings: TIER_CONFIG[tier], setTier, downgradeTier }}
    >
      {children}
    </QualityContext.Provider>
  );
}

export function useQuality() {
  return useContext(QualityContext);
}
