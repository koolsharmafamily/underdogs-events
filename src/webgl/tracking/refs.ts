import type { Matrix4 } from "three";

// DOM elements the canvas positions every frame. Kept free of three.js imports
// so DOM components can share them without pulling three into the first bundle.

/** The door twins: real links laid over each 3D door. */
export const domTwinRefs: {
  red: HTMLAnchorElement | null;
  diwali: HTMLAnchorElement | null;
} = { red: null, diwali: null };

/** The Red Room invitation card overlay. */
export const cardOverlayRef: {
  current: HTMLDivElement | null;
  cardMeshWorldMatrix: Matrix4 | null;
} = {
  current: null,
  cardMeshWorldMatrix: null,
};
