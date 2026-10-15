"use client";

import React, { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import {
  EffectComposer,
  Bloom,
  ChromaticAberration,
  Vignette,
  ToneMapping,
  DepthOfField,
} from "@react-three/postprocessing";
import { ToneMappingMode, DepthOfFieldEffect } from "postprocessing";
import { useQuality } from "./QualityProvider";
import { composition } from "./composition";
import { frame } from "@/state/frame";
import { useStore } from "@/state/store";

export function PostFX() {
  const { settings } = useQuality();
  const { size } = useThree();
  const dof = useRef<DepthOfFieldEffect>(null);
  const world = useStore((s) => s.world);

  // Persistent chromatic aberration vector updated in useFrame (0 in steady state, up to 0.0015 during T1)
  const chromOffset = useMemo(() => new THREE.Vector2(0, 0), []);

  useFrame(() => {
    if (dof.current) {
      dof.current.bokehScale = 0;
      dof.current.circleOfConfusionMaterial.worldFocusDistance =
        composition.focusDistance;
    }
    const ca = frame.transition.chromAb;
    chromOffset.set(ca, ca * 0.5);
  });

  // Skip composer on tier 1 and tier 0 per Part 5.5, and on diwali for pure alpha transparency
  if (!settings.hasComposer || world === "diwali") {
    return null;
  }

  // Tuned parameters for balanced, authentic bloom
  const bloomIntensity = world === "redroom" ? 0.38 : 0.22;
  const bloomThreshold = world === "redroom" ? 1.05 : 1.15;
  const luminanceSmoothing = 0.3;
  const vignetteDarkness = world === "redroom" ? 0.65 : 0.45;

  return (
    <EffectComposer multisampling={4}>
      <Bloom
        intensity={bloomIntensity}
        luminanceThreshold={bloomThreshold}
        luminanceSmoothing={luminanceSmoothing}
        mipmapBlur
      />
      <ChromaticAberration
        offset={chromOffset}
        radialModulation={false}
        modulationOffset={0}
      />
      <Vignette eskil={false} offset={0.15} darkness={vignetteDarkness} />
      <ToneMapping mode={ToneMappingMode.AGX} />
    </EffectComposer>
  );
}
