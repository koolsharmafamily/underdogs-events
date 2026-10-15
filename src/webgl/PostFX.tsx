"use client";

import React, { useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import {
  EffectComposer,
  Bloom,
  ChromaticAberration,
  Vignette,
  ToneMapping,
  Noise,
} from "@react-three/postprocessing";
import {
  BlendFunction,
  ToneMappingMode,
  type BloomEffect,
  type NoiseEffect,
  type VignetteEffect,
} from "postprocessing";
import { acts } from "@/theme/acts";
import { useQuality } from "./QualityProvider";
import { frame } from "@/state/frame";
import { useStore } from "@/state/store";
import { rendersDirect } from "./pipeline";
import type { WorldId } from "@/theme/tokens";

const GRADE: Record<WorldId, { bloom: number; threshold: number; vignette: number }> = {
  home: { bloom: 0.22, threshold: 1.15, vignette: 0.45 },
  redroom: { bloom: 0.38, threshold: 1.05, vignette: 0.65 },
  diwali: { bloom: 0.22, threshold: 1.15, vignette: 0.45 },
};

/**
 * One composer for the whole visit. It stays mounted on every route and is only
 * switched off where the world draws direct (DHAMAAKA keeps a transparent canvas),
 * so its passes, targets and programs are built once. Per-world values go straight
 * to the effects: changing their props would rebuild them.
 */
export function PostFX() {
  const { settings } = useQuality();
  const world = useStore((s) => s.world);
  const bloom = useRef<BloomEffect>(null);
  const vignette = useRef<VignetteEffect>(null);
  const grain = useRef<NoiseEffect>(null);

  // Chromatic aberration offset (0 in steady state, up to 0.0015 during T1)
  const chromOffset = useMemo(() => new THREE.Vector2(0, 0), []);

  useFrame(() => {
    const ca = frame.transition.chromAb;
    chromOffset.set(ca, ca * 0.5);
  });

  useLayoutEffect(() => {
    const grade = GRADE[world];
    if (bloom.current) {
      bloom.current.intensity = grade.bloom;
      bloom.current.luminanceMaterial.threshold = grade.threshold;
    }
    if (vignette.current) vignette.current.darkness = grade.vignette;
    // Film grain lives here on composer tiers (FilmGrain draws it in CSS elsewhere).
    if (grain.current) grain.current.blendMode.opacity.value = acts[world].grainOpacity * 2;
  }, [world, settings.hasComposer]);

  if (!settings.hasComposer) return null;

  return (
    <EffectComposer
      multisampling={4}
      enabled={!rendersDirect(world, settings.hasComposer)}
    >
      <Bloom
        ref={bloom}
        intensity={GRADE.home.bloom}
        luminanceThreshold={GRADE.home.threshold}
        luminanceSmoothing={0.3}
        mipmapBlur
      />
      <ChromaticAberration
        offset={chromOffset}
        radialModulation={false}
        modulationOffset={0}
      />
      <Vignette
        ref={vignette}
        eskil={false}
        offset={0.15}
        darkness={GRADE.home.vignette}
      />
      <ToneMapping mode={ToneMappingMode.AGX} />
      <Noise ref={grain} premultiply blendFunction={BlendFunction.SOFT_LIGHT} opacity={0.08} />
    </EffectComposer>
  );
}
