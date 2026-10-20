"use client";

import React, { Component, useEffect, useRef, useState, useMemo } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { useMrDogStore, worldToOutfit, MrDogOutfit } from "./store";
import { useStore as useAppStore } from "@/state/store";
import { resolveRig } from "./rig";
import { MrDogAnimator } from "./expressions";
import { addTickerRenderer, removeTickerRenderer } from "@/motion/clock";
import { frame } from "@/state/frame";
import { MrDogStills } from "./MrDogStills";

interface StageProps {
  size?: number; // CSS pixels, default 280
  isPeeking?: boolean;
}

class WebGLErrorBoundary extends Component<
  { fallback: React.ReactNode; children: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { fallback: React.ReactNode; children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(err: Error) {
    if (process.env.NODE_ENV !== "production") {
      console.warn("[MrDogStage3D] WebGL render error, falling back to 2D stills:", err);
    }
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

const OUTFIT_GLB_PATHS: Record<MrDogOutfit, string> = {
  home: "/models/mr-dog-party-coin.glb",
  redroom: "/models/mr-dog-coin-red-room.glb",
  diwali: "/models/mr-dog-coin-diwali.glb",
};

let sharedPmremTexture: THREE.Texture | null = null;
let sharedGl: THREE.WebGLRenderer | null = null;

function getSharedEnvironment(gl: THREE.WebGLRenderer): THREE.Texture {
  if (sharedPmremTexture && sharedGl === gl) {
    return sharedPmremTexture;
  }
  const pmremGenerator = new THREE.PMREMGenerator(gl);
  pmremGenerator.compileEquirectangularShader();
  const roomEnv = new RoomEnvironment();
  sharedPmremTexture = pmremGenerator.fromScene(roomEnv, 0.04).texture;
  sharedGl = gl;
  roomEnv.dispose();
  pmremGenerator.dispose();
  return sharedPmremTexture;
}

function DogModelInner({
  outfit,
  isPeeking,
  motionEnabled,
}: {
  outfit: MrDogOutfit;
  isPeeking: boolean;
  motionEnabled: boolean;
}) {
  const { gl, scene } = useThree();
  const gltf = useGLTF(OUTFIT_GLB_PATHS[outfit]);

  // Clone GLTF scene hierarchy to keep a fresh instance
  const dogScene = useMemo(() => gltf.scene.clone(true), [gltf.scene]);
  const rig = useMemo(() => resolveRig(dogScene), [dogScene]);
  const animatorRef = useRef<MrDogAnimator | null>(null);

  // Setup environment PMREM once and reuse
  useEffect(() => {
    scene.environment = getSharedEnvironment(gl);
  }, [gl, scene]);

  // Initialize Animator
  useEffect(() => {
    const anim = new MrDogAnimator(rig, outfit);
    animatorRef.current = anim;

    // Check first open of session for greet
    if (typeof window !== "undefined") {
      const greeted = sessionStorage.getItem("mrdog_greeted");
      if (!greeted) {
        sessionStorage.setItem("mrdog_greeted", "1");
        const store = useMrDogStore.getState();
        store.setExpression("greet");
        const t1 = setTimeout(() => store.setExpression("wink"), 1200);
        const t2 = setTimeout(() => store.setExpression("idle"), 1800);
        return () => {
          clearTimeout(t1);
          clearTimeout(t2);
        };
      }
    }
  }, [rig, outfit]);

  // Update loop called directly before gl render
  useEffect(() => {
    const updateAnim = () => {
      if (!animatorRef.current) return;
      const storeState = useMrDogStore.getState();
      animatorRef.current.update({
        dt: frame.dt,
        time: frame.time,
        expression: storeState.expression,
        outfit,
        jawTarget: storeState.jawTarget,
        pointer: frame.pointer.ndc,
        motionEnabled,
        isPeeking,
      });
    };

    // Register update callback to clock ticker
    addTickerRenderer(updateAnim);
    return () => {
      removeTickerRenderer(updateAnim);
    };
  }, [outfit, isPeeking, motionEnabled]);

  // Cleanup geometries on unmount
  useEffect(() => {
    return () => {
      dogScene.traverse((obj) => {
        if ((obj as THREE.Mesh).isMesh) {
          const mesh = obj as THREE.Mesh;
          mesh.geometry?.dispose();
        }
      });
    };
  }, [dogScene]);

  return <primitive object={dogScene} />;
}

export function MrDogStage3D({ size = 280, isPeeking = true }: StageProps) {
  const world = useAppStore((s) => s.world);
  const tier = useAppStore((s) => s.tier);
  const motionEnabled = useAppStore((s) => s.motionEnabled);
  const outfit = worldToOutfit(world);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);

  const isTierCapable = tier === "T2" || tier === "T3";
  const shouldRender3D = isTierCapable && motionEnabled;

  const accentColor =
    world === "redroom"
      ? "#FF1A35"
      : world === "diwali"
        ? "#E5B25D"
        : "#EA28C1";

  // If tier is low or motion is off, use the high-performance 2D stills
  if (!shouldRender3D) {
    return <MrDogStills size={size} />;
  }

  return (
    <WebGLErrorBoundary fallback={<MrDogStills size={size} />}>
      <div
        className="relative overflow-visible flex items-center justify-center select-none pointer-events-none"
        style={{ width: size, height: size }}
      >
        <Canvas
          ref={canvasRef}
          frameloop="never"
          dpr={typeof window !== "undefined" ? Math.min(window.devicePixelRatio, 1.75) : 1}
          gl={{
            powerPreference: "high-performance",
            antialias: true,
            alpha: true,
            toneMapping: THREE.AgXToneMapping,
            toneMappingExposure: 1.05,
          }}
          camera={{
            fov: 32,
            near: 0.1,
            far: 10,
            position: [0, 0, 2.25],
          }}
          onCreated={({ gl, advance }) => {
            rendererRef.current = gl;
            const tickerFn = (time: number) => {
              advance(time);
            };
            addTickerRenderer(tickerFn);

            // Cleanup ticker renderer and lose context cleanly on unmount
            return () => {
              removeTickerRenderer(tickerFn);
              try {
                gl.forceContextLoss();
                gl.dispose();
              } catch {
                // ignore
              }
            };
          }}
        >
          {/* Lights */}
          <directionalLight position={[-1.5, 2.5, 2]} intensity={1.8} color="#FFF5EB" />
          <ambientLight intensity={0.45} color="#E8EEF5" />
          {/* Rim light in world accent colour */}
          <directionalLight position={[0, 1.5, -2.5]} intensity={4.5} color={accentColor} />
          <pointLight position={[0, -0.4, -1.2]} intensity={2.2} color={accentColor} />

          <DogModelInner
            outfit={outfit}
            isPeeking={isPeeking}
            motionEnabled={motionEnabled}
          />
        </Canvas>
      </div>
    </WebGLErrorBoundary>
  );
}

// Preload the GLTF models in background
if (typeof window !== "undefined") {
  useGLTF.preload("/models/mr-dog-party-coin.glb");
  useGLTF.preload("/models/mr-dog-coin-red-room.glb");
  useGLTF.preload("/models/mr-dog-coin-diwali.glb");
}
