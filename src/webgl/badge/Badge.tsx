'use client';

import React, { useRef, useMemo, useEffect, useState } from 'react';
import * as THREE from 'three';
import { useFrame, useThree } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import { frame } from '@/state/frame';
import { useStore } from '@/state/store';
import { SkinId, createSkinMaterials, BadgeSkinMaterials } from './skins';
import { DissolveUniforms } from './dissolve.glsl';
import { BadgeBehaviours } from './behaviours';
import { SparkleGlints } from './SparkleGlints';

// Preload all 3 badge models (Part 5.2, Part 12.4)
useGLTF.preload('/models/badge-enamel.glb');
useGLTF.preload('/models/badge-neon.glb');
useGLTF.preload('/models/badge-jewelled.glb');

interface BadgeProps {
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: number;
}

function applySkinToHierarchy(
  root: THREE.Object3D,
  skinId: SkinId,
  mats: BadgeSkinMaterials,
  backTexture: THREE.CanvasTexture | null
) {
  root.traverse((child) => {
    if ((child as THREE.Mesh).isMesh) {
      const mesh = child as THREE.Mesh;
      mesh.castShadow = false;
      mesh.receiveShadow = false;
      const name = mesh.name;

      if (name === 'Body') {
        mesh.material = mats.body;
      } else if (name === 'Ring') {
        mesh.material = mats.ring;
      } else if (name === 'Face') {
        mesh.material = mats.face;
      } else if (name === 'Back') {
        if (backTexture && mats.back.map !== backTexture) {
          mats.back.map = backTexture;
          mats.back.bumpMap = backTexture;
          mats.back.bumpScale = 0.04;
          mats.back.needsUpdate = true;
        }
        mesh.material = mats.back;
      } else if (name === 'Letters_Top' || name === 'Letters_Bottom' || name === 'Inner_Line') {
        mesh.material = mats.letters;
      } else if (name.startsWith('Eye_L') || name.startsWith('Eye_R')) {
        mesh.material = mats.eyes;
      } else if (name.startsWith('Tongue')) {
        mesh.material = mats.tongue;
      } else if (name.includes('Neon') || name === 'Neon_Tubes') {
        mesh.material = mats.extras?.tubes ?? mats.letters;
      } else if (name === 'Drips') {
        mesh.material = mats.extras?.drips ?? mats.body;
      } else if (name.includes('Emerald')) {
        mesh.material = mats.extras?.emerald ?? mats.body;
      } else if (name.includes('Pink')) {
        mesh.material = mats.extras?.pink ?? mats.body;
      } else if (name.includes('Zari') || name.includes('Beads')) {
        mesh.material = mats.extras?.gold ?? mats.body;
      } else if (name.includes('Pave')) {
        mesh.material = mats.eyes;
      } else {
        mesh.material = mats.body;
      }
    }
  });
}

