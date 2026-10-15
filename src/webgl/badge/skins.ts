/**
 * Protagonist badge skin types & dissolve edge configurations (BRIEF.md Part 5.2).
 * All surface materials, base colors, and textures come directly from the authentic GLB models:
 *   - /models/badge-enamel.glb (Home - pink enamel ring, white letters, ink face, chrome rim)
 *   - /models/badge-halloween.glb (The Red Room - the client's Halloween logo: red ring glow, blood drips)
 *   - /models/badge-jewelled.glb (Diwali - rani pink enamel ring, gold zari, diamonds, emeralds, rubies)
 *
 * No hardcoded color overrides in code.
 */

import * as THREE from 'three';

export type SkinId = 'enamel' | 'halloween' | 'jewelled';

export interface DissolveEdgeConfig {
  color: THREE.Color;
  intensity: number;
  width: number;
}

export const DISSOLVE_EDGES: Record<SkinId, DissolveEdgeConfig> = {
  halloween: {
    color: new THREE.Color('#FF4A1F'),
    intensity: 6.0,
    width: 0.06,
  },
  jewelled: {
    color: new THREE.Color('#FFD27A'),
    intensity: 5.0,
    width: 0.06,
  },
  enamel: {
    color: new THREE.Color('#FF4FD8'),
    intensity: 5.0,
    width: 0.06,
  },
};
