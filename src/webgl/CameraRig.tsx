'use client';

import { useRef, useMemo } from 'react';
import * as THREE from 'three';
import { useFrame, useThree } from '@react-three/fiber';
import { frame } from '@/state/frame';
import { useStore } from '@/state/store';
import { createNoise2D } from 'simplex-noise';

// Spline definitions per BRIEF.md Part 7, 8, 9

const HOME_CAM_POINTS = [
  new THREE.Vector3(-0.6, 1.5, 6.5),  // H1: Hero (lens shifted to right third)
  new THREE.Vector3(0.0, 1.6, 5.8),   // H2: Who we are (centred eye level)
  new THREE.Vector3(0.0, 1.8, 6.8),   // H3: Nights we've thrown (wide)
  new THREE.Vector3(0.0, 1.9, 6.2),   // H4: This season (rim light stage)
  new THREE.Vector3(0.0, 1.6, 5.6),   // H5: Two worlds doors
  new THREE.Vector3(0.0, 1.7, 6.5),   // H6: Footer
];

const HOME_LOOK_POINTS = [
  new THREE.Vector3(0.3, 1.5, 0.0),   // H1: Look at badge on right third
  new THREE.Vector3(0.0, 1.5, 0.0),   // H2: Look at badge
  new THREE.Vector3(0.0, 1.4, 0.0),   // H3: Stage centre
  new THREE.Vector3(0.0, 1.5, 0.0),   // H4: Stage centre
  new THREE.Vector3(0.0, 1.4, 0.0),   // H5: Doors centre
  new THREE.Vector3(0.0, 1.5, 0.0),   // H6: Centre
];

const REDROOM_CAM_POINTS = [
  new THREE.Vector3(0.0, 1.7, 7.5),   // R1: Title & smoke dragon
  new THREE.Vector3(0.0, 1.8, 4.4),   // R2: Mirror
  new THREE.Vector3(-1.3, 1.75, 4.8), // R3: Dress code / candelabras on plinths
  new THREE.Vector3(0.0, 1.38, 3.25), // R4: Invitation tray on round table at (0, 0.85, 2.2)
  new THREE.Vector3(0.0, 2.2, 8.0),   // R5: Wide partners
  new THREE.Vector3(0.0, 1.8, 6.0),   // R6: Outro
];

const REDROOM_LOOK_POINTS = [
  new THREE.Vector3(0.0, 1.68, 0.6),  // R1: Badge at (0, 1.7, 0.6) level-framed, table in lower quarter
  new THREE.Vector3(0.0, 1.5, -0.6),  // R2: Mirror at (0, 0.3, -0.6)
  new THREE.Vector3(-1.6, 1.65, 0.2), // R3: Left candelabra on plinth
  new THREE.Vector3(0.0, 0.90, 2.2),  // R4: Down onto tray on table at (0, 0.85, 2.2)
  new THREE.Vector3(0.0, 1.5, 0.0),   // R5: Wide
  new THREE.Vector3(0.0, 1.7, 0.0),   // R6: Badge and mirror
];

const DIWALI_CAM_POINTS = [
  new THREE.Vector3(0.0, 1.8, 6.2),   // D1: Jewelled badge
  new THREE.Vector3(0.0, 2.0, 5.5),   // D2: Fireworks & sky reveal
  new THREE.Vector3(0.0, 1.4, 3.2),   // D3: Gold invitation card
  new THREE.Vector3(0.0, 1.7, 4.5),   // D4: Teaser cinema lightbox
  new THREE.Vector3(0.0, 1.8, 6.0),   // D5: Outro
];

const DIWALI_LOOK_POINTS = [
  new THREE.Vector3(0.0, 1.9, 0.0),   // D1: Jewelled badge
  new THREE.Vector3(0.0, 2.4, 0.0),   // D2: Sky & fireworks
  new THREE.Vector3(0.0, 1.3, 1.2),   // D3: Gold card
  new THREE.Vector3(0.0, 1.6, 0.0),   // D4: Teaser lightbox
  new THREE.Vector3(0.0, 1.9, 0.0),   // D5: Outro
];

