"use client";
import { useMemo, useRef, useEffect } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { frame } from "@/state/frame";
import { useStore } from "@/state/store";

/** Feathered atmospheric shafts behind the subject; no visible cone surfaces. */
export function Beams() {
  const root = useRef<THREE.Group>(null);
  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        uniforms: { uTime: { value: 0 } },
        vertexShader: `varying vec2 vUv; void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
        fragmentShader: `varying vec2 vUv; uniform float uTime;
      void main(){float width=mix(.05,.42,1.-vUv.y); float beam=exp(-pow((vUv.x-.5)/width,2.)*3.);
      float fade=smoothstep(0.,.25,vUv.y)*(1.-smoothstep(.75,1.,vUv.y));
      float haze=.85+.15*sin(vUv.y*9.+uTime*.16);
      gl_FragColor=vec4(vec3(.5,.2,.65),beam*fade*haze*.07);}`,
      }),
    [],
  );
  useEffect(() => () => material.dispose(), [material]);
  useFrame(() => {
    if (useStore.getState().world !== "home") return;
    material.uniforms.uTime.value = frame.time;
    if (root.current) {
      root.current.rotation.z = Math.sin(frame.time * 0.08) * 0.025;
      // Hero: both shafts behind the badge on the right. Doors (H5): one shaft
      // over each door (±1.5), so both are lit the same.
      const doors = Math.min(1, (frame.dampedProgress["H5"] ?? 0) * 3);
      root.current.position.x = 1.5 - 3 * doors;
    }
  });
  return (
    <group ref={root} name="AtmosphericShafts" position={[1.5, 2.8, -4]}>
      <mesh rotation={[0, 0, -0.22]} material={material}>
        <planeGeometry args={[3, 9]} />
      </mesh>
      <mesh position={[3, 0.5, -1]} rotation={[0, 0, 0.28]} material={material}>
        <planeGeometry args={[3, 10]} />
      </mesh>
    </group>
  );
}
