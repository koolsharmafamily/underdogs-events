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

  // Skip composer on tier 1 and tier 0 per Part 5.5
  if (!settings.hasComposer) {
    return null;
  }

  // Tuned parameters for vibrant bloom
  const bloomIntensity =
    world === "redroom" ? 1.45 : world === "diwali" ? 0.32 : 0.25;
  const bloomThreshold =
    world === "redroom" ? 0.28 : 1.15;
  const luminanceSmoothing =
    world === "redroom" ? 0.65 : 0.3;
  const vignetteDarkness =
    world === "redroom" ? 0.65 : world === "diwali" ? 0.35 : 0.45;

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
