'use client';

import React, { useRef, useMemo, useEffect, useState } from 'react';
import * as THREE from 'three';
import { useFrame, useThree } from '@react-three/fiber';
import { frame } from '@/state/frame';
import { useStore } from '@/state/store';
import { SkinId, createSkinMaterials, BadgeSkinMaterials } from './skins';
import { DissolveUniforms } from './dissolve.glsl';
import { BadgeBehaviours } from './behaviours';

interface BadgeProps {
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: number;
}

export function Badge({
  position = [0, 1.5, 0],
  rotation = [0, 0, 0],
  scale = 1,
}: BadgeProps) {
  const rootRef = useRef<THREE.Group>(null);
  const outgoingGroupRef = useRef<THREE.Group>(null);
  const incomingGroupRef = useRef<THREE.Group>(null);

  const eyeLRef = useRef<THREE.Group>(null);
  const eyeRRef = useRef<THREE.Group>(null);
  const tongueRef = useRef<THREE.Group>(null);

  const world = useStore((s) => s.world);
  const hoverDoor = useStore((s) => s.hoverDoor);
  const blinkTrigger = useStore((s) => s.blinkTrigger);
  const triggerBlink = useStore((s) => s.triggerBlink);

  // Target skin based on world
  const targetSkin: SkinId =
    world === 'redroom' ? 'neon' : world === 'diwali' ? 'jewelled' : 'enamel';

  const [currentSkin, setCurrentSkin] = useState<SkinId>(targetSkin);
  const [outgoingSkin, setOutgoingSkin] = useState<SkinId | null>(null);
  const [isDissolving, setIsDissolving] = useState(false);
  const dissolveProgress = useRef(-0.1);

  // Dissolve edge colors per Part 5.2
  const edgeColors: Record<SkinId, { color: THREE.Color; intensity: number }> = useMemo(() => ({
    neon: { color: new THREE.Color('#FF4A1F'), intensity: 6.0 },
    jewelled: { color: new THREE.Color('#FFD27A'), intensity: 5.0 },
    enamel: { color: new THREE.Color('#FF4FD8'), intensity: 4.0 },
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

  // Trigger dissolve transition when target skin changes (1.2s duration per Part 5.2 & Part 14)
  useEffect(() => {
    if (targetSkin !== currentSkin && !isDissolving) {
      setOutgoingSkin(currentSkin);
      setCurrentSkin(targetSkin);
      setIsDissolving(true);
      dissolveProgress.current = -0.1;

      const edge = edgeColors[targetSkin];
      outgoingUniforms.uEdgeColor.value.copy(edge.color);
      outgoingUniforms.uEdgeIntensity.value = edge.intensity;
      incomingUniforms.uEdgeColor.value.copy(edge.color);
      incomingUniforms.uEdgeIntensity.value = edge.intensity;
    }
  }, [targetSkin, currentSkin, isDissolving, edgeColors, outgoingUniforms, incomingUniforms]);

  // Drag-to-spin state
  const dragRef = useRef({
    isDragging: false,
    startX: 0,
    currentX: 0,
    velocity: 0,
    rotationY: 0,
  });

  // Logo canvas texture
  const logoTexture = useMemo(() => {
    if (typeof document === 'undefined') return null;
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    ctx.clearRect(0, 0, 1024, 1024);

    const isNeon = currentSkin === 'neon';
    const isJewelled = currentSkin === 'jewelled';
    const strokeColor = isNeon ? '#FF2A1F' : isJewelled ? '#FFDF88' : '#FCF9FC';

    // Outer circle guide
    ctx.strokeStyle = strokeColor;
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
    ctx.fillStyle = strokeColor;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Top arc: UNDERDOGS
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
    // Bottom arc: UNDERDOGS
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

    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }, [currentSkin]);

  // Geometries per Part 5.2: diameter 1.0, thickness 0.12
  const bodyGeom = useMemo(() => new THREE.CylinderGeometry(0.5, 0.5, 0.12, 64), []);
  const ringGeom = useMemo(() => new THREE.TorusGeometry(0.44, 0.045, 32, 64), []);
  const faceGeom = useMemo(() => new THREE.CylinderGeometry(0.38, 0.38, 0.02, 64), []);
  const eyeBar1Geom = useMemo(() => {
    const g = new THREE.BoxGeometry(0.09, 0.022, 0.015);
    g.rotateZ(Math.PI / 4);
    return g;
  }, []);
  const eyeBar2Geom = useMemo(() => {
    const g = new THREE.BoxGeometry(0.022, 0.09, 0.015);
    g.rotateZ(Math.PI / 4);
    return g;
  }, []);
  const mouthBarGeom = useMemo(() => new THREE.BoxGeometry(0.14, 0.02, 0.015), []);
  const tongueGeom = useMemo(() => new THREE.CylinderGeometry(0.035, 0.035, 0.06, 16), []);
  const backGeom = useMemo(() => new THREE.CircleGeometry(0.49, 64), []);

  const behaviours = useMemo(() => new BadgeBehaviours(), []);

  // Frame tick: update dissolve, inertia, and behaviours
  useFrame((_, delta) => {
    if (!rootRef.current) return;

    // 1. Advance dissolve progress (1.2s total from -0.1 to 1.1)
    if (isDissolving) {
      dissolveProgress.current += delta / 1.2;
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
      // Spring back to face camera
      drag.rotationY = THREE.MathUtils.damp(drag.rotationY, 0, 4.0, delta);
    }

    // 3. Update all autonomous and interactive behaviours
    behaviours.update(
      rootRef.current,
      eyeLRef.current,
      eyeRRef.current,
      tongueRef.current,
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
      }
    );
  });

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

  const renderSkinMeshGroup = (mats: BadgeSkinMaterials, isIncoming: boolean) => {
    if (logoTexture && mats.face.map !== logoTexture) {
      mats.face.map = logoTexture;
      mats.face.needsUpdate = true;
    }
    return (
      <group ref={isIncoming ? incomingGroupRef : outgoingGroupRef}>
        {/* Body */}
        <mesh
          name="Body"
          geometry={bodyGeom}
          material={mats.body}
          rotation={[Math.PI / 2, 0, 0]}
        />
        {/* Ring */}
        <mesh
          name="Ring"
          geometry={ringGeom}
          material={mats.ring}
          position={[0, 0, 0.04]}
        />
        {/* Face */}
        <mesh
          name="Face"
          geometry={faceGeom}
          material={mats.face}
          rotation={[Math.PI / 2, 0, 0]}
          position={[0, 0, 0.05]}
        />
        {/* Back */}
        <mesh
          name="Back"
          geometry={backGeom}
          material={mats.back}
          position={[0, 0, -0.06]}
          rotation={[-Math.PI / 2, 0, 0]}
        />
      </group>
    );
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
      {/* Active/Incoming Skin */}
      {renderSkinMeshGroup(currentMats, true)}

      {/* Outgoing Skin during Dissolve Transition */}
      {isDissolving && outgoingMats && renderSkinMeshGroup(outgoingMats, false)}

      {/* Eye_L */}
      <group ref={eyeLRef} name="Eye_L" position={[-0.13, 0.06, 0.065]}>
        <mesh geometry={eyeBar1Geom} material={currentMats.eyes} />
        <mesh geometry={eyeBar2Geom} material={currentMats.eyes} />
      </group>

      {/* Eye_R */}
      <group ref={eyeRRef} name="Eye_R" position={[0.13, 0.06, 0.065]}>
        <mesh geometry={eyeBar1Geom} material={currentMats.eyes} />
        <mesh geometry={eyeBar2Geom} material={currentMats.eyes} />
      </group>

      {/* Tongue */}
      <group ref={tongueRef} name="Tongue" position={[0, -0.06, 0.065]}>
        <mesh geometry={mouthBarGeom} material={currentMats.tongue} />
        <mesh
          position={[0, -0.035, 0]}
          geometry={tongueGeom}
          material={currentMats.tongue}
        />
      </group>
    </group>
  );
}
