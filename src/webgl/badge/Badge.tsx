'use client';

import React, { useRef, useMemo, useEffect } from 'react';
import * as THREE from 'three';
import { useFrame, useThree } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import { frame } from '@/state/frame';
import { useStore } from '@/state/store';
import { SkinId, DISSOLVE_EDGES } from './skins';
import { DissolveUniforms, injectDissolve } from './dissolve.glsl';
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

interface PreparedScene {
  clone: THREE.Group;
  animatedNodes: {
    eyeL: THREE.Group | null;
    eyeR: THREE.Group | null;
    tongue: THREE.Group | null;
    drips: THREE.Mesh | null;
  };
  neonMaterials: THREE.MeshStandardMaterial[];
}

function prepareBadgeScene(
  sourceScene: THREE.Group,
  uniforms: DissolveUniforms,
  backTexture: THREE.CanvasTexture | null,
  skinName: SkinId
): PreparedScene {
  const clone = sourceScene.clone(true);
  const animatedNodes = {
    eyeL: null as THREE.Group | null,
    eyeR: null as THREE.Group | null,
    tongue: null as THREE.Group | null,
    drips: null as THREE.Mesh | null,
  };
  const neonMaterials: THREE.MeshStandardMaterial[] = [];

  clone.traverse((child) => {
    if ((child as THREE.Mesh).isMesh) {
      const mesh = child as THREE.Mesh;
      mesh.castShadow = false;
      mesh.receiveShadow = false;

      if (mesh.material) {
        const origMat = Array.isArray(mesh.material) ? mesh.material[0] : mesh.material;
        const mat = (origMat as THREE.Material).clone() as THREE.MeshStandardMaterial;

        // Apply authentic engraved back texture bump relief (BRIEF.md Part 7 H2)
        if (mesh.name === 'Back' && backTexture) {
          mat.bumpMap = backTexture;
          mat.bumpScale = 0.04;
          mat.needsUpdate = true;
        }

        // Inject dissolve shader without modifying original material colours or properties
        injectDissolve(mat, uniforms, `${skinName}_${mesh.name}`);
        mesh.material = mat;

        // Collect neon emissive materials for dynamic flicker without color replacement
        if (mat.emissive && (mat.emissive.r > 0 || mat.emissive.g > 0 || mat.emissive.b > 0)) {
          mat.userData.baseEmissiveIntensity = mat.emissiveIntensity ?? 1.0;
          neonMaterials.push(mat);
        }
      }
    }

    if (child.name === 'Eye_L' && (child as THREE.Group).isGroup) animatedNodes.eyeL = child as THREE.Group;
    if (child.name === 'Eye_R' && (child as THREE.Group).isGroup) animatedNodes.eyeR = child as THREE.Group;
    if (child.name === 'Tongue' && (child as THREE.Group).isGroup) animatedNodes.tongue = child as THREE.Group;
    if (child.name === 'Drips' && (child as THREE.Mesh).isMesh) animatedNodes.drips = child as THREE.Mesh;
  });

  return { clone, animatedNodes, neonMaterials };
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

  // Groups for each pre-mounted skin
  const enamelGroupRef = useRef<THREE.Group>(null);
  const neonGroupRef = useRef<THREE.Group>(null);
  const jewelledGroupRef = useRef<THREE.Group>(null);

  const world = useStore((s) => s.world);
  const targetSkinOverride = useStore((s) => s.targetSkinOverride);
  const motionEnabled = useStore((s) => s.motionEnabled);
  const hoverDoor = useStore((s) => s.hoverDoor);
  const blinkTrigger = useStore((s) => s.blinkTrigger);
  const triggerBlink = useStore((s) => s.triggerBlink);
  const loaderPopped = useStore((s) => s.loaderPopped);

  // Initial and target skin mapping
  const worldSkin: SkinId =
    world === 'redroom' ? 'neon' : world === 'diwali' ? 'jewelled' : 'enamel';
  const targetSkin: SkinId = targetSkinOverride ?? worldSkin;

  // Lifecycle state tracking via REFS ONLY (zero React re-renders mid-transition)
  const activeSkinRef = useRef<SkinId>(targetSkin);
  const outgoingSkinRef = useRef<SkinId | null>(null);
  const isDissolvingRef = useRef(false);
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

  // Shared dissolve uniforms per skin created ONCE at mount
  const enamelUniforms: DissolveUniforms = useMemo(() => ({
    uDissolve: { value: -0.1 },
    uRole: { value: 1.0 },
    uEdgeColor: { value: DISSOLVE_EDGES.enamel.color.clone() },
    uEdgeIntensity: { value: DISSOLVE_EDGES.enamel.intensity },
    uEdgeWidth: { value: DISSOLVE_EDGES.enamel.width },
  }), []);

  const neonUniforms: DissolveUniforms = useMemo(() => ({
    uDissolve: { value: -0.1 },
    uRole: { value: 1.0 },
    uEdgeColor: { value: DISSOLVE_EDGES.neon.color.clone() },
    uEdgeIntensity: { value: DISSOLVE_EDGES.neon.intensity },
    uEdgeWidth: { value: DISSOLVE_EDGES.neon.width },
  }), []);

  const jewelledUniforms: DissolveUniforms = useMemo(() => ({
    uDissolve: { value: -0.1 },
    uRole: { value: 1.0 },
    uEdgeColor: { value: DISSOLVE_EDGES.jewelled.color.clone() },
    uEdgeIntensity: { value: DISSOLVE_EDGES.jewelled.intensity },
    uEdgeWidth: { value: DISSOLVE_EDGES.jewelled.width },
  }), []);

  // Engraved Back Canvas Texture per Part 7 H2: "GATE TO RAGE · NAGPUR"
  const backTexture = useMemo(() => {
    if (typeof document === 'undefined') return null;
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    ctx.fillStyle = '#C8CCD6';
    ctx.fillRect(0, 0, 1024, 1024);

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.lineWidth = 1;
    for (let y = 0; y < 1024; y += 4) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(1024, y);
      ctx.stroke();
    }

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

    ctx.font = 'bold 64px sans-serif';
    ctx.fillStyle = '#5A6070';
    ctx.fillText('✕', 512, 512);

    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }, []);

  // Pre-prepare all 3 scenes ONCE with cloned authentic GLB materials
  const enamelPrepared = useMemo(
    () => prepareBadgeScene(enamelGltf.scene, enamelUniforms, backTexture, 'enamel'),
    [enamelGltf.scene, enamelUniforms, backTexture]
  );
  const neonPrepared = useMemo(
    () => prepareBadgeScene(neonGltf.scene, neonUniforms, backTexture, 'neon'),
    [neonGltf.scene, neonUniforms, backTexture]
  );
  const jewelledPrepared = useMemo(
    () => prepareBadgeScene(jewelledGltf.scene, jewelledUniforms, backTexture, 'jewelled'),
    [jewelledGltf.scene, jewelledUniforms, backTexture]
  );

  const getSkinGroup = (skin: SkinId) => {
    if (skin === 'neon') return neonGroupRef.current;
    if (skin === 'jewelled') return jewelledGroupRef.current;
    return enamelGroupRef.current;
  };

  const getSkinUniforms = (skin: SkinId) => {
    if (skin === 'neon') return neonUniforms;
    if (skin === 'jewelled') return jewelledUniforms;
    return enamelUniforms;
  };

  // Sync initial visibility on direct URL visit or mount
  useEffect(() => {
    const active = targetSkin;
    activeSkinRef.current = active;
    if (enamelGroupRef.current) enamelGroupRef.current.visible = active === 'enamel';
    if (neonGroupRef.current) neonGroupRef.current.visible = active === 'neon';
    if (jewelledGroupRef.current) jewelledGroupRef.current.visible = active === 'jewelled';
  }, [targetSkin]);

  // Handle skin changes (transitions or world swaps) purely via REFS and visibility
  useEffect(() => {
    if (targetSkin !== activeSkinRef.current) {
      const prevSkin = activeSkinRef.current;
      const nextSkin = targetSkin;
      const isTransitionRunning = frame.transition.phase !== 'idle';

      if (!motionEnabled || !isTransitionRunning) {
        // Direct visit, refresh, or reduced motion: instant visibility switch without dissolve
        const oldGroup = getSkinGroup(prevSkin);
        const newGroup = getSkinGroup(nextSkin);
        if (oldGroup) oldGroup.visible = false;
        if (newGroup) newGroup.visible = true;
        const oldU = getSkinUniforms(prevSkin);
        const newU = getSkinUniforms(nextSkin);
        oldU.uDissolve.value = -0.1;
        newU.uDissolve.value = -0.1;
        newU.uRole.value = 1.0;
        activeSkinRef.current = nextSkin;
        outgoingSkinRef.current = null;
        isDissolvingRef.current = false;
        useStore.getState().setTargetSkinOverride(null);
        return;
      }

      // Motion enabled during active route transition: run 0.8s dissolve
      outgoingSkinRef.current = prevSkin;
      activeSkinRef.current = nextSkin;
      isDissolvingRef.current = true;
      dissolveProgress.current = -0.1;
      dissolveDuration.current = 0.8;

      const outGroup = getSkinGroup(prevSkin);
      const inGroup = getSkinGroup(nextSkin);
      if (outGroup) outGroup.visible = true;
      if (inGroup) inGroup.visible = true;

      const outU = getSkinUniforms(prevSkin);
      const inU = getSkinUniforms(nextSkin);
      const edge = DISSOLVE_EDGES[nextSkin];

      outU.uRole.value = 0.0; // Outgoing skin
      outU.uDissolve.value = -0.1;
      outU.uEdgeColor.value.copy(edge.color);
      outU.uEdgeIntensity.value = edge.intensity;
      outU.uEdgeWidth.value = edge.width;

      inU.uRole.value = 1.0; // Incoming skin
      inU.uDissolve.value = -0.1;
      inU.uEdgeColor.value.copy(edge.color);
      inU.uEdgeIntensity.value = edge.intensity;
      inU.uEdgeWidth.value = edge.width;
    }
  }, [targetSkin, motionEnabled]);

  // Drag-to-spin state
  const dragRef = useRef({
    isDragging: false,
    startX: 0,
    currentX: 0,
    velocity: 0,
    rotationY: 0,
  });

  const behaviours = useMemo(() => new BadgeBehaviours(), []);

  // Choreography state refs (reversible per Part 6.2)
  const choreoPos = useRef(new THREE.Vector3(position[0], position[1], position[2]));
  const choreoYaw = useRef(0);
  const choreoScale = useRef(scale);
  const h2SpinDone = useRef(false);

  // Active animated nodes based on current active skin
  const currentNodes =
    activeSkinRef.current === 'neon'
      ? neonPrepared.animatedNodes
      : activeSkinRef.current === 'jewelled'
        ? jewelledPrepared.animatedNodes
        : enamelPrepared.animatedNodes;

  // Frame priority -30 per Part 13.3
  useFrame((_, delta) => {
    if (!rootRef.current) return;

    const tr = frame.transition;

    // 1. Advance dissolve progress (-0.1 to 1.1)
    if (isDissolvingRef.current) {
      dissolveProgress.current += (delta * 1.2) / dissolveDuration.current;
      const curProg = dissolveProgress.current;

      if (outgoingSkinRef.current) {
        const outU = getSkinUniforms(outgoingSkinRef.current);
        outU.uDissolve.value = curProg;
      }
      const inU = getSkinUniforms(activeSkinRef.current);
      inU.uDissolve.value = curProg;

      if (curProg >= 1.1) {
        isDissolvingRef.current = false;
        if (outgoingSkinRef.current) {
          const outGroup = getSkinGroup(outgoingSkinRef.current);
          if (outGroup) outGroup.visible = false;
          const outU = getSkinUniforms(outgoingSkinRef.current);
          outU.uDissolve.value = -0.1;
          outgoingSkinRef.current = null;
        }
        inU.uDissolve.value = -0.1;
        inU.uRole.value = 1.0;
        dissolveProgress.current = -0.1;
        useStore.getState().setTargetSkinOverride(null);
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
    const h1 = frame.dampedProgress['H1'] ?? frame.dampedProgress['h1'] ?? 0;
    const h2 = frame.dampedProgress['H2'] ?? frame.dampedProgress['h2'] ?? 0;
    const h3 = frame.dampedProgress['H3'] ?? frame.dampedProgress['h3'] ?? 0;
    const h4 = frame.dampedProgress['H4'] ?? frame.dampedProgress['h4'] ?? 0;
    const h5 = frame.dampedProgress['H5'] ?? frame.dampedProgress['h5'] ?? 0;
    const scrollP = THREE.MathUtils.clamp(h1 * 0.2 + h2 * 0.3 + h3 * 0.15 + h4 * 0.2 + h5 * 0.15, 0, 1);

    if (world === 'home') {
      const h0Scale = isMobile ? 0.92 : isTablet ? 1.05 : 1.22;
      const h0X = isMobile ? 0 : 1.45;
      const h0Y = isMobile ? (size.height < 700 ? 1.45 : 1.62) : 1.5;

      const h2Scale = isMobile ? 1.02 : 1.4;
      const h2X = isMobile ? 0 : 0.85;
      const h2Y = isMobile ? (size.height < 700 ? 1.65 : 1.82) : 1.5;

      const h3Scale = isMobile ? 0.5 : 0.62;
      const h3X = isMobile ? 0 : 1.6;
      const h3Y = isMobile ? 2.5 : 2.1;

      const h5Scale = isMobile ? 0 : 0.40;
      const h5X = 0;
      const h5Y = isMobile ? 3.35 : 2.72; // Floats above and between doors on desktop; fades out on mobile stacked doors

      if (scrollP <= 0.2) {
        const t = Math.max(0, Math.min(1, scrollP / 0.2));
        const smoothT = THREE.MathUtils.smoothstep(t, 0, 1);
        choreoPos.current.set(
          THREE.MathUtils.lerp(h0X, h2X, smoothT),
          THREE.MathUtils.lerp(h0Y, h2Y, smoothT),
          0
        );
        choreoScale.current = THREE.MathUtils.lerp(h0Scale, h2Scale, smoothT);
        choreoYaw.current = 0;
        h2SpinDone.current = false;
      } else if (scrollP <= 0.48) {
        choreoPos.current.set(h2X, h2Y, 0);
        choreoScale.current = h2Scale;
        const spinT = (scrollP - 0.2) / 0.28;
        choreoYaw.current = THREE.MathUtils.smoothstep(spinT, 0, 1) * Math.PI * 2;
        h2SpinDone.current = spinT >= 0.98;
      } else if (scrollP <= 0.68) {
        // H3: Badge parks at top-right host position
        const t = Math.max(0, Math.min(1, (scrollP - 0.48) / 0.2));
        const smoothT = THREE.MathUtils.smoothstep(t, 0, 1);
        choreoPos.current.set(
          THREE.MathUtils.lerp(h2X, h3X, smoothT),
          THREE.MathUtils.lerp(h2Y, h3Y, smoothT),
          0
        );
        choreoScale.current = THREE.MathUtils.lerp(h2Scale, h3Scale, smoothT);
        choreoYaw.current = Math.PI * 2;
      } else if (scrollP <= 0.85) {
        // H4: Badge returns to center (x = 0) and rises up above door height (y = 3.3)
        const t = Math.max(0, Math.min(1, (scrollP - 0.68) / 0.17));
        const smoothT = THREE.MathUtils.smoothstep(t, 0, 1);
        choreoPos.current.set(
          THREE.MathUtils.lerp(h3X, h5X, smoothT),
          THREE.MathUtils.lerp(h3Y, h5Y, smoothT),
          0
        );
        choreoScale.current = THREE.MathUtils.lerp(h3Scale, h5Scale, smoothT);
        choreoYaw.current = Math.PI * 2;
      } else {
        // H5: Badge floats above and between both doors at (0, 3.3, 0)
        choreoPos.current.set(h5X, h5Y, 0);
        choreoScale.current = h5Scale;
        choreoYaw.current = Math.PI * 2;
      }
    } else if (world === 'redroom') {
      const r3 = frame.dampedProgress['R3'] ?? frame.dampedProgress['r3'] ?? 0;
      const r4 = frame.dampedProgress['R4'] ?? frame.dampedProgress['r4'] ?? 0;
      const r5 = frame.dampedProgress['R5'] ?? frame.dampedProgress['r5'] ?? 0;
      const r6 = frame.dampedProgress['R6'] ?? frame.dampedProgress['r6'] ?? 0;
      const targetScale = isMobile ? 0.78 : 0.95;

      if (r6 > 0.05) {
        // R6: Outro — badge returns centered
        const t = THREE.MathUtils.smoothstep(r6, 0.05, 0.4);
        choreoPos.current.set(0, THREE.MathUtils.lerp(3.8, 1.7, t), 0.6);
        choreoScale.current = THREE.MathUtils.lerp(0, targetScale * 0.8, t);
      } else if (r4 > 0 || r5 > 0 || r3 > 0.6) {
        // R4 & R5: Camera cranes down onto invitation tray — lift badge out of frame
        const t = r4 > 0 || r5 > 0 ? 1 : THREE.MathUtils.smoothstep(r3, 0.6, 0.95);
        choreoPos.current.set(0, THREE.MathUtils.lerp(1.7, 3.8, t), 0.6);
        choreoScale.current = THREE.MathUtils.lerp(targetScale, 0, t);
      } else {
        choreoPos.current.set(0, 1.7, 0.6);
        choreoScale.current = THREE.MathUtils.damp(choreoScale.current, targetScale, 8, delta);
      }
      choreoYaw.current = THREE.MathUtils.damp(choreoYaw.current, 0, 8, delta);
    } else if (world === 'diwali') {
      const d1 = frame.dampedProgress['D1'] ?? frame.dampedProgress['d1'] ?? 0;
      const d2 = frame.dampedProgress['D2'] ?? frame.dampedProgress['d2'] ?? 0;
      const d3 = frame.dampedProgress['D3'] ?? frame.dampedProgress['d3'] ?? 0;
      const d4 = frame.dampedProgress['D4'] ?? frame.dampedProgress['d4'] ?? 0;
      const d5 = frame.dampedProgress['D5'] ?? frame.dampedProgress['d5'] ?? 0;

      const targetScale = isMobile ? 0.76 : 0.92;

      if (d5 > 0.05) {
        // D5: Outro — badge returns centered among diyas and petals
        const t = THREE.MathUtils.smoothstep(d5, 0, 0.5);
        choreoPos.current.set(0, THREE.MathUtils.lerp(0.3, 1.7, t), 0);
        choreoScale.current = THREE.MathUtils.lerp(0, targetScale * 0.75, t);
      } else if (d1 < 0.7 && d2 === 0 && d3 === 0 && d4 === 0) {
        // D1: Hero jewelled badge
        choreoPos.current.set(0, 1.7, 0);
        choreoScale.current = THREE.MathUtils.damp(choreoScale.current, targetScale, 8, delta);
      } else {
        // D2, D3, D4: Descend & hide badge to clear stage for story text, sky fireworks, and 3D card
        const t = d2 > 0 ? 1 : THREE.MathUtils.smoothstep(d1, 0.7, 0.95);
        choreoPos.current.set(0, THREE.MathUtils.lerp(1.7, 0.3, t), 0);
        choreoScale.current = THREE.MathUtils.lerp(targetScale, 0, t);
      }
      choreoYaw.current = THREE.MathUtils.damp(choreoYaw.current, 0, 8, delta);
    }

    // 5. Apply transitions choreo override (Part 10 T1/T2)
    if (tr.phase !== 'idle') {
      const p = tr.t;
      let targetPosY = choreoPos.current.y;
      let targetYaw = 0;
      let targetScale = choreoScale.current;

      if (tr.type === 'T1') {
        if (p < 0.25) {
          const t = p / 0.25;
          targetScale = THREE.MathUtils.lerp(0.52, 0.7, t);
          targetPosY = THREE.MathUtils.lerp(2.65, 2.0, t);
        } else if (p < 0.75) {
          const t = (p - 0.25) / 0.5;
          targetScale = 0.7;
          targetPosY = 2.0;
          targetYaw = t * Math.PI * 2;
        } else {
          const t = (p - 0.75) / 0.25;
          targetScale = THREE.MathUtils.lerp(0.7, 0.95, t);
          targetPosY = THREE.MathUtils.lerp(2.0, 1.7, t);
        }
      } else if (tr.type === 'T2') {
        targetPosY = 1.7;
        targetScale = 0.95;
        targetYaw = p * Math.PI * 2;
      } else if (tr.type === 'T3') {
        const t = Math.min(1, p / 0.8);
        targetPosY = THREE.MathUtils.lerp(1.7, 2.65, t);
        targetScale = THREE.MathUtils.lerp(0.95, 0.52, t);
      }

      // Frame-rate independent damp
      choreoPos.current.y = THREE.MathUtils.damp(choreoPos.current.y, targetPosY, 8, delta);
      choreoYaw.current = THREE.MathUtils.damp(choreoYaw.current, targetYaw, 8, delta);
      choreoScale.current = THREE.MathUtils.damp(choreoScale.current, targetScale, 8, delta);
    }

    rootRef.current.scale.setScalar(choreoScale.current * popScale);

    // 6. Update autonomous and interactive behaviours with choreography
    behaviours.update(
      rootRef.current,
      currentNodes.eyeL,
      currentNodes.eyeR,
      currentNodes.tongue,
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

    // 7. Neon emissive flicker (Red Room) preserving original GLB emissiveIntensity ratio without white-clipping
    if ((activeSkinRef.current === 'neon' || outgoingSkinRef.current === 'neon') && neonPrepared.neonMaterials.length > 0) {
      const flicker = 1.0 + Math.sin(frame.time * 24.0) * 0.08 * (Math.sin(frame.time * 7.3) > 0 ? 1 : 0);
      neonPrepared.neonMaterials.forEach((m) => {
        const base = Math.min(1.75, m.userData.baseEmissiveIntensity ?? 1.0);
        m.emissiveIntensity = base * flicker;
      });
    }

    // 8. Neon drips extension animation per Part 5.2
    if ((activeSkinRef.current === 'neon' || outgoingSkinRef.current === 'neon') && neonPrepared.animatedNodes.drips) {
      const cycle = (frame.time % 8.0) / 8.0;
      neonPrepared.animatedNodes.drips.scale.y = 1.0 + Math.sin(cycle * Math.PI * 2) * 0.06 + 0.06;
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
      {/* Pre-mounted Enamel Skin GLB (Home - Pink) */}
      <group ref={enamelGroupRef} name="EnamelSkin" visible={targetSkin === 'enamel'}>
        <primitive object={enamelPrepared.clone} />
      </group>

      {/* Pre-mounted Neon Skin GLB (The Red Room - Red) */}
      <group ref={neonGroupRef} name="NeonSkin" visible={targetSkin === 'neon'}>
        <primitive object={neonPrepared.clone} />
      </group>

      {/* Pre-mounted Jewelled Skin GLB (Diwali - Jewelled Pink & Gold) */}
      <group ref={jewelledGroupRef} name="JewelledSkin" visible={targetSkin === 'jewelled'}>
        <primitive object={jewelledPrepared.clone} />
      </group>

      {/* Directional Sparkle Glints on Pavé Diamond Face for Jewelled Skin */}
      <SparkleGlints active={activeSkinRef.current === 'jewelled'} />
    </group>
  );
}
