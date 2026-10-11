/**
 * Quality tiering configuration & detection (BRIEF.md Part 5.5, Part 12.1 & Part 12.4).
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
    dpr: [1, 1.5],
    hasComposer: true,
    hasReflector: true,
    shadows: true,
    maxLights: 4,
  },
  T2: {
    tier: 'T2',
    dpr: [1, 1.25],
    hasComposer: true,
    hasReflector: false,
    shadows: false,
    maxLights: 3,
  },
  T1: {
    tier: 'T1',
    dpr: [1, 1.0],
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

export function isExplicitT0Requested(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const w = window as unknown as { __FORCE_T0?: boolean };
    if (w.__FORCE_T0) return true;
    const params = new URLSearchParams(window.location.search);
    const tierParam = params.get('tier')?.toUpperCase();
    const webglParam = params.get('webgl');
    return tierParam === 'T0' || webglParam === '0' || webglParam === 'false';
  } catch {
    return false;
  }
}

/**
 * Fast synchronous heuristic + async GPU detection fallback.
 * Per Part 12.1: Never infer quality from screen width alone.
 */
export function getInitialTier(): QualityTier {
  if (typeof window === 'undefined') return 'T3';

  if (isExplicitT0Requested()) return 'T0';

  // Check WebGL 2 availability
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl2');
    if (!gl) return 'T0';
  } catch {
    return 'T0';
  }

  // Device / pointer heuristic (never screen width alone per Part 12.1)
  const isMobileGPU =
    /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent) ||
    window.matchMedia('(pointer: coarse)').matches;
  if (isMobileGPU) return 'T1';

  return 'T3';
}
