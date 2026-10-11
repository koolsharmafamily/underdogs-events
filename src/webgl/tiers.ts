/**
 * Quality tiering configuration & detection (BRIEF.md Part 5.5 & Part 12.4).
 *
 * T3: Desktop high (Tier 3) -> DPR [1, 2], full composer, MSAA 4x, Reflector floor
 * T2: Laptop / tablet (Tier 2) -> DPR [1, 1.5], full composer, bloom 0.75 res, SMAA
 * T1: Phone (Tier <= 1) -> DPR [1, 1.25], no composer (renderer AgX tone mapping), CSS grain, halo sprites
 * T0: No WebGL 2 / failure -> Fallback static posters
 */

export type QualityTier = 'T3' | 'T2' | 'T1' | 'T0';

export interface TierSettings {
  tier: QualityTier;
  dpr: [number, number];
  hasComposer: boolean;
  hasReflector: boolean;
  shadows: boolean;
  maxLights: number;
}

export const TIER_CONFIG: Record<QualityTier, TierSettings> = {
  T3: {
    tier: 'T3',
    dpr: [1, 2],
    hasComposer: true,
    hasReflector: true,
    shadows: true,
    maxLights: 4,
  },
  T2: {
    tier: 'T2',
    dpr: [1, 1.5],
    hasComposer: true,
    hasReflector: false,
    shadows: false,
    maxLights: 3,
  },
  T1: {
    tier: 'T1',
    dpr: [1, 1.25],
    hasComposer: false,
    hasReflector: false,
    shadows: false,
    maxLights: 2,
  },
  T0: {
    tier: 'T0',
    dpr: [1, 1],
    hasComposer: false,
    hasReflector: false,
    shadows: false,
    maxLights: 0,
  },
};

/**
 * Fast synchronous heuristic + async GPU detection fallback.
 */
export function getInitialTier(): QualityTier {
  if (typeof window === 'undefined') return 'T3';

  // Check WebGL 2 availability
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl2');
    if (!gl) return 'T0';
  } catch {
    return 'T0';
  }

  // Mobile viewport heuristic
  const isMobile = window.innerWidth < 768 || /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent);
  if (isMobile) return 'T1';

  return 'T3';
}
