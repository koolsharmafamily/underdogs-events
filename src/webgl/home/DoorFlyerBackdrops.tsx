"use client";

import React, { useRef, useMemo, useEffect } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import { frame } from "@/state/frame";
import { useStore } from "@/state/store";

// Custom shader for ghosted flyer backdrop behind each 3D door
const FlyerShader = {
  vertexShader: /* glsl */ `
    varying vec2 vUv;
    varying vec3 vWorldPosition;
    void main() {
      vUv = uv;
      vec4 worldPos = modelMatrix * vec4(position, 1.0);
      vWorldPosition = worldPos.xyz;
      gl_Position = projectionMatrix * viewMatrix * worldPos;
    }
  `,
  fragmentShader: /* glsl */ `
    uniform sampler2D uTexture;
    uniform float uOpacity;
    uniform vec3 uWorldTint;
    uniform float uTintMix;
    uniform float uDesat;
    uniform float uLodBias;
    uniform float uTime;
    varying vec2 vUv;
    varying vec3 vWorldPosition;

    // Pseudo-random noise for atmospheric grain matching the scene
    float filmGrain(vec2 uv, float t) {
      return fract(sin(dot(uv + t * 0.05, vec2(12.9898, 78.233))) * 43758.5453);
    }

    void main() {
      // 1. Sample texture with LOD bias for soft out-of-focus background look
      vec4 texColor = texture2D(uTexture, vUv, uLodBias);

      // 2. Desaturate slightly
      float luma = dot(texColor.rgb, vec3(0.299, 0.587, 0.114));
      vec3 desatColor = mix(texColor.rgb, vec3(luma), uDesat);

      // 3. Tint color toward world palette
      vec3 tintedColor = mix(desatColor, desatColor * uWorldTint * 1.6, uTintMix);

      // 4. Arch-shaped soft mask matching the door's arch silhouette
      // Map u from [0, 1] to [-1, 1], v from [0, 1]
      float nx = (vUv.x - 0.5) * 2.0;
      float ny = vUv.y;

      // Arch silhouette: vertical sides from y = 0 to y = 0.62, semicircular arch from y = 0.62 to y = 1.0
      float archDist = 0.0;
      float splitY = 0.62;
      if (ny <= splitY) {
        // Lower rectangular body
        archDist = abs(nx);
      } else {
        // Upper rounded dome
        float dy = (ny - splitY) / (1.0 - splitY);
        archDist = sqrt(nx * nx + dy * dy);
      }

      // Feathered soft edge (15-20% feather)
      float archMask = smoothstep(1.0, 0.82, archDist);

      // 5. Vertical linear fade to transparent at bottom so it melts into floor haze
      float bottomFade = smoothstep(0.01, 0.24, vUv.y);

      // 6. Subtle film grain to sit in the same atmosphere
      float grain = (filmGrain(vUv, uTime) - 0.5) * 0.04;
      vec3 finalRgb = clamp(tintedColor + grain, 0.0, 1.0);

      float finalAlpha = texColor.a * archMask * bottomFade * uOpacity;

      gl_FragColor = vec4(finalRgb, finalAlpha);
    }
  `,
};

interface DoorFlyerBackdropsProps {
  redDoorRef: React.RefObject<THREE.Group | null>;
  diwaliDoorRef: React.RefObject<THREE.Group | null>;
}

