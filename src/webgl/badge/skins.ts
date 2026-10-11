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
      extras: {
        drips: new THREE.MeshPhysicalMaterial({
          color: '#6B0A08',
          roughness: 0.1,
          clearcoat: 1.0,
        }),
        tubes: new THREE.MeshPhysicalMaterial({
          color: '#3A0504',
          emissive: new THREE.Color('#FF2A1F'),
          emissiveIntensity: 4.8,
          roughness: 0.2,
        }),
      },
    };
  } else if (skinId === 'jewelled') {
    const goldMat = new THREE.MeshPhysicalMaterial({
      color: '#F5BD47',
      metalness: 0.95,
      roughness: 0.12,
      clearcoat: 0.8,
    });
    const emeraldMat = new THREE.MeshPhysicalMaterial({
      color: '#157A4F',
      transmission: 0.8,
      roughness: 0.05,
      ior: 1.57,
      thickness: 0.2,
    });
    const pinkGemMat = new THREE.MeshPhysicalMaterial({
      color: '#E0218A',
      transmission: 0.75,
      roughness: 0.08,
      ior: 1.6,
      thickness: 0.2,
    });
    mats = {
      body: goldMat,
      ring: new THREE.MeshPhysicalMaterial({
        color: '#C5287B',
        roughness: 0.2,
        clearcoat: 1.0,
        metalness: 0.1,
      }),
      face: new THREE.MeshPhysicalMaterial({
        color: '#1A1820',
        roughness: 0.25,
        metalness: 0.6,
        clearcoat: 1.0,
        clearcoatRoughness: 0.1,
      }),
      letters: new THREE.MeshPhysicalMaterial({
        color: '#FFF6EE',
        roughness: 0.35,
        clearcoat: 0.6,
      }),
      eyes: new THREE.MeshPhysicalMaterial({
        color: '#FFFFFF',
        roughness: 0.02,
        ior: 2.4,
        metalness: 0.1,
        transmission: 0.6,
        thickness: 0.2,
        envMapIntensity: 3.0,
      }),
      tongue: new THREE.MeshPhysicalMaterial({
        color: '#00A86B', // Carved emerald (Part 5.2)
        roughness: 0.05,
        transmission: 0.85,
        thickness: 0.35,
        ior: 1.57,
        metalness: 0.0,
        envMapIntensity: 2.5,
      }),
      back: new THREE.MeshPhysicalMaterial({
        color: '#E8A39B', // Engraved rose gold (Part 5.2)
        metalness: 0.9,
        roughness: 0.22,
      }),
      extras: {
        gold: goldMat,
        emerald: emeraldMat,
        pink: pinkGemMat,
      },
    };
  } else {
    // Enamel (Home) — Gloss black lacquer body/ring, polished nickel chrome rim and back, white enamel face lettering
    mats = {
      body: new THREE.MeshPhysicalMaterial({
        color: '#D9DCE3',
        metalness: 1.0,
        roughness: 0.12,
      }),
      ring: new THREE.MeshPhysicalMaterial({
        color: '#0B0E14', // Gloss black lacquer / deep enamel (inappropriate pink removed)
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
    const list: (THREE.MeshPhysicalMaterial | THREE.MeshStandardMaterial)[] = [
      mats.body,
      mats.ring,
      mats.face,
      mats.letters,
      mats.eyes,
      mats.tongue,
      mats.back,
    ];
    if (mats.extras) {
      Object.values(mats.extras).forEach((m) => {
        if (m instanceof THREE.MeshPhysicalMaterial || m instanceof THREE.MeshStandardMaterial) {
          list.push(m);
        }
      });
    }
    list.forEach((m, idx) => {
      injectDissolve(m, dissolveUniforms, `${skinId}_${idx}`);
    });
  }

  return mats;
}