export function CameraRig() {
  const { camera, size } = useThree();
  const world = useStore((s) => s.world);
  const motionEnabled = useStore((s) => s.motionEnabled);

  // Curves
  const homeCurves = useMemo(() => ({
    cam: new THREE.CatmullRomCurve3(HOME_CAM_POINTS),
    look: new THREE.CatmullRomCurve3(HOME_LOOK_POINTS),
  }), []);

  const redroomCurves = useMemo(() => ({
    cam: new THREE.CatmullRomCurve3(REDROOM_CAM_POINTS),
    look: new THREE.CatmullRomCurve3(REDROOM_LOOK_POINTS),
  }), []);

  const diwaliCurves = useMemo(() => ({
    cam: new THREE.CatmullRomCurve3(DIWALI_CAM_POINTS),
    look: new THREE.CatmullRomCurve3(DIWALI_LOOK_POINTS),
  }), []);

  const noise2D = useMemo(() => createNoise2D(), []);

  // Reusable vectors for zero allocation per frame (Part 5.1 & Part 13.4)
  const currentPos = useRef(new THREE.Vector3(-0.6, 1.5, 6.5));
  const currentLook = useRef(new THREE.Vector3(0.3, 1.5, 0.0));
  const targetPos = useRef(new THREE.Vector3());
  const targetLook = useRef(new THREE.Vector3());

  // Frame priority -40 per Part 13.3 (Director -50 -> CameraRig -40 -> Badge -30 -> Sets -20)
  useFrame((_, delta) => {
    const isPortrait = size.width < size.height;
    const tr = frame.transition;

    // T1 FOV +6° during doorway push (Part 10 T1: 0.25–1.05 s)
    let fovBoost = 0;
    if (motionEnabled && tr.type === 'T1' && world === 'home') {
      fovBoost = 6 * Math.sin(tr.dollyProgress * Math.PI);
    }

    const baseFov = 34 + (isPortrait ? 8 : 0) + fovBoost;

    if (camera instanceof THREE.PerspectiveCamera) {
      if (Math.abs(camera.fov - baseFov) > 0.01) {
        camera.fov = baseFov;
        camera.updateProjectionMatrix();
      }
    }

    // Determine normalized scroll progress along current world's scenes
    let tProgress = 0;
    let curves = homeCurves;

    if (world === 'redroom') {
      curves = redroomCurves;
      const r1 = frame.dampedProgress['R1'] ?? frame.dampedProgress['r1'] ?? 0;
      const r2 = frame.dampedProgress['R2'] ?? frame.dampedProgress['r2'] ?? 0;
      const r3 = frame.dampedProgress['R3'] ?? frame.dampedProgress['r3'] ?? 0;
      const r4 = frame.dampedProgress['R4'] ?? frame.dampedProgress['r4'] ?? 0;
      const r5 = frame.dampedProgress['R5'] ?? frame.dampedProgress['r5'] ?? 0;
      const r6 = frame.dampedProgress['R6'] ?? frame.dampedProgress['r6'] ?? 0;
      tProgress = THREE.MathUtils.clamp((r1 * 0.15 + r2 * 0.2 + r3 * 0.2 + r4 * 0.25 + r5 * 0.1 + r6 * 0.1), 0, 1);
    } else if (world === 'diwali') {
      curves = diwaliCurves;
      const d1 = frame.dampedProgress['D1'] ?? frame.dampedProgress['d1'] ?? 0;
      const d2 = frame.dampedProgress['D2'] ?? frame.dampedProgress['d2'] ?? 0;
      const d3 = frame.dampedProgress['D3'] ?? frame.dampedProgress['d3'] ?? 0;
      const d4 = frame.dampedProgress['D4'] ?? frame.dampedProgress['d4'] ?? 0;
      const d5 = frame.dampedProgress['D5'] ?? frame.dampedProgress['d5'] ?? 0;
      tProgress = THREE.MathUtils.clamp((d1 * 0.2 + d2 * 0.3 + d3 * 0.25 + d4 * 0.15 + d5 * 0.1), 0, 1);
    } else {
      curves = homeCurves;
      const h1 = frame.dampedProgress['H1'] ?? frame.dampedProgress['h1'] ?? 0;
      const h2 = frame.dampedProgress['H2'] ?? frame.dampedProgress['h2'] ?? 0;
      const h3 = frame.dampedProgress['H3'] ?? frame.dampedProgress['h3'] ?? 0;
      const h4 = frame.dampedProgress['H4'] ?? frame.dampedProgress['h4'] ?? 0;
      const h5 = frame.dampedProgress['H5'] ?? frame.dampedProgress['h5'] ?? 0;
      tProgress = THREE.MathUtils.clamp((h1 * 0.2 + h2 * 0.3 + h3 * 0.15 + h4 * 0.2 + h5 * 0.15), 0, 1);
    }

    // Sample Catmull-Rom curve
    curves.cam.getPoint(tProgress, targetPos.current);
    curves.look.getPoint(tProgress, targetLook.current);

    // Part 12.1 Phones / Portrait re-framing:
    // - No horizontal lens shift
    // - Monument in the upper 55–60% of the screen, copy in the lower 40%
    // - +8° vFOV + pull camera back slightly
    if (isPortrait) {
      if (world === 'home' && tProgress < 0.25) {
        // Eliminate horizontal lens shift on Home H1 -> H2
        const blend = THREE.MathUtils.clamp(tProgress / 0.2, 0, 1);
        targetPos.current.x *= blend;
        targetLook.current.x *= blend;
      }
      const h5Pullback = world === 'home' ? (frame.dampedProgress['H5'] ?? 0) * 0.65 : 0;
      targetPos.current.z += 0.35 + h5Pullback;
      targetLook.current.y -= 0.15;
    }

    // Apply Part 10 Transition camera moves (driven one-way by frame.transition)
    if (motionEnabled) {
      if (tr.type === 'T1' && tr.dollyProgress > 0) {
        // Part 10 T1: Camera pushes through left doorway at (-1.45, 0, 0)
        const dp = tr.dollyProgress;
        targetPos.current.x = THREE.MathUtils.lerp(targetPos.current.x, -1.45, dp);
        targetPos.current.y = THREE.MathUtils.lerp(targetPos.current.y, 1.5, dp);
        targetPos.current.z -= 3.2 * dp;
        targetLook.current.x = THREE.MathUtils.lerp(targetLook.current.x, -1.45, dp);
        targetLook.current.y = THREE.MathUtils.lerp(targetLook.current.y, 1.5, dp);
        targetLook.current.z = THREE.MathUtils.lerp(targetLook.current.z, -1.5, dp);
      } else if (tr.type === 'T2' && tr.dollyProgress > 0) {
        // Part 10 T2: Camera pushes into right Diwali doorway at (1.45, 0, 0)
        const dp = tr.dollyProgress;
        targetPos.current.x = THREE.MathUtils.lerp(targetPos.current.x, 1.45, dp);
        targetPos.current.y = THREE.MathUtils.lerp(targetPos.current.y, 1.5, dp);
        targetPos.current.z -= 3.0 * dp;
        targetLook.current.x = THREE.MathUtils.lerp(targetLook.current.x, 1.45, dp);
        targetLook.current.y = THREE.MathUtils.lerp(targetLook.current.y, 1.5, dp);
        targetLook.current.z = THREE.MathUtils.lerp(targetLook.current.z, -1.5, dp);
      } else if (tr.type === 'T4' && tr.phase === 'exit' && tr.dollyProgress > 0) {
        // Part 10 T4 (0.00–0.60 s): Camera pulls back fast while world fades to darkest colour
        targetPos.current.z += 3.6 * tr.dollyProgress;
      }
    }

    // Parallax: On portrait/phones, scroll-linked parallax of ±0.1 replaces cursor parallax (Part 12.1)
    const parallaxX = !motionEnabled
      ? 0
      : isPortrait
        ? 0
        : frame.pointer.damped.x * 0.2;
    const parallaxY = !motionEnabled
      ? 0
      : isPortrait
        ? THREE.MathUtils.clamp((0.5 - tProgress) * 0.2, -0.1, 0.1)
        : frame.pointer.damped.y * 0.12;

    // Idle drift: ~3.5 cm amplitude via simplex noise (Part 13.3)
    const t = frame.time;
    const driftX = motionEnabled ? noise2D(t * 0.12, 10) * 0.035 : 0;
    const driftY = motionEnabled ? noise2D(t * 0.12, 20) * 0.025 : 0;

    targetPos.current.x += parallaxX + driftX;
    targetPos.current.y += parallaxY + driftY;

    if (frame.snapCamera) {
      currentPos.current.copy(targetPos.current);
      currentLook.current.copy(targetLook.current);
    } else {
      // Smoothly damp camera transform with lambda = 12
      currentPos.current.x = THREE.MathUtils.damp(currentPos.current.x, targetPos.current.x, 12, delta);
      currentPos.current.y = THREE.MathUtils.damp(currentPos.current.y, targetPos.current.y, 12, delta);
      currentPos.current.z = THREE.MathUtils.damp(currentPos.current.z, targetPos.current.z, 12, delta);

      currentLook.current.x = THREE.MathUtils.damp(currentLook.current.x, targetLook.current.x, 12, delta);
      currentLook.current.y = THREE.MathUtils.damp(currentLook.current.y, targetLook.current.y, 12, delta);
      currentLook.current.z = THREE.MathUtils.damp(currentLook.current.z, targetLook.current.z, 12, delta);
    }

    camera.position.copy(currentPos.current);
    camera.lookAt(currentLook.current);
  }, -40);

  return null;
}
