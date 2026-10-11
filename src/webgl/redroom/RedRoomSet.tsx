'use client';

import React, { useRef } from 'react';
import * as THREE from 'three';
import { useGLTF } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { frame } from '@/state/frame';

// Preload finished Red Room GLB models
useGLTF.preload('/models/curtain-open.glb');
useGLTF.preload('/models/redroom-mirror.glb');
useGLTF.preload('/models/redroom-chandelier.glb');
useGLTF.preload('/models/redroom-candelabra.glb');
useGLTF.preload('/models/redroom-candle.glb');
useGLTF.preload('/models/redroom-invitation.glb');

export function RedRoomSet() {
  const curtainGltf = useGLTF('/models/curtain-open.glb');
  const mirrorGltf = useGLTF('/models/redroom-mirror.glb');
  const chandelierGltf = useGLTF('/models/redroom-chandelier.glb');
  const candelabraGltf = useGLTF('/models/redroom-candelabra.glb');
  const candleGltf = useGLTF('/models/redroom-candle.glb');
  const invitationGltf = useGLTF('/models/redroom-invitation.glb');

  const candleLight1Ref = useRef<THREE.PointLight>(null);
  const candleLight2Ref = useRef<THREE.PointLight>(null);

  // Candle flicker animation at 8-14 Hz noise per Part 5.4
  useFrame(() => {
    const t = frame.time;
    const flicker1 = 1 + (Math.sin(t * 12) + Math.cos(t * 8.3)) * 0.08;
    const flicker2 = 1 + (Math.sin(t * 9.5) + Math.cos(t * 14.1)) * 0.08;

    if (candleLight1Ref.current) candleLight1Ref.current.intensity = 2.2 * flicker1;
    if (candleLight2Ref.current) candleLight2Ref.current.intensity = 2.0 * flicker2;
  });

  return (
    <group name="RedRoomSet">
      {/* Lighting per Part 5.4: 2 candle point lights #FF9A4A, badge light #FF2A1F */}
      <ambientLight intensity={0.25} color="#150202" />
      <pointLight
        ref={candleLight1Ref}
        position={[-1.5, 2.0, 1.2]}
        color="#FF9A4A"
        intensity={2.2}
        distance={12}
        decay={2}
      />
      <pointLight
        ref={candleLight2Ref}
        position={[1.5, 2.0, 1.2]}
        color="#FF9A4A"
        intensity={2.0}
        distance={12}
        decay={2}
      />
      <pointLight
        position={[0, 1.7, 0.4]}
        color="#FF2A1F"
        intensity={3.0}
        distance={8}
        decay={2}
      />

      {/* Floor: Black-red lacquer floor (Part 5.4) */}
      <mesh
        name="RedRoomFloor"
        position={[0, 0, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <planeGeometry args={[30, 30]} />
        <meshStandardMaterial
          color="#080101"
          roughness={0.12}
          metalness={0.7}
        />
      </mesh>

      {/* Finished GLB: Curtains */}
      <group position={[0, 0, 0]} scale={[1, 1, 1]}>
        <primitive object={curtainGltf.scene.clone()} />
      </group>

      {/* Finished GLB: Chandelier at (0, 3.8, 0) */}
      <group position={[0, 3.8, 0]} scale={[0.8, 0.8, 0.8]}>
        <primitive object={chandelierGltf.scene.clone()} />
      </group>

      {/* Finished GLB: Mirror at (0, 1.8, -0.4) */}
      <group position={[0, 1.8, -0.4]} scale={[0.9, 0.9, 0.9]}>
        <primitive object={mirrorGltf.scene.clone()} />
      </group>

      {/* Finished GLB: Candelabra on left at (-3.0, 0.0, 0.6) */}
      <group position={[-3.0, 0.0, 0.6]} scale={[0.7, 0.7, 0.7]}>
        <primitive object={candelabraGltf.scene.clone()} />
      </group>

      {/* Finished GLB: Candle on table */}
      <group position={[0.8, 0.7, 1.0]} scale={[0.5, 0.5, 0.5]}>
        <primitive object={candleGltf.scene.clone()} />
      </group>

      {/* Finished GLB: Invitation Tray at (0, 0.8, 1.4) */}
      <group position={[0, 0.8, 1.4]} scale={[0.65, 0.65, 0.65]}>
        <primitive object={invitationGltf.scene.clone()} />
      </group>
    </group>
  );
}
