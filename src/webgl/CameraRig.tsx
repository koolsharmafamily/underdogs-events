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
  new THREE.Vector3(0.0, 1.8, 4.2),   // R2: Mirror
  new THREE.Vector3(-2.2, 1.7, 3.6),  // R3: Dress code / left candelabra
  new THREE.Vector3(0.0, 1.15, 2.4),  // R4: Invitation tray
  new THREE.Vector3(0.0, 2.2, 8.0),   // R5: Wide partners
  new THREE.Vector3(0.0, 1.8, 6.0),   // R6: Outro
];

const REDROOM_LOOK_POINTS = [
  new THREE.Vector3(0.0, 1.7, 0.0),   // R1: Badge
  new THREE.Vector3(0.0, 1.8, 0.0),   // R2: Mirror
  new THREE.Vector3(-3.0, 1.6, 0.6),  // R3: Candelabra
  new THREE.Vector3(0.0, 0.95, 1.4),  // R4: Down 25° at tray
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
  const currentPos = useRef(new THREE.Vector3());
  const currentLook = useRef(new THREE.Vector3());
  const targetPos = useRef(new THREE.Vector3());
  const targetLook = useRef(new THREE.Vector3());

  // Frame priority -40 per Part 13.3 (Director -50 -> CameraRig -40 -> Badge -30 -> Sets -20)
  useFrame((_, delta) => {
    const isPortrait = size.width < size.height;
    const baseFov = 34 + (isPortrait ? 8 : 0);

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

    // Cursor parallax: ±0.2 X, ±0.12 Y (Part 13.3)
    const parallaxX = frame.pointer.damped.x * 0.2;
    const parallaxY = frame.pointer.damped.y * 0.12;

    // Idle drift: ~3.5 cm amplitude via simplex noise (Part 13.3)
    const t = frame.time;
    const driftX = noise2D(t * 0.12, 10) * 0.035;
    const driftY = noise2D(t * 0.12, 20) * 0.025;

    targetPos.current.x += parallaxX + driftX;
    targetPos.current.y += parallaxY + driftY;

    // Smoothly damp camera transform with lambda = 6
    currentPos.current.x = THREE.MathUtils.damp(currentPos.current.x, targetPos.current.x, 6, delta);
    currentPos.current.y = THREE.MathUtils.damp(currentPos.current.y, targetPos.current.y, 6, delta);
    currentPos.current.z = THREE.MathUtils.damp(currentPos.current.z, targetPos.current.z, 6, delta);

    currentLook.current.x = THREE.MathUtils.damp(currentLook.current.x, targetLook.current.x, 6, delta);
    currentLook.current.y = THREE.MathUtils.damp(currentLook.current.y, targetLook.current.y, 6, delta);
    currentLook.current.z = THREE.MathUtils.damp(currentLook.current.z, targetLook.current.z, 6, delta);

    camera.position.copy(currentPos.current);
    camera.lookAt(currentLook.current);
  }, -40);

  return null;
}
