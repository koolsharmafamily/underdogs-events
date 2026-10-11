'use client';

import React, { useEffect, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import * as THREE from 'three';
import { QualityProvider, useQuality } from './QualityProvider';
import { CameraRig } from './CameraRig';
import { WorldDirector } from './WorldDirector';
import { Precompile } from './Precompile';
import { DoorProjector } from './tracking/DoorProjector';
import { CardProjector } from './tracking/CardProjector';
import { PostFX } from './PostFX';
import { setWebglAdvance } from '@/motion/clock';

function CanvasInner() {
  const { settings, tier } = useQuality();
  const advanceRef = useRef<((time: number) => void) | null>(null);

  // Wire gl.advance into the unified clock ticker
  useEffect(() => {
    if (advanceRef.current) {
      setWebglAdvance((time) => {
        advanceRef.current?.(time);
      });
    }

    return () => {
      setWebglAdvance(() => {});
    };
  }, []);

  if (tier === 'T0') {
    return null;
  }

  return (
    <Canvas
      frameloop="never"
      dpr={settings.dpr}
      gl={{
        powerPreference: 'high-performance',
        antialias: settings.tier !== 'T1',
        alpha: true,
        outputColorSpace: THREE.SRGBColorSpace,
        toneMapping: settings.hasComposer ? THREE.NoToneMapping : THREE.AgXToneMapping,
      }}
      camera={{
        fov: 34,
        near: 0.1,
        far: 60,
        position: [-0.6, 1.5, 6.5],
      }}
      onCreated={({ advance }) => {
        advanceRef.current = advance;
        setWebglAdvance((time) => advance(time));
      }}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
      }}
    >
      <Precompile />
      <CameraRig />
      <WorldDirector />
      <DoorProjector />
      <CardProjector />
      <PostFX />
    </Canvas>
  );
}

export function Experience() {
  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden"
    >
      <QualityProvider>
        <CanvasInner />
      </QualityProvider>
    </div>
  );
}

export default Experience;
