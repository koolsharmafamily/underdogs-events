'use client';

import React from 'react';
import { EffectComposer, Bloom, Vignette, ToneMapping } from '@react-three/postprocessing';
import { ToneMappingMode } from 'postprocessing';
import { useQuality } from './QualityProvider';
import { useStore } from '@/state/store';

export function PostFX() {
  const { settings } = useQuality();
  const world = useStore((s) => s.world);

  // Skip composer on tier 1 and tier 0 per Part 5.5
  if (!settings.hasComposer) {
    return null;
  }

  // Tuned parameters per Part 5.4 table
  const bloomIntensity = world === 'redroom' ? 0.6 : world === 'diwali' ? 0.5 : 0.35;
  const bloomThreshold = world === 'redroom' ? 0.75 : world === 'diwali' ? 0.8 : 0.85;
  const vignetteDarkness = world === 'redroom' ? 0.65 : world === 'diwali' ? 0.35 : 0.45;

  return (
    <EffectComposer multisampling={settings.tier === 'T3' ? 4 : 0}>
      <Bloom
        intensity={bloomIntensity}
        luminanceThreshold={bloomThreshold}
        luminanceSmoothing={0.3}
        mipmapBlur
      />
      <Vignette
        eskil={false}
        offset={0.15}
        darkness={vignetteDarkness}
      />
      <ToneMapping mode={ToneMappingMode.AGX} />
    </EffectComposer>
  );
}
