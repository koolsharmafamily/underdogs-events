// PLACEHOLDER
// Protagonist badge placeholder per BRIEF.md Part 5.2
// Marked with // PLACEHOLDER and swaps automatically when badge GLBs are present.

'use client';

import React, { useRef, useMemo, useEffect } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { frame } from '@/state/frame';
import { useStore } from '@/state/store';

interface BadgePlaceholderProps {
  skin?: 'enamel' | 'neon' | 'jewelled';
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: number;
}

export function BadgePlaceholder({
  skin = 'enamel',
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = 1,
}: BadgePlaceholderProps) {
  const rootRef = useRef<THREE.Group>(null);
  const eyeLRef = useRef<THREE.Group>(null);
  const eyeRRef = useRef<THREE.Group>(null);
  const tongueRef = useRef<THREE.Group>(null);

  const world = useStore((s) => s.world);
  const activeSkin = skin || (world === 'home' ? 'enamel' : world === 'redroom' ? 'neon' : 'jewelled');

  // Materials tailored per world per BRIEF.md Part 5.2
  const materials = useMemo(() => {
    if (activeSkin === 'neon') {
      return {
        body: new THREE.MeshStandardMaterial({
          color: '#0A0505',
          roughness: 0.25,
          metalness: 0.1,
        }),
        ring: new THREE.MeshStandardMaterial({
          color: '#120203',
          roughness: 0.08,
          metalness: 0.2,
        }),
        face: new THREE.MeshStandardMaterial({
          color: '#050102',
          roughness: 0.05,
          metalness: 0.3,
        }),
        accent: new THREE.MeshStandardMaterial({
          color: '#3A0504',
          emissive: new THREE.Color('#FF2A1F'),
          emissiveIntensity: 3.5,
          roughness: 0.2,
        }),
        chrome: new THREE.MeshStandardMaterial({
          color: '#2A0404',
          metalness: 0.8,
          roughness: 0.2,
        }),
      };
    }

    if (activeSkin === 'jewelled') {
      return {
        body: new THREE.MeshStandardMaterial({
          color: '#E8C568',
          metalness: 0.9,
          roughness: 0.15,
        }),
        ring: new THREE.MeshStandardMaterial({
          color: '#D42A7C',
          roughness: 0.2,
          metalness: 0.4,
        }),
        face: new THREE.MeshStandardMaterial({
          color: '#280A18',
          roughness: 0.1,
          metalness: 0.3,
        }),
        accent: new THREE.MeshStandardMaterial({
          color: '#FFDF88',
          metalness: 0.95,
          roughness: 0.1,
        }),
        chrome: new THREE.MeshStandardMaterial({
          color: '#FFDF88',
          metalness: 0.9,
          roughness: 0.15,
        }),
      };
    }

    // Default: Enamel (Home)
    return {
      body: new THREE.MeshStandardMaterial({
        color: '#D9DCE3',
        metalness: 1.0,
        roughness: 0.12,
      }),
      ring: new THREE.MeshStandardMaterial({
        color: '#D73EBC',
        roughness: 0.18,
        metalness: 0.05,
      }),
      face: new THREE.MeshStandardMaterial({
        color: '#10171F',
        roughness: 0.12,
        metalness: 0.1,
      }),
      accent: new THREE.MeshStandardMaterial({
        color: '#FCF9FC',
        roughness: 0.3,
        metalness: 0.05,
      }),
      chrome: new THREE.MeshStandardMaterial({
        color: '#D9DCE3',
        metalness: 1.0,
        roughness: 0.12,
      }),
    };
  }, [activeSkin]);

  // Canvas texture with Underdogs text and circular details
  const logoTexture = useMemo(() => {
    if (typeof document === 'undefined') return null;
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    ctx.clearRect(0, 0, 1024, 1024);

    // Outer circle guide
    ctx.strokeStyle = activeSkin === 'neon' ? '#FF2A1F' : activeSkin === 'jewelled' ? '#FFDF88' : '#FCF9FC';
    ctx.lineWidth = 14;
    ctx.beginPath();
    ctx.arc(512, 512, 470, 0, Math.PI * 2);
    ctx.stroke();

    // Inner line
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.arc(512, 512, 380, 0, Math.PI * 2);
    ctx.stroke();

    // Text along circle
    ctx.font = 'bold 64px sans-serif';
    ctx.fillStyle = activeSkin === 'neon' ? '#FF2A1F' : activeSkin === 'jewelled' ? '#FFDF88' : '#FCF9FC';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Top arc text: UNDERDOGS
    ctx.save();
    ctx.translate(512, 512);
    const topText = 'UNDERDOGS';
    for (let i = 0; i < topText.length; i++) {
      const angle = -Math.PI / 2 + (i - (topText.length - 1) / 2) * 0.14;
      ctx.save();
      ctx.rotate(angle);
      ctx.translate(0, -425);
      ctx.fillText(topText[i], 0, 0);
      ctx.restore();
    }
    // Bottom arc text: UNDERDOGS
    const btmText = 'UNDERDOGS';
    for (let i = 0; i < btmText.length; i++) {
      const angle = Math.PI / 2 - (i - (btmText.length - 1) / 2) * 0.14;
      ctx.save();
      ctx.rotate(angle);
      ctx.translate(0, 425);
      ctx.fillText(btmText[i], 0, 0);
      ctx.restore();
    }
    ctx.restore();

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
  }, [activeSkin]);

  // Geometries per Part 5.2: diameter 1.0, thickness 0.12
  const bodyGeom = useMemo(() => new THREE.CylinderGeometry(0.5, 0.5, 0.12, 64), []);
  const ringGeom = useMemo(() => new THREE.TorusGeometry(0.44, 0.045, 32, 64), []);
  const faceGeom = useMemo(() => new THREE.CylinderGeometry(0.38, 0.38, 0.02, 64), []);

  // X eye cross geometry: two intersecting bars
  const eyeGeom = useMemo(() => {
    const geom1 = new THREE.BoxGeometry(0.09, 0.022, 0.015);
    const geom2 = new THREE.BoxGeometry(0.022, 0.09, 0.015);
    geom1.rotateZ(Math.PI / 4);
    geom2.rotateZ(Math.PI / 4);
    return { bar1: geom1, bar2: geom2 };
  }, []);

  // Tongue geometry: bar + U-tongue
  const tongueGeom = useMemo(() => {
    return new THREE.CylinderGeometry(0.035, 0.035, 0.06, 16);
  }, []);

  // Idle wag & blink animation on single clock frame
  useFrame((_, delta) => {
    if (!rootRef.current) return;

    const t = frame.time;

    // Subtle idle breathing at 0.18 Hz (Part 6.4)
    const breath = Math.sin(t * 1.13) * 0.015;
    rootRef.current.position.y = position[1] + breath;

    // Look-at pointer parallax (lambda = 6)
    const targetRotX = rotation[0] + frame.pointer.damped.y * 0.15;
    const targetRotY = rotation[1] + frame.pointer.damped.x * 0.22;
    rootRef.current.rotation.x = THREE.MathUtils.damp(rootRef.current.rotation.x, targetRotX, 6, delta);
    rootRef.current.rotation.y = THREE.MathUtils.damp(rootRef.current.rotation.y, targetRotY, 6, delta);

    // Blink: periodic 180ms scale squash on eyes (Part 5.2)
    const blinkCycle = t % 4.8;
    const isBlinking = blinkCycle > 4.62;
    const eyeScaleY = isBlinking ? 0.1 : 1.0;
    if (eyeLRef.current) eyeLRef.current.scale.y = eyeScaleY;
    if (eyeRRef.current) eyeRRef.current.scale.y = eyeScaleY;

    // Wag: subtle tongue swing (Part 5.2)
    if (tongueRef.current) {
      tongueRef.current.rotation.z = Math.sin(t * 3.2) * 0.18;
    }
  });

  return (
    <group
      ref={rootRef}
      name="Badge"
      position={position}
      rotation={rotation}
      scale={scale}
    >
      {/* Body: Disc and outer nickel edge */}
      <mesh
        name="Body"
        geometry={bodyGeom}
        material={materials.body}
        rotation={[Math.PI / 2, 0, 0]}
      />

      {/* Ring: Enamel/Glass band carrying the lettering */}
      <mesh
        name="Ring"
        geometry={ringGeom}
        material={materials.ring}
        position={[0, 0, 0.04]}
      />

      {/* Face disc with logo texture */}
      <mesh
        name="Face"
        geometry={faceGeom}
        rotation={[Math.PI / 2, 0, 0]}
        position={[0, 0, 0.05]}
      >
        <meshStandardMaterial
          {...materials.face}
          map={logoTexture ?? undefined}
        />
      </mesh>

      {/* Eye_L: Pivot at its own centre */}
      <group
        ref={eyeLRef}
        name="Eye_L"
        position={[-0.13, 0.06, 0.065]}
      >
        <mesh geometry={eyeGeom.bar1} material={materials.accent} />
        <mesh geometry={eyeGeom.bar2} material={materials.accent} />
      </group>

      {/* Eye_R: Pivot at its own centre */}
      <group
        ref={eyeRRef}
        name="Eye_R"
        position={[0.13, 0.06, 0.065]}
      >
        <mesh geometry={eyeGeom.bar1} material={materials.accent} />
        <mesh geometry={eyeGeom.bar2} material={materials.accent} />
      </group>

      {/* Tongue: Mouth bar + tongue, pivot at top centre */}
      <group
        ref={tongueRef}
        name="Tongue"
        position={[0, -0.06, 0.065]}
      >
        {/* Mouth bar */}
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[0.14, 0.02, 0.015]} />
          <meshStandardMaterial {...materials.accent} />
        </mesh>
        {/* U tongue */}
        <mesh
          position={[0, -0.035, 0]}
          geometry={tongueGeom}
          material={materials.accent}
        />
      </group>

      {/* Back face: Nickel back */}
      <mesh
        name="Back"
        position={[0, 0, -0.06]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <circleGeometry args={[0.49, 64]} />
        <meshStandardMaterial {...materials.chrome} />
      </mesh>
    </group>
  );
}
