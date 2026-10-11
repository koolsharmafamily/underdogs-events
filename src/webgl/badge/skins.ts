/**
 * Protagonist badge material skin configurations (BRIEF.md Part 5.2).
 */

import * as THREE from 'three';
import { DissolveUniforms, injectDissolve } from './dissolve.glsl';

export type SkinId = 'enamel' | 'neon' | 'jewelled';

export interface BadgeSkinMaterials {
  body: THREE.MeshPhysicalMaterial;
  ring: THREE.MeshPhysicalMaterial;
  face: THREE.MeshPhysicalMaterial;
  letters: THREE.MeshPhysicalMaterial;
  eyes: THREE.MeshPhysicalMaterial;
  tongue: THREE.MeshPhysicalMaterial;
  back: THREE.MeshPhysicalMaterial;
  extras?: Record<string, THREE.Material>;
}

export function createSkinMaterials(
  skinId: SkinId,
  dissolveUniforms?: DissolveUniforms
): BadgeSkinMaterials {
  let mats: BadgeSkinMaterials;

  if (skinId === 'neon') {
    mats = {
      body: new THREE.MeshPhysicalMaterial({
        color: '#0A0505',
        roughness: 0.25,
        clearcoat: 1.0,
        metalness: 0.1,
      }),
      ring: new THREE.MeshPhysicalMaterial({
        color: '#120203',
        roughness: 0.08,
        clearcoat: 1.0,
        metalness: 0.3,
      }),
      face: new THREE.MeshPhysicalMaterial({
        color: '#050102',
        roughness: 0.05,
        clearcoat: 1.0,
        metalness: 0.2,
      }),
      letters: new THREE.MeshPhysicalMaterial({
        color: '#3A0504',
        emissive: new THREE.Color('#FF2A1F'),
        emissiveIntensity: 4.2,
        roughness: 0.2,
      }),
      eyes: new THREE.MeshPhysicalMaterial({
        color: '#3A0504',
        emissive: new THREE.Color('#FF2A1F'),
        emissiveIntensity: 4.5,
        roughness: 0.2,
      }),
      tongue: new THREE.MeshPhysicalMaterial({
        color: '#3A0504',
        emissive: new THREE.Color('#FF2A1F'),
        emissiveIntensity: 4.0,
        roughness: 0.2,
      }),
      back: new THREE.MeshPhysicalMaterial({
        color: '#0A0505',
        roughness: 0.25,
        metalness: 0.1,
      }),
    };
  } else if (skinId === 'jewelled') {
    mats = {
      body: new THREE.MeshPhysicalMaterial({
        color: '#D4AF6A',
        metalness: 1.0,
        roughness: 0.28,
        clearcoat: 0.8,
      }),
      ring: new THREE.MeshPhysicalMaterial({
        color: '#C5287B',
        roughness: 0.2,
        clearcoat: 1.0,
        metalness: 0.1,
      }),
      face: new THREE.MeshPhysicalMaterial({
        color: '#15181C',
        roughness: 0.95,
        sheen: 1.0,
        sheenColor: new THREE.Color('#3A2430'),
        sheenRoughness: 0.6,
      }),
      letters: new THREE.MeshPhysicalMaterial({
        color: '#FFF6EE',
        roughness: 0.35,
        metalness: 0.1,
      }),
      eyes: new THREE.MeshPhysicalMaterial({
        color: '#FFFFFF',
        roughness: 0.02,
        ior: 2.4,
        metalness: 0.0,
        envMapIntensity: 2.5,
      }),
      tongue: new THREE.MeshPhysicalMaterial({
        color: '#FFFFFF',
        roughness: 0.02,
        ior: 2.4,
        metalness: 0.0,
        envMapIntensity: 2.5,
      }),
      back: new THREE.MeshPhysicalMaterial({
        color: '#D4AF6A',
        metalness: 1.0,
        roughness: 0.28,
      }),
    };
  } else {
    // Enamel (Home)
    mats = {
      body: new THREE.MeshPhysicalMaterial({
        color: '#D9DCE3',
        metalness: 1.0,
        roughness: 0.12,
      }),
      ring: new THREE.MeshPhysicalMaterial({
        color: '#D73EBC',
        roughness: 0.18,
        clearcoat: 1.0,
        clearcoatRoughness: 0.05,
        metalness: 0.05,
      }),
      face: new THREE.MeshPhysicalMaterial({
        color: '#10171F',
        roughness: 0.12,
        clearcoat: 1.0,
        metalness: 0.1,
      }),
      letters: new THREE.MeshPhysicalMaterial({
        color: '#FCF9FC',
        roughness: 0.3,
        clearcoat: 0.6,
        metalness: 0.05,
      }),
      eyes: new THREE.MeshPhysicalMaterial({
        color: '#FCF9FC',
        roughness: 0.3,
        clearcoat: 0.6,
        metalness: 0.05,
      }),
      tongue: new THREE.MeshPhysicalMaterial({
        color: '#FCF9FC',
        roughness: 0.3,
        clearcoat: 0.6,
        metalness: 0.05,
      }),
      back: new THREE.MeshPhysicalMaterial({
        color: '#D9DCE3',
        metalness: 1.0,
        roughness: 0.12,
      }),
    };
  }

  // Inject dissolve shader logic if uniforms provided
  if (dissolveUniforms) {
    const list = [mats.body, mats.ring, mats.face, mats.letters, mats.eyes, mats.tongue, mats.back];
    list.forEach((m, idx) => {
      injectDissolve(m, dissolveUniforms, `${skinId}_${idx}`);
    });
  }

  return mats;
}