export function DoorFlyerBackdrops({
  redDoorRef,
  diwaliDoorRef,
}: DoorFlyerBackdropsProps) {
  const { size, gl } = useThree();
  const motionEnabled = useStore((s) => s.motionEnabled);
  const hoverDoor = useStore((s) => s.hoverDoor);
  const world = useStore((s) => s.world);

  // Load optimized <= 1024px tall WebP textures
  const [redTex, diwaliTex] = useTexture([
    "/media/red-room-poster-1024.webp",
    "/media/dhamaaka-flyer-1024.webp",
  ]);

  useEffect(() => {
    redTex.generateMipmaps = true;
    redTex.minFilter = THREE.LinearMipmapLinearFilter;
    redTex.magFilter = THREE.LinearFilter;
    try {
      gl.initTexture(redTex);
    } catch {}

    diwaliTex.generateMipmaps = true;
    diwaliTex.minFilter = THREE.LinearMipmapLinearFilter;
    diwaliTex.magFilter = THREE.LinearFilter;
    try {
      gl.initTexture(diwaliTex);
    } catch {}
  }, [redTex, diwaliTex, gl]);

  // Uniform colors
  const redTint = useMemo(() => new THREE.Color("#4A0706"), []); // Ember red
  const diwaliTint = useMemo(() => new THREE.Color("#E0217A"), []); // Rani pink & gold

  // Create ShaderMaterials with depthWrite = false, transparent = true, renderOrder = 0
  const redMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      vertexShader: FlyerShader.vertexShader,
      fragmentShader: FlyerShader.fragmentShader,
      uniforms: {
        uTexture: { value: redTex },
        uOpacity: { value: 0 },
        uWorldTint: { value: redTint },
        uTintMix: { value: 0.45 },
        uDesat: { value: 0.25 },
        uLodBias: { value: 2.2 },
        uTime: { value: 0 },
      },
      transparent: true,
      depthWrite: false,
      depthTest: true,
    });
  }, [redTex, redTint]);

  const diwaliMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      vertexShader: FlyerShader.vertexShader,
      fragmentShader: FlyerShader.fragmentShader,
      uniforms: {
        uTexture: { value: diwaliTex },
        uOpacity: { value: 0 },
        uWorldTint: { value: diwaliTint },
        uTintMix: { value: 0.45 },
        uDesat: { value: 0.25 },
        uLodBias: { value: 2.2 },
        uTime: { value: 0 },
      },
      transparent: true,
      depthWrite: false,
      depthTest: true,
    });
  }, [diwaliTex, diwaliTint]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      redMaterial.dispose();
      diwaliMaterial.dispose();
    };
  }, [redMaterial, diwaliMaterial]);

  // Geometry dimensions:
  // Base door visual height is ~2.4m in world space.
  // Flyer height is ~1.25x door height: 2.4 * 1.25 = 3.0m.
  // Grounded at base (origin shifted so y=0 is at bottom).
  const redAspect = 946 / 1226; // 0.7716
  const diwaliAspect = 1350 / 1688; // 0.7998
  const baseFlyerHeight = 3.0;

  const redGeom = useMemo(() => {
    const geom = new THREE.PlaneGeometry(baseFlyerHeight * redAspect, baseFlyerHeight);
    geom.translate(0, baseFlyerHeight / 2, 0); // Ground at y = 0
    return geom;
  }, [redAspect]);

  const diwaliGeom = useMemo(() => {
    const geom = new THREE.PlaneGeometry(baseFlyerHeight * diwaliAspect, baseFlyerHeight);
    geom.translate(0, baseFlyerHeight / 2, 0); // Ground at y = 0
    return geom;
  }, [diwaliAspect]);

  useEffect(() => {
    return () => {
      redGeom.dispose();
      diwaliGeom.dispose();
    };
  }, [redGeom, diwaliGeom]);

  const redMeshRef = useRef<THREE.Mesh>(null);
  const diwaliMeshRef = useRef<THREE.Mesh>(null);

  // Animation values
  const currentRedOpacity = useRef(0);
  const currentDiwaliOpacity = useRef(0);
  const currentRedLod = useRef(2.2);
  const currentDiwaliLod = useRef(2.2);

  useFrame((_, delta) => {
    if (world !== "home") return;
    const dt = Math.min(delta, 1 / 30);
    const isPortrait = size.width < size.height;
    const redDoor = redDoorRef.current;
    const diwaliDoor = diwaliDoorRef.current;
    const doorsActive = (redDoor?.visible || diwaliDoor?.visible) ?? false;

    // WebGL backdrops only render on desktop / landscape (mobile uses pure CSS layers)
    const shouldRender = doorsActive && !isPortrait;

    if (redMeshRef.current) redMeshRef.current.visible = shouldRender;
    if (diwaliMeshRef.current) diwaliMeshRef.current.visible = shouldRender;

    if (!shouldRender || !redDoor || !diwaliDoor) return;

    // Fades from 0 to resting opacity (0.14) as doors rise into view
    const p5 = frame.dampedProgress["H5"] ?? 0;
    const riseFade = THREE.MathUtils.smoothstep(p5, 0.04, 0.35);

    // Resting opacity = 0.14. Active hover = 0.32, inactive hover = 0.06.
    let targetRedOpacity = 0.14 * riseFade;
    let targetDiwaliOpacity = 0.14 * riseFade;
    let targetRedLod = 2.2;
    let targetDiwaliLod = 2.2;

    if (hoverDoor === "redroom") {
      targetRedOpacity = 0.32 * riseFade;
      targetRedLod = 1.0; // Sharpens slightly
      targetDiwaliOpacity = 0.06 * riseFade;
      targetDiwaliLod = 2.6;
    } else if (hoverDoor === "diwali") {
      targetRedOpacity = 0.06 * riseFade;
      targetRedLod = 2.6;
      targetDiwaliOpacity = 0.32 * riseFade;
      targetDiwaliLod = 1.0; // Sharpens slightly
    }

    if (!motionEnabled) {
      currentRedOpacity.current = targetRedOpacity;
      currentDiwaliOpacity.current = targetDiwaliOpacity;
      currentRedLod.current = targetRedLod;
      currentDiwaliLod.current = targetDiwaliLod;
    } else {
      currentRedOpacity.current = THREE.MathUtils.damp(
        currentRedOpacity.current,
        targetRedOpacity,
        8,
        dt,
      );
      currentDiwaliOpacity.current = THREE.MathUtils.damp(
        currentDiwaliOpacity.current,
        targetDiwaliOpacity,
        8,
        dt,
      );
      currentRedLod.current = THREE.MathUtils.damp(
        currentRedLod.current,
        targetRedLod,
        6,
        dt,
      );
      currentDiwaliLod.current = THREE.MathUtils.damp(
        currentDiwaliLod.current,
        targetDiwaliLod,
        6,
        dt,
      );
    }

    // Parallax: ~30% of door parallax
    const px = motionEnabled ? frame.pointer.damped.x * 0.04 : 0;
    const py = motionEnabled ? frame.pointer.damped.y * 0.02 : 0;

    // Update Red Room Flyer Mesh
    if (redMeshRef.current) {
      // Centered on red door, 0.6m behind (z = -0.6)
      redMeshRef.current.position.set(
        redDoor.position.x + px,
        redDoor.position.y + py,
        redDoor.position.z - 0.6,
      );
      redMeshRef.current.scale.set(
        redDoor.scale.x,
        redDoor.scale.y,
        redDoor.scale.z,
      );
      redMaterial.uniforms.uOpacity.value = currentRedOpacity.current;
      redMaterial.uniforms.uLodBias.value = currentRedLod.current;
      redMaterial.uniforms.uTime.value = frame.time;
    }

    // Update Diwali Flyer Mesh
    if (diwaliMeshRef.current) {
      // Centered on diwali door, 0.6m behind (z = -0.6)
      diwaliMeshRef.current.position.set(
        diwaliDoor.position.x + px,
        diwaliDoor.position.y + py,
        diwaliDoor.position.z - 0.6,
      );
      diwaliMeshRef.current.scale.set(
        diwaliDoor.scale.x,
        diwaliDoor.scale.y,
        diwaliDoor.scale.z,
      );
      diwaliMaterial.uniforms.uOpacity.value = currentDiwaliOpacity.current;
      diwaliMaterial.uniforms.uLodBias.value = currentDiwaliLod.current;
      diwaliMaterial.uniforms.uTime.value = frame.time;
    }
  });

  return (
    <group name="DoorFlyerBackdrops" renderOrder={0}>
      <mesh
        ref={redMeshRef}
        geometry={redGeom}
        material={redMaterial}
        visible={false}
      />
      <mesh
        ref={diwaliMeshRef}
        geometry={diwaliGeom}
        material={diwaliMaterial}
        visible={false}
      />
    </group>
  );
}
