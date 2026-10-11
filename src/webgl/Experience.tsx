'use client';

import React, { Component, useEffect, useRef, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { PerformanceMonitor } from '@react-three/drei';
import * as THREE from 'three';
import { QualityProvider, useQuality } from './QualityProvider';
import { CameraRig } from './CameraRig';
import { WorldDirector } from './WorldDirector';
import { Precompile } from './Precompile';
import { DoorProjector } from './tracking/DoorProjector';
import { CardProjector } from './tracking/CardProjector';
import { PostFX } from './PostFX';
import { FallbackPoster } from './FallbackPoster';
import { setWebglAdvance } from '@/motion/clock';

interface ErrorBoundaryProps {
  onError: () => void;
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

class AssetErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch() {
    this.props.onError();
  }

  render() {
    if (this.state.hasError) {
      return null;
    }
    return this.props.children;
  }
}

function CanvasInner() {
  const { settings, tier, setTier, downgradeTier } = useQuality();
  const advanceRef = useRef<((time: number) => void) | null>(null);
  const cleanupContextListenersRef = useRef<(() => void) | null>(null);
  const lossCountRef = useRef(0);
  const [contextLost, setContextLost] = useState(false);
  const [assetFailed, setAssetFailed] = useState(false);

  // Support asset failure events & query param for deterministic resilience testing (Part 13.8)
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      if (params.get('assetError') === '1') {
        setAssetFailed(true);
      }
    } catch {
      // Ignore URL parsing errors
    }

    const onAssetError = () => {
      setAssetFailed(true);
      setWebglAdvance(() => {});
    };

    window.addEventListener('underdogs:asset-error', onAssetError);
    return () => {
      window.removeEventListener('underdogs:asset-error', onAssetError);
    };
  }, []);

  // Wire gl.advance into the unified clock ticker
  useEffect(() => {
    if (advanceRef.current && !contextLost && !assetFailed && tier !== 'T0') {
      setWebglAdvance((time) => {
        advanceRef.current?.(time);
      });
    }

    return () => {
      setWebglAdvance(() => {});
    };
  }, [contextLost, assetFailed, tier]);

  useEffect(() => {
    return () => {
      cleanupContextListenersRef.current?.();
    };
  }, []);

  if (tier === 'T0' || assetFailed) {
    return <FallbackPoster showAssetNotice={assetFailed} />;
  }

  return (
    <>
      {contextLost && <FallbackPoster showAssetNotice={false} />}
      <AssetErrorBoundary
        onError={() => {
          setAssetFailed(true);
          setWebglAdvance(() => {});
        }}
      >
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
          onCreated={({ gl, advance }) => {
            advanceRef.current = advance;
            setWebglAdvance((time) => advance(time));

            const domEl = gl.domElement;
            const glCtx = gl.getContext();
            const loseExt = glCtx?.getExtension('WEBGL_lose_context') ?? null;

            // Expose helper on window for QA testing of Part 13.8 context-loss recovery
            (
              window as unknown as {
                __webglLoseContext?: () => void;
                __webglRestoreContext?: () => void;
              }
            ).__webglLoseContext = () => loseExt?.loseContext();
            (
              window as unknown as {
                __webglRestoreContext?: () => void;
              }
            ).__webglRestoreContext = () => loseExt?.restoreContext();

            const onContextLost = (e: Event) => {
              e.preventDefault();
              lossCountRef.current += 1;
              setWebglAdvance(() => {});

              // Part 13.8: On a second loss, drop to T0 permanently
              if (lossCountRef.current >= 2) {
                setContextLost(false);
                setTier('T0');
                return;
              }

              // First loss: pause, show the poster and try one restore
              setContextLost(true);
              window.setTimeout(() => {
                try {
                  loseExt?.restoreContext();
                } catch {
                  // Browser may restore automatically
                }
              }, 450);
            };

            const onContextRestored = () => {
              if (lossCountRef.current < 2) {
                setContextLost(false);
                if (advanceRef.current) {
                  setWebglAdvance((time) => advanceRef.current?.(time));
                }
              }
            };

            domEl.addEventListener('webglcontextlost', onContextLost, false);
            domEl.addEventListener('webglcontextrestored', onContextRestored, false);

            cleanupContextListenersRef.current = () => {
              domEl.removeEventListener('webglcontextlost', onContextLost);
              domEl.removeEventListener('webglcontextrestored', onContextRestored);
            };
          }}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            pointerEvents: 'none',
            opacity: contextLost ? 0 : 1,
            transition: 'opacity 250ms ease-out',
          }}
        >
          {/* Adaptive degradation (Part 5.5, Part 13.1 & Part 16): steps down on sustained low FPS, never oscillates */}
          <PerformanceMonitor
            flipflops={1}
            onDecline={() => {
              downgradeTier();
            }}
          />
          <Precompile />
          <CameraRig />
          <WorldDirector />
          <DoorProjector />
          <CardProjector />
          <PostFX />
        </Canvas>
      </AssetErrorBoundary>
    </>
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
