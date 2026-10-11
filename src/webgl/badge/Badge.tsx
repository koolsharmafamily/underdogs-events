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
  const { size } = useThree();
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
  const loaderPopped = useStore((s) => s.loaderPopped);

  // Target skin based on world
  const targetSkin: SkinId =
    world === 'redroom' ? 'neon' : world === 'diwali' ? 'jewelled' : 'enamel';

  const [currentSkin, setCurrentSkin] = useState<SkinId>(targetSkin);
  const [outgoingSkin, setOutgoingSkin] = useState<SkinId | null>(null);
  const [isDissolving, setIsDissolving] = useState(false);
  const dissolveProgress = useRef(-0.1);

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

  // Front face logo canvas texture
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

  // Home Choreography state refs (reversible per Part 6.2)
  const choreoPos = useRef(new THREE.Vector3(position[0], position[1], position[2]));
  const choreoYaw = useRef(0);
  const choreoScale = useRef(scale);
  const h2SpinDone = useRef(false);

  // Frame tick: update dissolve, inertia, choreography, and behaviours
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

    // 3. Pop scale spring on loader handoff (Part 7 H0: 0.96 -> 1.0, one overshoot)
    let popScale = 1.0;
    if (popActiveRef.current) {
      popTimerRef.current += delta;
      const t = popTimerRef.current;
      if (t < 0.6) {
        const offset = -0.04 * Math.exp(-t * 6.5) * Math.cos(t * 13.8);
        popScale = 1.0 + offset;
      } else {
        popActiveRef.current = false;
        popScale = 1.0;
      }
    }

    // 4. Compute choreographed targets for Home scenes (H1–H5)
    let targetX = position[0];
    let targetY = position[1];
    let targetZ = position[2];
    let targetYaw = rotation[1];
    let targetScale = scale;

    if (world === 'home') {
      const p1 = frame.dampedProgress['H1'] ?? 0;
      const p2 = frame.dampedProgress['H2'] ?? 0;
      const p3 = frame.dampedProgress['H3'] ?? 0;
      const p4 = frame.dampedProgress['H4'] ?? 0;
      const p5 = frame.dampedProgress['H5'] ?? 0;

      const isMobile = size.width < 768;

      if (p5 > 0.05) {
        // H5: Doors scene — badge floats at (0, 3.2, 0)
        targetX = 0;
        targetY = 3.2;
        targetZ = 0;
        targetScale = 1.0;
        targetYaw = hoverDoor === 'redroom' ? -0.174 : hoverDoor === 'diwali' ? 0.174 : 0;
      } else if (p4 > 0.05) {
        // H4: This season — returns to centre, then rises to 3.2 near end
        targetX = 0;
        targetZ = 0;
        targetScale = 1.0;
        if (p4 < 0.65) {
          targetY = 1.5;
        } else {
          targetY = THREE.MathUtils.lerp(1.5, 3.2, (p4 - 0.65) / 0.35);
        }
        targetYaw = 0;
      } else if (p3 > 0.05) {
        // H3: Nights we've thrown — parks at top-right at 0.55 scale (desktop) or fades out (mobile)
        if (isMobile) {
          targetScale = Math.max(0, 1.0 - p3 * 2);
          targetX = 0;
          targetY = 1.5;
          targetZ = 0;
        } else {
          targetX = 1.2;
          targetY = 2.0;
          targetZ = 4.0;
          targetScale = 0.55;
        }
        targetYaw = 0;
      } else if (p2 > 0.05) {
        // H2: Who we are — three statements choreography
        targetX = 0;
        targetY = 1.5;
        targetZ = 0;
        targetScale = 1.0;

        if (p2 < 0.34) {
          // Statement 1: turns edge-on (yaw 90° = 1.57 rad)
          const sub = p2 / 0.34;
          targetYaw = THREE.MathUtils.lerp(-0.4363, Math.PI / 2, sub);
          h2SpinDone.current = false;
        } else if (p2 < 0.67) {
          // Statement 2: continues to 180° showing engraved back "GATE TO RAGE · NAGPUR"
          const sub = (p2 - 0.34) / 0.33;
          targetYaw = THREE.MathUtils.lerp(Math.PI / 2, Math.PI, sub);
          h2SpinDone.current = false;
        } else {
          // Statement 3: spins back to face camera (Math.PI -> Math.PI * 2) with spring settle & blink
          const sub = Math.min(1, (p2 - 0.67) / 0.33);
          targetYaw = THREE.MathUtils.lerp(Math.PI, Math.PI * 2, sub);
          if (sub >= 0.95 && !h2SpinDone.current) {
            h2SpinDone.current = true;
            triggerBlink();
          }
        }
      } else {
        // H1: Hero — sits on right third on desktop (x = 0.85), yaws 0 -> -25° and rises 0.2 across scroll
        targetX = isMobile ? 0 : 0.85;
        targetY = 1.5 + 0.2 * p1;
        targetZ = position[2];
        targetYaw = -0.4363 * p1;
        targetScale = 1.0;
        h2SpinDone.current = false;
      }
    }

    // Smooth exponential damping toward targets (lambda = 5)
    choreoPos.current.x = THREE.MathUtils.damp(choreoPos.current.x, targetX, 5, delta);
    choreoPos.current.y = THREE.MathUtils.damp(choreoPos.current.y, targetY, 5, delta);
    choreoPos.current.z = THREE.MathUtils.damp(choreoPos.current.z, targetZ, 5, delta);
    choreoYaw.current = THREE.MathUtils.damp(choreoYaw.current, targetYaw, 5, delta);
    choreoScale.current = THREE.MathUtils.damp(choreoScale.current, targetScale, 5, delta);

    rootRef.current.scale.setScalar(choreoScale.current * popScale);

    // 5. Update all autonomous and interactive behaviours with choreography
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
        choreoYaw: choreoYaw.current,
        choreoPos: choreoPos.current,
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
    if (backTexture && mats.back.map !== backTexture) {
      mats.back.map = backTexture;
      mats.back.bumpMap = backTexture;
      mats.back.bumpScale = 0.04;
      mats.back.needsUpdate = true;
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
        {/* Back — rotated by Math.PI around Y to face rear with upright text */}
        <mesh
          name="Back"
          geometry={backGeom}
          material={mats.back}
          position={[0, 0, -0.06]}
          rotation={[0, Math.PI, 0]}
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
