"use client";

import React, { Suspense, useRef, useMemo, useEffect, useState } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import { badgeScreenBounds } from "./screenBounds";
import { composition } from "../composition";
import { frame } from "@/state/frame";
import { useStore } from "@/state/store";
import { SkinId, DISSOLVE_EDGES } from "./skins";
import { DissolveUniforms, injectDissolve } from "./dissolve.glsl";
import { BadgeBehaviours } from "./behaviours";
import { SparkleGlints } from "./SparkleGlints";
import { batchStaticSiblings } from "../batchStaticSiblings";
import { coinSpin } from "./coinPhysics";

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

const EMPTY_ANIMATED_NODES = {
  eyeL: null as THREE.Group | null,
  eyeR: null as THREE.Group | null,
  tongue: null as THREE.Group | null,
  drips: null as THREE.Mesh | null,
};

function prepareBadgeScene(
  sourceScene: THREE.Group,
  uniforms: DissolveUniforms,
  backTexture: THREE.CanvasTexture | null,
  skinName: SkinId,
): PreparedScene {
  const clone = sourceScene.clone(true);
  const animatedNodes = {
    eyeL: null as THREE.Group | null,
    eyeR: null as THREE.Group | null,
    tongue: null as THREE.Group | null,
    drips: null as THREE.Mesh | null,
  };
  const neonMaterials: THREE.MeshStandardMaterial[] = [];
  const materials = new Map<string, THREE.MeshStandardMaterial>();

  clone.traverse((child) => {
    if ((child as THREE.Mesh).isMesh) {
      const mesh = child as THREE.Mesh;
      mesh.castShadow = false;
      mesh.receiveShadow = false;

      if (mesh.material) {
        const origMat = Array.isArray(mesh.material)
          ? mesh.material[0]
          : mesh.material;
        const key = origMat.uuid + (mesh.name === "Back" ? ":back" : "");
        const mat =
          materials.get(key) ??
          ((origMat as THREE.Material).clone() as THREE.MeshStandardMaterial);
        materials.set(key, mat);

        // Apply authentic engraved back texture bump relief (BRIEF.md Part 7 H2)
        if (mesh.name === "Back" && backTexture) {
          mat.bumpMap = backTexture;
          mat.bumpScale = 0.04;
          mat.needsUpdate = true;
        }

        // Configure Neon Reference 2 materials for Red Room
        if (skinName === "neon") {
          if (origMat.name === "Neon_Glyph_Fill") {
            mat.color.set("#FFF8F6");
            mat.emissive.set("#FF2A1F");
            mat.emissiveIntensity = 4.2;
            mat.userData.baseEmissiveIntensity = 4.2;
          } else if (origMat.name === "Neon_Glass_Red") {
            mat.color.set("#FF1E0C");
            mat.emissive.set("#FF2414");
            mat.emissiveIntensity = 4.8;
            mat.userData.baseEmissiveIntensity = 4.8;
          } else if (
            origMat.name === "Black_Glass" ||
            origMat.name === "Black_Lacquer" ||
            origMat.name === "Smoked_Black_Glass"
          ) {
            mat.color.set("#0A0203");
            mat.roughness = 0.08;
            mat.metalness = 0.2;
          } else if (origMat.name === "Blood_Gloss") {
            mat.color.set("#9A0610");
            mat.emissive.set("#5A0208");
            mat.emissiveIntensity = 1.5;
            mat.userData.baseEmissiveIntensity = 1.5;
          }
          mat.needsUpdate = true;
        }

        // Inject dissolve shader without modifying original material colours or properties
        injectDissolve(mat, uniforms);
        mesh.material = mat;

        // Collect neon emissive materials for dynamic flicker
        if (
          mat.emissive &&
          (mat.emissive.r > 0 || mat.emissive.g > 0 || mat.emissive.b > 0)
        ) {
          if (mat.userData.baseEmissiveIntensity === undefined) {
            mat.userData.baseEmissiveIntensity = mat.emissiveIntensity ?? 1.0;
          }
          if (!neonMaterials.includes(mat)) neonMaterials.push(mat);
        }
      }
    }

    if (child.name === "Eye_L" && (child as THREE.Group).isGroup)
      animatedNodes.eyeL = child as THREE.Group;
    if (child.name === "Eye_R" && (child as THREE.Group).isGroup)
      animatedNodes.eyeR = child as THREE.Group;
    if (child.name === "Tongue" && (child as THREE.Group).isGroup)
      animatedNodes.tongue = child as THREE.Group;
    if (child.name === "Drips" && (child as THREE.Mesh).isMesh)
      animatedNodes.drips = child as THREE.Mesh;
  });

  batchStaticSiblings(clone);
  return { clone, animatedNodes, neonMaterials };
}