export function Badge({
  position = [0, 1.5, 0],
  rotation = [0, 0, 0],
  scale = 1,
}: BadgeProps) {
  const { size } = useThree();
  const rootRef = useRef<THREE.Group>(null);

  // Authentically loaded GLBs from public/models/
  const enamelGltf = useGLTF('/models/badge-enamel.glb');
  const neonGltf = useGLTF('/models/badge-neon.glb');
  const jewelledGltf = useGLTF('/models/badge-jewelled.glb');

  const eyeLNode = useRef<THREE.Group | null>(null);
  const eyeRNode = useRef<THREE.Group | null>(null);
  const tongueNode = useRef<THREE.Group | null>(null);
  const dripsNode = useRef<THREE.Mesh | null>(null);

  const world = useStore((s) => s.world);
  const targetSkinOverride = useStore((s) => s.targetSkinOverride);
  const motionEnabled = useStore((s) => s.motionEnabled);
  const hoverDoor = useStore((s) => s.hoverDoor);
  const blinkTrigger = useStore((s) => s.blinkTrigger);
  const triggerBlink = useStore((s) => s.triggerBlink);
  const loaderPopped = useStore((s) => s.loaderPopped);

  // Target skin based on transition override (Part 10) or active world
  const worldSkin: SkinId =
    world === 'redroom' ? 'neon' : world === 'diwali' ? 'jewelled' : 'enamel';
  const targetSkin: SkinId = targetSkinOverride ?? worldSkin;

  const [currentSkin, setCurrentSkin] = useState<SkinId>(targetSkin);
  const [outgoingSkin, setOutgoingSkin] = useState<SkinId | null>(null);
  const [isDissolving, setIsDissolving] = useState(false);
  const dissolveProgress = useRef(-0.1);
  const dissolveDuration = useRef(1.2);

  // Pop scale spring state for H0 handoff (Part 7 H0: scale spring 0.96 -> 1, one overshoot)
  const popTimerRef = useRef(0);
  const popActiveRef = useRef(false);

  useEffect(() => {
    if (loaderPopped) {
      popActiveRef.current = true;
      popTimerRef.current = 0;
    }
  }, [loaderPopped]);

  // Dissolve edge colors per Part 5.2
  const edgeColors: Record<SkinId, { color: THREE.Color; intensity: number }> = useMemo(() => ({
    neon: { color: new THREE.Color('#FF4A1F'), intensity: 6.0 },
    jewelled: { color: new THREE.Color('#FFD27A'), intensity: 5.0 },
    enamel: { color: new THREE.Color('#E8ECF2'), intensity: 4.0 }, // Polished silver-chrome edge glow
  }), []);

  // Shared dissolve uniforms
  const outgoingUniforms: DissolveUniforms = useMemo(() => ({
    uDissolve: { value: -0.1 },
    uRole: { value: 0.0 }, // Outgoing skin
    uEdgeColor: { value: new THREE.Color('#FF4A1F') },
    uEdgeIntensity: { value: 5.0 },
    uEdgeWidth: { value: 0.06 },
  }), []);

  const incomingUniforms: DissolveUniforms = useMemo(() => ({
    uDissolve: { value: -0.1 },
    uRole: { value: 1.0 }, // Incoming skin
    uEdgeColor: { value: new THREE.Color('#FF4A1F') },
    uEdgeIntensity: { value: 5.0 },
    uEdgeWidth: { value: 0.06 },
  }), []);

  // Skin materials
  const currentMats = useMemo(
    () => createSkinMaterials(currentSkin, isDissolving ? incomingUniforms : undefined),
    [currentSkin, isDissolving, incomingUniforms]
  );

  const outgoingMats = useMemo(
    () => (outgoingSkin ? createSkinMaterials(outgoingSkin, outgoingUniforms) : null),
    [outgoingSkin, outgoingUniforms]
  );

  // Trigger dissolve transition when target skin changes (Part 5.2 & Part 10)
  useEffect(() => {
    if (targetSkin !== currentSkin) {
      if (!motionEnabled) {
        // Part 10 Reduced Motion: instant skin swap
        setIsDissolving(false);
        setOutgoingSkin(null);
        setCurrentSkin(targetSkin);
        dissolveProgress.current = -0.1;
        return;
      }

      setOutgoingSkin(currentSkin);
      setCurrentSkin(targetSkin);
      setIsDissolving(true);
      dissolveProgress.current = -0.1;
      // In T1, dissolve starts at 0.25s and completes by 2.0s (1.75s span across -0.1..1.1)
      dissolveDuration.current = frame.transition.type === 'T1' ? 1.65 : 1.2;

      const edge = edgeColors[targetSkin];
      outgoingUniforms.uEdgeColor.value.copy(edge.color);
      outgoingUniforms.uEdgeIntensity.value = edge.intensity;
      incomingUniforms.uEdgeColor.value.copy(edge.color);
      incomingUniforms.uEdgeIntensity.value = edge.intensity;
    }
  }, [targetSkin, currentSkin, motionEnabled, edgeColors, outgoingUniforms, incomingUniforms]);

  // Drag-to-spin state
  const dragRef = useRef({
    isDragging: false,
    startX: 0,
    currentX: 0,
    velocity: 0,
    rotationY: 0,
  });

  // Engraved Back Canvas Texture per Part 7 H2: "GATE TO RAGE · NAGPUR"
  const backTexture = useMemo(() => {
    if (typeof document === 'undefined') return null;
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    // Brushed chrome base
    ctx.fillStyle = '#C8CCD6';
    ctx.fillRect(0, 0, 1024, 1024);

    // Subtle brushed lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.lineWidth = 1;
    for (let y = 0; y < 1024; y += 4) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(1024, y);
      ctx.stroke();
    }

    // Outer & inner concentric engraved rings
    ctx.strokeStyle = '#6E7484';
    ctx.lineWidth = 12;
    ctx.beginPath();
    ctx.arc(512, 512, 450, 0, Math.PI * 2);
    ctx.stroke();

    ctx.strokeStyle = '#8E94A4';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.arc(512, 512, 380, 0, Math.PI * 2);
    ctx.stroke();

    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(512, 512, 240, 0, Math.PI * 2);
    ctx.stroke();

    // Engraved circular text: "GATE TO RAGE · NAGPUR"
    ctx.font = 'bold 50px sans-serif';
    ctx.fillStyle = '#4B505E';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const text = 'GATE TO RAGE · NAGPUR';
    ctx.save();
    ctx.translate(512, 512);
    for (let i = 0; i < text.length; i++) {
      const angle = -Math.PI / 2 + (i - (text.length - 1) / 2) * 0.13;
      ctx.save();
      ctx.rotate(angle);
      ctx.translate(0, -310);
      ctx.fillText(text[i], 0, 0);
      ctx.restore();
    }
    ctx.restore();

    // Center emblem ✕
    ctx.font = 'bold 64px sans-serif';
    ctx.fillStyle = '#5A6070';
    ctx.fillText('✕', 512, 512);

    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }, []);

  const behaviours = useMemo(() => new BadgeBehaviours(), []);

  // Choreography state refs (reversible per Part 6.2)
  const choreoPos = useRef(new THREE.Vector3(position[0], position[1], position[2]));
  const choreoYaw = useRef(0);
  const choreoScale = useRef(scale);
  const h2SpinDone = useRef(false);

  // Cloned scenes for current and outgoing skins
  const currentScene = useMemo(() => {
    const raw =
      currentSkin === 'neon'
        ? neonGltf.scene
        : currentSkin === 'jewelled'
          ? jewelledGltf.scene
          : enamelGltf.scene;
    const clone = raw.clone(true);
    applySkinToHierarchy(clone, currentSkin, currentMats, backTexture);
    return clone;
  }, [currentSkin, currentMats, enamelGltf.scene, neonGltf.scene, jewelledGltf.scene, backTexture]);

  const outgoingScene = useMemo(() => {
    if (!outgoingSkin || !outgoingMats) return null;
    const raw =
      outgoingSkin === 'neon'
        ? neonGltf.scene
        : outgoingSkin === 'jewelled'
          ? jewelledGltf.scene
          : enamelGltf.scene;
    const clone = raw.clone(true);
    applySkinToHierarchy(clone, outgoingSkin, outgoingMats, backTexture);
    return clone;
  }, [outgoingSkin, outgoingMats, enamelGltf.scene, neonGltf.scene, jewelledGltf.scene, backTexture]);

  // Update animated node references whenever the current scene updates
  useEffect(() => {
    if (currentScene) {
      eyeLNode.current = (currentScene.getObjectByName('Eye_L') as THREE.Group) || null;
      eyeRNode.current = (currentScene.getObjectByName('Eye_R') as THREE.Group) || null;
      tongueNode.current = (currentScene.getObjectByName('Tongue') as THREE.Group) || null;
      dripsNode.current = (currentScene.getObjectByName('Drips') as THREE.Mesh) || null;
    }
  }, [currentScene]);

  // Frame priority -30 per Part 13.3
  useFrame((_, delta) => {
    if (!rootRef.current) return;

    const tr = frame.transition;

    // 1. Advance dissolve progress (-0.1 to 1.1)
    if (isDissolving) {
      dissolveProgress.current += (delta * 1.2) / dissolveDuration.current;
      outgoingUniforms.uDissolve.value = dissolveProgress.current;
      incomingUniforms.uDissolve.value = dissolveProgress.current;

      if (dissolveProgress.current >= 1.1) {
        setIsDissolving(false);
        setOutgoingSkin(null);
        dissolveProgress.current = -0.1;
      }
    }

    // 2. Drag inertia physics (friction 2.4/s per Part 5.2)
    const drag = dragRef.current;
    if (!drag.isDragging) {
      drag.rotationY += drag.velocity * delta;
      drag.velocity = THREE.MathUtils.damp(drag.velocity, 0, 2.4, delta);
      drag.rotationY = THREE.MathUtils.damp(drag.rotationY, 0, 4.0, delta);
    }

    // 3. Pop scale spring on loader handoff (Part 7 H0: 0.96 -> 1.0, one overshoot)
    let popScale = 1.0;
    if (popActiveRef.current) {
      popTimerRef.current += delta;
      const t = popTimerRef.current;
      const duration = 0.6;
      if (t < duration) {
        const p = t / duration;
        const decay = Math.exp(-6 * p);
        const oscillation = Math.sin(p * Math.PI * 3.5);
        popScale = 1.0 + (0.96 - 1.0) * decay - 0.08 * decay * oscillation;
      } else {
        popActiveRef.current = false;
        popScale = 1.0;
      }
    }

    // 4. Multi-section choreography per Part 7 H0-H5, Part 8 R0-R4, Part 9 D0-D4
    const isMobile = size.width < 768;
    const isTablet = size.width >= 768 && size.width < 1024;
    const scrollP = frame.scroll;

    if (world === 'home') {
      const h0Scale = isMobile ? 0.92 : isTablet ? 1.05 : 1.22;
      const h0X = isMobile ? 0 : 1.45;
      const h0Y = isMobile ? (size.height < 700 ? 1.45 : 1.62) : 1.5;

      const h2Scale = isMobile ? 1.02 : 1.4;
      const h2X = isMobile ? 0 : 0.85;
      const h2Y = isMobile ? (size.height < 700 ? 1.65 : 1.82) : 1.5;

      const h5Scale = isMobile ? 0.44 : 0.52;
      const h5X = 0;
      const h5Y = isMobile ? 2.75 : 2.65;

      if (scrollP <= 0.22) {
        const t = Math.max(0, Math.min(1, scrollP / 0.22));
        const smoothT = THREE.MathUtils.smoothstep(t, 0, 1);
        choreoPos.current.set(
          THREE.MathUtils.lerp(h0X, h2X, smoothT),
          THREE.MathUtils.lerp(h0Y, h2Y, smoothT),
          0
        );
        choreoScale.current = THREE.MathUtils.lerp(h0Scale, h2Scale, smoothT);
        choreoYaw.current = 0;
        h2SpinDone.current = false;
      } else if (scrollP <= 0.45) {
        choreoPos.current.set(h2X, h2Y, 0);
        choreoScale.current = h2Scale;
        const spinT = (scrollP - 0.22) / 0.23;
        choreoYaw.current = spinT * Math.PI * 2;
        h2SpinDone.current = spinT >= 0.98;
      } else if (scrollP <= 0.72) {
        const t = (scrollP - 0.45) / 0.27;
        const smoothT = THREE.MathUtils.smoothstep(t, 0, 1);
        choreoPos.current.set(
          THREE.MathUtils.lerp(h2X, isMobile ? 0 : -0.75, smoothT),
          THREE.MathUtils.lerp(h2Y, isMobile ? 1.55 : 1.5, smoothT),
          0
        );
        choreoScale.current = THREE.MathUtils.lerp(h2Scale, isMobile ? 0.85 : 1.05, smoothT);
        choreoYaw.current = 0;
      } else {
        const t = Math.max(0, Math.min(1, (scrollP - 0.72) / 0.28));
        const smoothT = THREE.MathUtils.smoothstep(t, 0, 1);
        choreoPos.current.set(
          THREE.MathUtils.lerp(isMobile ? 0 : -0.75, h5X, smoothT),
          THREE.MathUtils.lerp(isMobile ? 1.55 : 1.5, h5Y, smoothT),
          0
        );
        choreoScale.current = THREE.MathUtils.lerp(isMobile ? 0.85 : 1.05, h5Scale, smoothT);
        choreoYaw.current = 0;
      }
    } else if (world === 'redroom') {
      const targetScale = isMobile ? 0.78 : 0.95;
      const targetY = isMobile ? 1.75 : 1.7;
      choreoPos.current.set(0, targetY, 0);
      choreoScale.current = THREE.MathUtils.damp(choreoScale.current, targetScale, 5, delta);
      choreoYaw.current = THREE.MathUtils.damp(choreoYaw.current, 0, 5, delta);
    } else if (world === 'diwali') {
      const targetScale = isMobile ? 0.76 : 0.92;
      const targetY = isMobile ? 1.72 : 1.68;
      choreoPos.current.set(0, targetY, 0);
      choreoScale.current = THREE.MathUtils.damp(choreoScale.current, targetScale, 5, delta);
      choreoYaw.current = THREE.MathUtils.damp(choreoYaw.current, 0, 5, delta);
    }

    // 5. Apply transitions choreo override (Part 10 T1/T2)
    if (tr.phase !== 'idle') {
      const p = tr.t;
      let targetPos = choreoPos.current.clone();
      let targetYaw = 0;
      let targetScale = choreoScale.current;

      if (tr.type === 'T1') {
        if (p < 0.25) {
          const t = p / 0.25;
          targetScale = THREE.MathUtils.lerp(0.52, 0.7, t);
          targetPos.y = THREE.MathUtils.lerp(2.65, 2.0, t);
        } else if (p < 0.75) {
          const t = (p - 0.25) / 0.5;
          targetScale = 0.7;
          targetPos.y = 2.0;
          targetYaw = t * Math.PI * 2;
        } else {
          const t = (p - 0.75) / 0.25;
          targetScale = THREE.MathUtils.lerp(0.7, 0.95, t);
          targetPos.y = THREE.MathUtils.lerp(2.0, 1.7, t);
        }
      } else if (tr.type === 'T2') {
        targetPos.y = 1.7;
        targetScale = 0.95;
        targetYaw = p * Math.PI * 2;
      } else if (tr.type === 'T3') {
        const t = Math.min(1, p / 0.8);
        targetPos.y = THREE.MathUtils.lerp(1.7, 2.65, t);
        targetScale = THREE.MathUtils.lerp(0.95, 0.52, t);
      }

      choreoPos.current.lerp(targetPos, 0.15);
      choreoYaw.current = THREE.MathUtils.damp(choreoYaw.current, targetYaw, 5, delta);
      choreoScale.current = THREE.MathUtils.damp(choreoScale.current, targetScale, 5, delta);
    }

    rootRef.current.scale.setScalar(choreoScale.current * popScale);

    // 6. Update autonomous and interactive behaviours with choreography
    behaviours.update(
      rootRef.current,
      eyeLNode.current,
      eyeRNode.current,
      tongueNode.current,
      {
        time: frame.time,
        dt: delta,
        pointer: {
          x: frame.pointer.damped.x,
          y: frame.pointer.damped.y,
          lastMoveTime: frame.pointer.lastMoveTime,
        },
        hoverDoor,
        dragVelocity: drag.velocity,
        dragRotationY: drag.rotationY,
        isDragging: drag.isDragging,
        manualBlinkTrigger: blinkTrigger,
        choreoYaw: choreoYaw.current,
        choreoPos: choreoPos.current,
      }
    );

    // 7. Neon drips extension animation per Part 5.2 line 450
    if (currentSkin === 'neon' && dripsNode.current) {
      const cycle = (frame.time % 8.0) / 8.0;
      dripsNode.current.scale.y = 1.0 + Math.sin(cycle * Math.PI * 2) * 0.06 + 0.06;
    }
  }, -30);

  // Pointer drag listeners for drag-to-spin
  const handlePointerDown = (e: any) => {
    e.stopPropagation();
    dragRef.current.isDragging = true;
    dragRef.current.startX = e.clientX ?? 0;
    dragRef.current.velocity = 0;
    triggerBlink();
  };

  const handlePointerMove = (e: any) => {
    if (!dragRef.current.isDragging) return;
    const clientX = e.clientX ?? 0;
    const deltaX = clientX - dragRef.current.startX;
    dragRef.current.startX = clientX;
    dragRef.current.rotationY += deltaX * 0.008;
    dragRef.current.velocity = deltaX * 0.4;
  };

  const handlePointerUp = () => {
    dragRef.current.isDragging = false;
  };

  return (
    <group
      ref={rootRef}
      name="Badge"
      position={position}
      rotation={rotation}
      scale={scale}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
    >
      {/* Active/Incoming Skin GLB */}
      <primitive object={currentScene} />

      {/* Directional Sparkle Glints on Pavé Diamond Face for Jewelled Skin */}
      <SparkleGlints active={currentSkin === 'jewelled'} />

      {/* Outgoing Skin during Dissolve Transition */}
      {isDissolving && outgoingScene && (
        <primitive object={outgoingScene} />
      )}
    </group>
  );
}
