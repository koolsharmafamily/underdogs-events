'use client';

import React, { useMemo } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import {
  EffectComposer,
  Bloom,
  ChromaticAberration,
  Vignette,
  ToneMapping,
} from '@react-three/postprocessing';
import { ToneMappingMode } from 'postprocessing';
import { useQuality } from './QualityProvider';
import { frame } from '@/state/frame';
import { useStore } from '@/state/store';

export function PostFX() {
  const { settings } = useQuality();
  const world = useStore((s) => s.world);

  // Persistent chromatic aberration vector updated in useFrame (0 in steady state, up to 0.0015 during T1)
  const chromOffset = useMemo(() => new THREE.Vector2(0, 0), []);

  useFrame(() => {
    const ca = frame.transition.chromAb;
    chromOffset.set(ca, ca * 0.5);
  });

  // Skip composer on tier 1 and tier 0 per Part 5.5
  if (!settings.hasComposer) {
    return null;
  }

  // Tuned parameters per Part 5.4 table
  const bloomIntensity = world === 'redroom' ? 0.6 : world === 'diwali' ? 0.5 : 0.35;
  const bloomThreshold = world === 'redroom' ? 0.75 : world === 'diwali' ? 0.8 : 0.85;
  const vignetteDarkness = world === 'redroom' ? 0.65 : world === 'diwali' ? 0.35 : 0.45;

  return (
    <EffectComposer multisampling={0}>
      <Bloom
        intensity={bloomIntensity}
        luminanceThreshold={bloomThreshold}
        luminanceSmoothing={0.3}
        mipmapBlur
      />
      <ChromaticAberration
        offset={chromOffset}
        radialModulation={false}
        modulationOffset={0}
      />
      <Vignette
        eskil={false}
        offset={0.15}
        darkness={vignetteDarkness}
      />
      <ToneMapping mode={ToneMappingMode.NEUTRAL} />
    </EffectComposer>
  );
}