function BadgeSkinMesh({
  url,
  skinName,
  uniforms,
  backTexture,
  preparedMapRef,
}: {
  url: string;
  skinName: SkinId;
  uniforms: DissolveUniforms;
  backTexture: THREE.CanvasTexture | null;
  preparedMapRef: React.MutableRefObject<Record<SkinId, PreparedScene | null>>;
}) {
  const gltf = useGLTF(url);
  const prepared = useMemo(
    () => prepareBadgeScene(gltf.scene, uniforms, backTexture, skinName),
    [gltf.scene, uniforms, backTexture, skinName],
  );

  preparedMapRef.current[skinName] = prepared;

  return <primitive object={prepared.clone} />;
}

export function Badge({
  position = [0, 1.5, 0],
  rotation = [0, 0, 0],
  scale = 1,
}: BadgeProps) {
  const { size, camera } = useThree();
  const rootRef = useRef<THREE.Group>(null);

  // Groups for each skin
  const enamelGroupRef = useRef<THREE.Group>(null);
  const neonGroupRef = useRef<THREE.Group>(null);
  const jewelledGroupRef = useRef<THREE.Group>(null);

  const preparedMapRef = useRef<Record<SkinId, PreparedScene | null>>({
    enamel: null,
    neon: null,
    jewelled: null,
  });

  const world = useStore((s) => s.world);
  const phase = useStore((s) => s.phase);
  const targetSkinOverride = useStore((s) => s.targetSkinOverride);
  const motionEnabled = useStore((s) => s.motionEnabled);
  const hoverDoor = useStore((s) => s.hoverDoor);
  const blinkTrigger = useStore((s) => s.blinkTrigger);
  const triggerBlink = useStore((s) => s.triggerBlink);

  // Initial and target skin mapping
  const worldSkin: SkinId =
    world === "redroom" ? "neon" : world === "diwali" ? "jewelled" : "enamel";
  const targetSkin: SkinId = targetSkinOverride ?? worldSkin;

  // Only mount the active skin on initial load so we don't block on 4.2MB of other worlds' badges
  const [mountedSkins, setMountedSkins] = useState<Record<SkinId, boolean>>(
    () => ({
      enamel: targetSkin === "enamel",
      neon: targetSkin === "neon",
      jewelled: targetSkin === "jewelled",
    }),
  );

  useEffect(() => {
    setMountedSkins((prev) =>
      prev[targetSkin] ? prev : { ...prev, [targetSkin]: true },
    );
  }, [targetSkin]);

  // Lifecycle state tracking via REFS ONLY (zero React re-renders mid-transition)
  const activeSkinRef = useRef<SkinId>(targetSkin);
  const outgoingSkinRef = useRef<SkinId | null>(null);
  const isDissolvingRef = useRef(false);
  const dissolveProgress = useRef(-0.1);
  const dissolveDuration = useRef(0.8);

  // Shared dissolve uniforms per skin created ONCE at mount
  const enamelUniforms: DissolveUniforms = useMemo(
    () => ({
      uDissolve: { value: -0.1 },
      uRole: { value: 1.0 },
      uEdgeColor: { value: DISSOLVE_EDGES.enamel.color.clone() },
      uEdgeIntensity: { value: DISSOLVE_EDGES.enamel.intensity },
      uEdgeWidth: { value: DISSOLVE_EDGES.enamel.width },
    }),
    [],
  );

  const neonUniforms: DissolveUniforms = useMemo(
    () => ({
      uDissolve: { value: -0.1 },
      uRole: { value: 1.0 },
      uEdgeColor: { value: DISSOLVE_EDGES.neon.color.clone() },
      uEdgeIntensity: { value: DISSOLVE_EDGES.neon.intensity },
      uEdgeWidth: { value: DISSOLVE_EDGES.neon.width },
    }),
    [],
  );

  const jewelledUniforms: DissolveUniforms = useMemo(
    () => ({
      uDissolve: { value: -0.1 },
      uRole: { value: 1.0 },
      uEdgeColor: { value: DISSOLVE_EDGES.jewelled.color.clone() },
      uEdgeIntensity: { value: DISSOLVE_EDGES.jewelled.intensity },
      uEdgeWidth: { value: DISSOLVE_EDGES.jewelled.width },
    }),
    [],
  );

  // Engraved Back Canvas Texture (512x512 for 4x faster generation & GPU upload)
  const backTexture = useMemo(() => {
    if (typeof document === "undefined") return null;
    const canvas = document.createElement("canvas");
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    ctx.scale(0.5, 0.5);
    ctx.fillStyle = "#C8CCD6";
    ctx.fillRect(0, 0, 1024, 1024);

    ctx.strokeStyle = "rgba(255, 255, 255, 0.15)";
    ctx.lineWidth = 2;
    for (let y = 0; y < 1024; y += 8) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(1024, y);
      ctx.stroke();
    }

    ctx.strokeStyle = "#6E7484";
    ctx.lineWidth = 12;
    ctx.beginPath();
    ctx.arc(512, 512, 450, 0, Math.PI * 2);
    ctx.stroke();

    ctx.strokeStyle = "#8E94A4";
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.arc(512, 512, 380, 0, Math.PI * 2);
    ctx.stroke();

    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(512, 512, 240, 0, Math.PI * 2);
    ctx.stroke();

    ctx.font = "bold 50px sans-serif";
    ctx.fillStyle = "#4B505E";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    const text = "GATE TO RAGE · NAGPUR";
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

    ctx.font = "bold 64px sans-serif";
    ctx.fillStyle = "#5A6070";
    ctx.fillText("✕", 512, 512);

    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }, []);

  const getSkinGroup = (skin: SkinId) => {
    if (skin === "neon") return neonGroupRef.current;
    if (skin === "jewelled") return jewelledGroupRef.current;
    return enamelGroupRef.current;
  };

  const getSkinUniforms = (skin: SkinId) => {
    if (skin === "neon") return neonUniforms;
    if (skin === "jewelled") return jewelledUniforms;
    return enamelUniforms;
  };

  // Sync initial visibility on direct URL visit or mount
  useEffect(() => {
    const active = targetSkin;
    activeSkinRef.current = active;
    if (enamelGroupRef.current)
      enamelGroupRef.current.visible = active === "enamel";
    if (neonGroupRef.current) neonGroupRef.current.visible = active === "neon";
    if (jewelledGroupRef.current)
      jewelledGroupRef.current.visible = active === "jewelled";
  }, [targetSkin]);

  // Handle skin changes (transitions or world swaps) purely via REFS and visibility
  useEffect(() => {
    if (targetSkin !== activeSkinRef.current) {
      const prevSkin = activeSkinRef.current;
      const nextSkin = targetSkin;
      const isTransitionRunning = frame.transition.phase !== "idle";

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
      dissolveDuration.current = motionEnabled ? 0.8 : 0.3;

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

  const behaviours = useMemo(() => new BadgeBehaviours(), []);

  // Choreography state refs (reversible per Part 6.2)
  const choreoPos = useRef(
    new THREE.Vector3(position[0], position[1], position[2]),
  );
  const choreoYaw = useRef(0);
  const choreoScale = useRef(scale);
  const h2SpinDone = useRef(false);
  const screenCenter = useMemo(() => new THREE.Vector3(), []);
  const screenEdge = useMemo(() => new THREE.Vector3(), []);

  // Frame priority -30 per Part 13.3
  useFrame((_, delta) => {
    if (!rootRef.current) return;

    const tr = frame.transition;

    // 1. Advance dissolve progress (-0.1 to 1.1)
    if (isDissolvingRef.current) {
      const destinationReady = useStore.getState().renderedWorlds[world] && Boolean(preparedMapRef.current[activeSkinRef.current]);
      if (destinationReady) dissolveProgress.current += (delta * 1.2) / dissolveDuration.current;
      const curProg = dissolveProgress.current;

      if (outgoingSkinRef.current) {
        const outU = getSkinUniforms(outgoingSkinRef.current);
        outU.uDissolve.value = curProg;
      }
      const inU = getSkinUniforms(activeSkinRef.current);
      inU.uDissolve.value = destinationReady ? curProg : 0;

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

    // 2. Real coin rotational physics (full 360° spin with inertia & flutter)
    coinSpin.update(delta, frame.time);

    const popScale = 1;

    // 4. Multi-section choreography per Part 7 H0-H5, Part 8 R0-R6, Part 9 D0-D5
    const isMobile = size.width < 768;
    const isTablet = size.width >= 768 && size.width < 1024;
    const h1 = frame.dampedProgress["H1"] ?? frame.dampedProgress["h1"] ?? 0;
    const h2 = frame.dampedProgress["H2"] ?? frame.dampedProgress["h2"] ?? 0;
    const h5 = frame.dampedProgress["H5"] ?? frame.dampedProgress["h5"] ?? 0;
    const scrollP = THREE.MathUtils.clamp(
      h1 * 0.35 + h2 * 0.45 + h5 * 0.2,
      0,
      1,
    );

    if (world === "home") {
      const h0Scale = isMobile ? 0.8 : isTablet ? 0.96 : 1.12;
      const h0X = isMobile ? 0 : isTablet ? 1.32 : 1.58;
      const h0Y = isMobile ? (size.height < 700 ? 1.68 : 1.82) : 1.52;

      // H2: Keep badge firmly in the right column (x = 1.62 desktop, 1.35 tablet) and upper stage on mobile so it never overlaps text
      const h2Scale = isMobile
        ? motionEnabled
          ? 0.68
          : 0.56
        : isTablet
          ? 0.9
          : 1.06;
      const h2X = isMobile ? 0 : isTablet ? 1.35 : 1.62;
      const h2Y = isMobile ? (motionEnabled ? 2.15 : 2.35) : 1.55;

      const h5Scale = isMobile ? 0 : 0.38;
      const h5X = 0;
      const h5Y = isMobile ? 3.35 : 2.78; // Floats above and between doors on desktop; fades out on mobile stacked doors

      if (scrollP <= 0.25) {
        const t = Math.max(0, Math.min(1, scrollP / 0.25));
        const smoothT = THREE.MathUtils.smoothstep(t, 0, 1);
        choreoPos.current.set(
          THREE.MathUtils.lerp(h0X, h2X, smoothT),
          THREE.MathUtils.lerp(h0Y, h2Y, smoothT),
          0,
        );
        choreoScale.current = THREE.MathUtils.lerp(h0Scale, h2Scale, smoothT);
        choreoYaw.current = 0;
        h2SpinDone.current = false;
      } else if (scrollP <= 0.65) {
        choreoPos.current.set(h2X, h2Y, 0);
        choreoScale.current = h2Scale;
        const spinT = (scrollP - 0.25) / 0.4;
        choreoYaw.current =
          THREE.MathUtils.smoothstep(spinT, 0, 1) * Math.PI * 2;
        h2SpinDone.current = spinT >= 0.98;
      } else if (scrollP <= 0.82) {
        // Smooth glide from H2 center-right to H5 top-center above the doors
        const t = Math.max(0, Math.min(1, (scrollP - 0.65) / 0.17));
        const smoothT = THREE.MathUtils.smoothstep(t, 0, 1);
        choreoPos.current.set(
          THREE.MathUtils.lerp(h2X, h5X, smoothT),
          THREE.MathUtils.lerp(h2Y, h5Y, smoothT),
          0,
        );
        choreoScale.current = THREE.MathUtils.lerp(h2Scale, h5Scale, smoothT);
        choreoYaw.current = Math.PI * 2;
      } else {
        // H5: Badge floats above and between both doors at (0, 2.78, 0)
        choreoPos.current.set(h5X, h5Y, 0);
        choreoScale.current = h5Scale;
        choreoYaw.current = Math.PI * 2;
      }
    } else if (world === "redroom") {
      const r1 = frame.dampedProgress["R1"] ?? frame.dampedProgress["r1"] ?? 0;
      const r2 = frame.dampedProgress["R2"] ?? frame.dampedProgress["r2"] ?? 0;
      const r3 = frame.dampedProgress["R3"] ?? frame.dampedProgress["r3"] ?? 0;
      const r4 = frame.dampedProgress["R4"] ?? frame.dampedProgress["r4"] ?? 0;
      const r5 = frame.dampedProgress["R5"] ?? frame.dampedProgress["r5"] ?? 0;
      const r6 = frame.dampedProgress["R6"] ?? frame.dampedProgress["r6"] ?? 0;
      const targetScale = isMobile ? 0.68 : 0.82;

      if (r6 > 0.05) {
        // R6: Outro — badge returns in upper stage above outro text
        const t = THREE.MathUtils.smoothstep(r6, 0.05, 0.4);
        choreoPos.current.set(0, THREE.MathUtils.lerp(3.8, 2.15, t), 0.6);
        choreoScale.current = THREE.MathUtils.lerp(0, targetScale * 0.72, t);
      } else if (r2 > 0 || r3 > 0 || r4 > 0 || r5 > 0 || r1 > 0.72) {
        // R2, R3, R4, R5: Lift badge out of frame so mirror fog, story text, dress code, and invitation never overlap
        const t =
          r2 > 0 || r3 > 0 || r4 > 0 || r5 > 0
            ? 1
            : THREE.MathUtils.smoothstep(r1, 0.72, 0.96);
        choreoPos.current.set(0, THREE.MathUtils.lerp(1.92, 3.8, t), 0.6);
        choreoScale.current = THREE.MathUtils.lerp(targetScale, 0, t);
      } else {
        // R1: Hero neon badge positioned in upper half above the lower-half "THE RED ROOM" title
        choreoPos.current.set(0, 1.92, 0.6);
        choreoScale.current = THREE.MathUtils.damp(
          choreoScale.current,
          targetScale,
          8,
          delta,
        );
      }
      choreoYaw.current = THREE.MathUtils.damp(choreoYaw.current, 0, 8, delta);
    } else if (world === "diwali") {
      const d1 = frame.dampedProgress["D1"] ?? frame.dampedProgress["d1"] ?? 0;
      const d2 = frame.dampedProgress["D2"] ?? frame.dampedProgress["d2"] ?? 0;
      const d3 = frame.dampedProgress["D3"] ?? frame.dampedProgress["d3"] ?? 0;
      const d4 = frame.dampedProgress["D4"] ?? frame.dampedProgress["d4"] ?? 0;
      const d5 = frame.dampedProgress["D5"] ?? frame.dampedProgress["d5"] ?? 0;

      const targetScale = isMobile ? 0.66 : 0.8;

      if (d5 > 0.05) {
        // D5: Outro — badge returns in upper stage above outro text
        const t = THREE.MathUtils.smoothstep(d5, 0, 0.5);
        choreoPos.current.set(0, THREE.MathUtils.lerp(0.3, 2.35, t), 0);
        choreoScale.current = THREE.MathUtils.lerp(0, targetScale * 0.7, t);
      } else if (d1 < 0.7 && d2 === 0 && d3 === 0 && d4 === 0) {
        // D1: Hero jewelled badge in upper stage (y = 2.28, above camera lookAt y = 1.9) so it sits cleanly above the "Diwali" title
        choreoPos.current.set(0, 2.28, 0);
        choreoScale.current = THREE.MathUtils.damp(
          choreoScale.current,
          targetScale,
          8,
          delta,
        );
      } else {
        // D2, D3, D4: Descend & hide badge to clear stage for story text, sky fireworks, and 3D card
        const t = d2 > 0 ? 1 : THREE.MathUtils.smoothstep(d1, 0.7, 0.95);
        choreoPos.current.set(0, THREE.MathUtils.lerp(2.28, 0.3, t), 0);
        choreoScale.current = THREE.MathUtils.lerp(targetScale, 0, t);
      }
      choreoYaw.current = THREE.MathUtils.damp(choreoYaw.current, 0, 8, delta);
    }

    // Framing changes only transforms, preserving the supplied GLB materials.
    if (composition.hero) {
      if (world === "home") {
        choreoPos.current.set(isMobile ? 0 : 1.75, isMobile ? 2.18 : 1.8, 0);
        choreoScale.current = isMobile ? 1.0 : isTablet ? 1.35 : 1.9;
      } else {
        choreoPos.current.set(
          0,
          world === "redroom" ? 2.22 : 2.38,
          world === "redroom" ? 0.6 : 0,
        );
        choreoScale.current = isMobile ? 0.84 : 1.85;
      }
    } else if (composition.scene === "H2") {
      choreoPos.current.set(isMobile ? 0 : 1.75, isMobile ? 2.65 : 1.85, 0);
      choreoScale.current = isMobile ? 0.7 : 1.6;
      choreoYaw.current = 0.12;
    } else if (composition.scene === "R6" || composition.scene === "D5") {
      choreoPos.current.set(0, 2.75, world === "redroom" ? 0.6 : 0);
      choreoScale.current = isMobile ? 0.55 : 0.85;
    }

    // One continuous badge move: exit to the centre, hold while assets prepare,
    // then settle into the destination composition.
    if (motionEnabled && tr.phase !== 'idle') {
      const travelScale = isMobile ? .72 : 1.25;
      if (tr.phase === 'exit') {
        const p = THREE.MathUtils.smoothstep(tr.elapsed / Math.max(.01,tr.coverTime),0,1);
        choreoPos.current.x = THREE.MathUtils.lerp(choreoPos.current.x,0,p);
        choreoPos.current.y = THREE.MathUtils.lerp(choreoPos.current.y,1.95,p);
        choreoPos.current.z = THREE.MathUtils.lerp(choreoPos.current.z,.6,p);
        choreoScale.current = THREE.MathUtils.lerp(choreoScale.current,travelScale,p);
        choreoYaw.current = Math.sin(p*Math.PI)*.35;
      } else if (tr.phase === 'covered') {
        choreoPos.current.set(0,1.95,.6);
        choreoScale.current=travelScale;
        choreoYaw.current=0;
      } else {
        const p=THREE.MathUtils.smoothstep((tr.elapsed-tr.coverTime)/Math.max(.01,tr.duration-tr.coverTime),0,1);
        choreoPos.current.x *= p;
        choreoPos.current.y=THREE.MathUtils.lerp(1.95,choreoPos.current.y,p);
        choreoPos.current.z=THREE.MathUtils.lerp(.6,choreoPos.current.z,p);
        choreoScale.current=THREE.MathUtils.lerp(travelScale,choreoScale.current,p);
      }
    }

    rootRef.current.scale.setScalar(
      frame.snapCamera || phase !== "complete"
        ? choreoScale.current
        : THREE.MathUtils.damp(
            rootRef.current.scale.x,
            choreoScale.current * popScale,
            12,
            delta,
          ),
    );

    const activePrepared = preparedMapRef.current[activeSkinRef.current];
    const currentNodes = activePrepared
      ? activePrepared.animatedNodes
      : EMPTY_ANIMATED_NODES;

    // 6. Update autonomous and interactive behaviours with choreography
    behaviours.update(
      rootRef.current,
      currentNodes.eyeL,
      currentNodes.eyeR,
      currentNodes.tongue,
      {
        time: frame.time,
        dt: motionEnabled && phase === "complete" ? delta : 0,
        pointer: {
          x: frame.pointer.damped.x,
          y: frame.pointer.damped.y,
          lastMoveTime: frame.pointer.lastMoveTime,
        },
        hoverDoor,
        dragVelocity: coinSpin.velocity,
        dragRotationY: coinSpin.angleY,
        isDragging: coinSpin.isDragging,
        wobbleX: coinSpin.wobbleX,
        manualBlinkTrigger: blinkTrigger,
        choreoYaw: choreoYaw.current,
        choreoPos: choreoPos.current,
      },
    );

    screenCenter.copy(rootRef.current.position).project(camera);
    screenEdge.copy(rootRef.current.position);
    screenEdge.x += rootRef.current.scale.x * 0.52;
    screenEdge.project(camera);
    badgeScreenBounds.x = (screenCenter.x * 0.5 + 0.5) * size.width;
    badgeScreenBounds.y = (-screenCenter.y * 0.5 + 0.5) * size.height;
    badgeScreenBounds.size =
      Math.abs(screenEdge.x - screenCenter.x) * size.width;
    badgeScreenBounds.ready = true;
    // 7. Neon emissive flicker (Red Room) preserving original GLB emissiveIntensity ratio without white-clipping
    const neonPrep = preparedMapRef.current.neon;
    if (
      (activeSkinRef.current === "neon" ||
        outgoingSkinRef.current === "neon") &&
      neonPrep &&
      neonPrep.neonMaterials.length > 0
    ) {
      const flicker =
        1.0 +
        Math.sin(frame.time * 24.0) *
          0.08 *
          (Math.sin(frame.time * 7.3) > 0 ? 1 : 0);
      neonPrep.neonMaterials.forEach((m) => {
        const base = m.userData.baseEmissiveIntensity ?? 4.0;
        m.emissiveIntensity = base * flicker;
      });
    }

    // 8. Neon drips extension animation per Part 5.2
    if (
      (activeSkinRef.current === "neon" ||
        outgoingSkinRef.current === "neon") &&
      neonPrep?.animatedNodes.drips
    ) {
      const cycle = (frame.time % 8.0) / 8.0;
      neonPrep.animatedNodes.drips.scale.y =
        1.0 + Math.sin(cycle * Math.PI * 2) * 0.06 + 0.06;
    }
  }, -30);

  // Pointer drag listeners for drag-to-spin
  const handlePointerDown = (e: any) => {
    e.stopPropagation();
    coinSpin.onPointerDown();
    triggerBlink();
  };

  const handlePointerMove = (e: any) => {
    if (!coinSpin.isDragging) return;
    const clientX = e.clientX ?? 0;
    const clientY = e.clientY ?? 0;
    coinSpin.onPointerMove(e.movementX ?? 0, e.movementY ?? 0, 16);
  };

  const handlePointerUp = () => {
    if (coinSpin.isDragging) {
      coinSpin.onPointerUp(true, 0);
    }
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
      {/* Enamel Skin GLB (Home - Pink) */}
      <group
        ref={enamelGroupRef}
        name="EnamelSkin"
        visible={targetSkin === "enamel"}
      >
        {mountedSkins.enamel && (
          <Suspense fallback={null}>
            <BadgeSkinMesh
              url="/models/badge-enamel.glb"
              skinName="enamel"
              uniforms={enamelUniforms}
              backTexture={backTexture}
              preparedMapRef={preparedMapRef}
            />
          </Suspense>
        )}
      </group>

      {/* Neon Skin GLB (The Red Room - Red) */}
      <group ref={neonGroupRef} name="NeonSkin" visible={targetSkin === "neon"}>
        {mountedSkins.neon && (
          <Suspense fallback={null}>
            <BadgeSkinMesh
              url="/models/badge-neon.glb"
              skinName="neon"
              uniforms={neonUniforms}
              backTexture={backTexture}
              preparedMapRef={preparedMapRef}
            />
          </Suspense>
        )}
      </group>

      {/* Jewelled Skin GLB (Diwali - Jewelled Pink & Gold) */}
      <group
        ref={jewelledGroupRef}
        name="JewelledSkin"
        visible={targetSkin === "jewelled"}
      >
        {mountedSkins.jewelled && (
          <Suspense fallback={null}>
            <BadgeSkinMesh
              url="/models/badge-jewelled.glb"
              skinName="jewelled"
              uniforms={jewelledUniforms}
              backTexture={backTexture}
              preparedMapRef={preparedMapRef}
            />
          </Suspense>
        )}
      </group>

      {/* Directional Sparkle Glints on Pavé Diamond Face for Jewelled Skin */}
      <SparkleGlints active={activeSkinRef.current === "jewelled"} />
    </group>
  );
}
