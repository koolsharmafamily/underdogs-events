import * as THREE from "three";
import { MrDogOutfit } from "./store";

export interface MrDogRig {
  root: THREE.Object3D | null;
  neck: THREE.Object3D | null;
  head: THREE.Object3D | null;
  earL: THREE.Object3D | null;
  earR: THREE.Object3D | null;
  browL: THREE.Object3D | null;
  browR: THREE.Object3D | null;
  eyesOpen: THREE.Object3D | null;
  eyeL: THREE.Object3D | null;
  eyeR: THREE.Object3D | null;
  pupilL: THREE.Object3D | null;
  pupilR: THREE.Object3D | null;
  eyesX: THREE.Object3D | null;
  xL: THREE.Object3D | null;
  xR: THREE.Object3D | null;
  eyelidL: THREE.Object3D | null;
  eyelidR: THREE.Object3D | null;
  nose: THREE.Object3D | null;
  jowlL: THREE.Object3D | null;
  jowlR: THREE.Object3D | null;
  lipL: THREE.Object3D | null;
  lipR: THREE.Object3D | null;
  jaw: THREE.Object3D | null;
  tongue: THREE.Object3D | null;
  collar: THREE.Object3D | null;
  tag: THREE.Object3D | null;
  outfitHome: THREE.Object3D | null;
  outfitRedRoom: THREE.Object3D | null;
  outfitDiwali: THREE.Object3D | null;
  fangs: THREE.Object3D | null;
  sunglasses: THREE.Object3D | null;
  // Extra detail nodes
  tagHome: THREE.Object3D | null;
  tagRedRoom: THREE.Object3D | null;
  tagDiwali: THREE.Object3D | null;
  xLWhite: THREE.Object3D | null;
  xLNeon: THREE.Object3D | null;
  xRWhite: THREE.Object3D | null;
  xRNeon: THREE.Object3D | null;
}

const warnedNodes = new Set<string>();

function findNode(scene: THREE.Object3D, name: string): THREE.Object3D | null {
  // Step 1: Exact match
  let found: THREE.Object3D | null = null;
  scene.traverse((obj) => {
    if (!found && obj.name === name) {
      found = obj;
    }
  });
  if (found) return found;

  // Step 2: Case-insensitive prefix match (e.g. Ear_L.001, ear_l_1)
  const lowerName = name.toLowerCase();
  scene.traverse((obj) => {
    if (!found) {
      const objLower = obj.name.toLowerCase();
      if (
        objLower === lowerName ||
        objLower.startsWith(lowerName + ".") ||
        objLower.startsWith(lowerName + "_")
      ) {
        found = obj;
      }
    }
  });

  if (!found && process.env.NODE_ENV !== "production") {
    if (!warnedNodes.has(name)) {
      warnedNodes.add(name);
      console.warn(`[MrDog Rig] Node "${name}" not found in model hierarchy. Degrading gracefully.`);
    }
  }

  return found;
}

export function resolveRig(scene: THREE.Object3D): MrDogRig {
  return {
    root: findNode(scene, "MrDog_Root") || scene,
    neck: findNode(scene, "Neck"),
    head: findNode(scene, "Head"),
    earL: findNode(scene, "Ear_L"),
    earR: findNode(scene, "Ear_R"),
    browL: findNode(scene, "Brow_L"),
    browR: findNode(scene, "Brow_R"),
    eyesOpen: findNode(scene, "Eyes_Open"),
    eyeL: findNode(scene, "Eye_L"),
    eyeR: findNode(scene, "Eye_R"),
    pupilL: findNode(scene, "Pupil_L"),
    pupilR: findNode(scene, "Pupil_R"),
    eyesX: findNode(scene, "Eyes_X"),
    xL: findNode(scene, "X_L"),
    xR: findNode(scene, "X_R"),
    eyelidL: findNode(scene, "Eyelid_L"),
    eyelidR: findNode(scene, "Eyelid_R"),
    nose: findNode(scene, "Nose"),
    jowlL: findNode(scene, "Jowl_L"),
    jowlR: findNode(scene, "Jowl_R"),
    lipL: findNode(scene, "Lip_L"),
    lipR: findNode(scene, "Lip_R"),
    jaw: findNode(scene, "Jaw"),
    tongue: findNode(scene, "Tongue"),
    collar: findNode(scene, "Collar"),
    tag: findNode(scene, "Tag"),
    outfitHome: findNode(scene, "Outfit_Home"),
    outfitRedRoom: findNode(scene, "Outfit_RedRoom"),
    outfitDiwali: findNode(scene, "Outfit_Diwali"),
    fangs: findNode(scene, "Fangs"),
    sunglasses: findNode(scene, "Sunglasses"),
    tagHome: findNode(scene, "Tag_Home"),
    tagRedRoom: findNode(scene, "Tag_RedRoom"),
    tagDiwali: findNode(scene, "Tag_Diwali"),
    xLWhite: findNode(scene, "X_L_White"),
    xLNeon: findNode(scene, "X_L_Neon"),
    xRWhite: findNode(scene, "X_R_White"),
    xRNeon: findNode(scene, "X_R_Neon"),
  };
}

export function setRigOutfit(rig: MrDogRig, outfit: MrDogOutfit) {
  const isHome = outfit === "home";
  const isRedRoom = outfit === "redroom";
  const isDiwali = outfit === "diwali";

  if (rig.outfitHome) rig.outfitHome.visible = isHome;
  if (rig.outfitRedRoom) rig.outfitRedRoom.visible = isRedRoom;
  if (rig.outfitDiwali) rig.outfitDiwali.visible = isDiwali;

  // Outfit extras
  if (rig.fangs) rig.fangs.visible = isRedRoom;
  if (rig.sunglasses) rig.sunglasses.visible = isDiwali;

  // Coin tags
  if (rig.tagHome) rig.tagHome.visible = isHome;
  if (rig.tagRedRoom) rig.tagRedRoom.visible = isRedRoom;
  if (rig.tagDiwali) rig.tagDiwali.visible = isDiwali;

  // ✕ eyes: Neon glow on Red Room, white on Home and Diwali
  if (rig.xLWhite) rig.xLWhite.visible = !isRedRoom;
  if (rig.xRWhite) rig.xRWhite.visible = !isRedRoom;
  if (rig.xLNeon) rig.xLNeon.visible = isRedRoom;
  if (rig.xRNeon) rig.xRNeon.visible = isRedRoom;
}

export function setRigEyes(rig: MrDogRig, mode: "open" | "x") {
  if (rig.eyesOpen) rig.eyesOpen.visible = mode === "open";
  if (rig.eyesX) rig.eyesX.visible = mode === "x";
}
