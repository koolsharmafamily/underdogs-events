"use client";

import React, { Component, useEffect, useLayoutEffect, useRef, useState } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { PerformanceMonitor } from "@react-three/drei";
import * as THREE from "three";
import { QualityProvider, useQuality } from "./QualityProvider";
import { CameraRig } from "./CameraRig";
import { WorldDirector } from "./WorldDirector";
import { DoorProjector } from "./tracking/DoorProjector";
import { CardProjector } from "./tracking/CardProjector";
import { PostFX } from "./PostFX";
import { FallbackPoster } from "./FallbackPoster";
import { setWebglAdvance } from "@/motion/clock";
import { useStore } from "@/state/store";
import { useMrDogStore } from "@/features/mrdog/store";
import { rendersDirect } from "./pipeline";

function RendererGrade() {
  const { gl } = useThree();
  const { settings } = useQuality();
  const world = useStore((s) => s.world);
  // Layout effect: the output path must switch in the same commit as PostFX's
  // composer, before the next frame, or that frame compiles a stray variant.
  useLayoutEffect(() => {
    // Canvas constructor options are not reapplied when adaptive quality drops.
    // Keep the non-composer path on AgX as well as the postprocessed path.
    gl.toneMapping = rendersDirect(world, settings.hasComposer)
      ? THREE.AgXToneMapping
      : THREE.NoToneMapping;
    gl.toneMappingExposure =
      world === "redroom" ? 0.82 : world === "diwali" ? 1.05 : 1;
    if (world === "diwali") {
      gl.setClearColor(0x000000, 0);
    } else {
      gl.setClearColor(0x07070b, 1);
    }
  }, [gl, settings.hasComposer, world]);
  return null;
}

interface ErrorBoundaryProps {
  onError: () => void;
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

class AssetErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
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
  const sceneRoute = useStore((s) => s.sceneRoute);
  const advanceRef = useRef<((time: number) => void) | null>(null);
  const cleanupContextListenersRef = useRef<(() => void) | null>(null);
  const lossCountRef = useRef(0);
  const [contextLost, setContextLost] = useState(false);
  const [assetFailed, setAssetFailed] = useState(false);

  // Support asset failure events & query param for deterministic resilience testing (Part 13.8)
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      if (params.get("assetError") === "1") {
        setAssetFailed(true);
      }
    } catch {
      // Ignore URL parsing errors
    }

    const onAssetError = () => {
      setAssetFailed(true);
      setWebglAdvance(() => {});
    };

    window.addEventListener("underdogs:asset-error", onAssetError);
    return () => {
      window.removeEventListener("underdogs:asset-error", onAssetError);
    };
  }, []);

  // Wire gl.advance into the unified clock ticker
  useEffect(() => {
    if (advanceRef.current && !contextLost && !assetFailed && tier !== "T0") {
      setWebglAdvance((time) => {
        if (
          useMrDogStore.getState().chatCovering ||
          document.documentElement.dataset.lightbox === "open"
        )
          return;
        // Events and the 404 have no world: draw nothing behind them.
        if (useStore.getState().sceneRoute) advanceRef.current?.(time);
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

  if (tier === "T0" || assetFailed) {
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
            powerPreference: "high-performance",
            antialias: true,
            alpha: true,
            outputColorSpace: THREE.SRGBColorSpace,
            toneMapping: settings.hasComposer
              ? THREE.NoToneMapping
              : THREE.AgXToneMapping,
          }}
          camera={{
            fov: 34,
            near: 0.1,
            far: 60,
            position: [-0.6, 1.5, 6.5],
          }}
          onCreated={({ gl, advance }) => {
            advanceRef.current = advance;
            setWebglAdvance((time) => {
              if (
                useMrDogStore.getState().chatCovering ||
                document.documentElement.dataset.lightbox === "open"
              )
                return;
              if (useStore.getState().sceneRoute) advance(time);
            });
            (
              window as unknown as { __threeRenderer?: THREE.WebGLRenderer }
            ).__threeRenderer = gl;

            const domEl = gl.domElement;
            const glCtx = gl.getContext();
            const loseExt = glCtx?.getExtension("WEBGL_lose_context") ?? null;

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
                setTier("T0");
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
                  setWebglAdvance((time) => {
                    if (useStore.getState().sceneRoute) advanceRef.current?.(time);
                  });
                }
              }
            };

            domEl.addEventListener("webglcontextlost", onContextLost, false);
            domEl.addEventListener(
              "webglcontextrestored",
              onContextRestored,
              false,
            );

            cleanupContextListenersRef.current = () => {
              domEl.removeEventListener("webglcontextlost", onContextLost);
              domEl.removeEventListener(
                "webglcontextrestored",
                onContextRestored,
              );
            };
          }}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            pointerEvents: "none",
            opacity: contextLost ? 0 : 1,
            visibility: sceneRoute ? "visible" : "hidden",
            transition: "opacity 250ms ease-out",
          }}
        >
          {/* Adaptive degradation (Part 5.5, Part 13.1 & Part 16): steps down on sustained low FPS, never oscillates */}
          <PerformanceMonitor
            flipflops={1}
            onDecline={() => {
              const s = useStore.getState();
              // Freeze tier changes during transitions or before loader completes
              if (s.isTransitioning || s.phase !== "complete") return;
              downgradeTier();
            }}
          />
          <RendererGrade />
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
  const homeReady = useStore(s => s.renderedWorlds.home);
  const tier = useStore(s => s.tier);
  const world = useStore((s) => s.world);
  return (
    <div
      aria-hidden="true"
      style={{opacity:world === "home" && !homeReady && tier !== "T0" ? 0 : 1, transition:"opacity 240ms ease-out"}}
      className={`fixed inset-0 pointer-events-none overflow-hidden ${
        world === "diwali" ? "z-[3]" : "z-0"
      }`}
    >
      <QualityProvider>
        <CanvasInner />
      </QualityProvider>
    </div>
  );
}

export default Experience;
