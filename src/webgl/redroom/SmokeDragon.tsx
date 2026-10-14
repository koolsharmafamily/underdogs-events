"use client";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { useThree } from "@react-three/fiber";
import { frame } from "@/state/frame";
import { composition } from "../composition";

/** A single soft particle body replaces hundreds of opaque dragon polygons. */
export function SmokeDragon() {
  const { size } = useThree();
  const count = size.width < 768 ? 360 : 720;
  const root = useRef<THREE.Points>(null);
  const { geometry, material } = useMemo(() => {
    const geometry = new THREE.BufferGeometry();
    const position = new Float32Array(count * 3),
      scales = new Float32Array(count);
    for (let i = 0; i < count; i++) scales[i] = 0.6 + (i % 11) / 11;
    geometry.setAttribute("position", new THREE.BufferAttribute(position, 3));
    geometry.setAttribute("aSize", new THREE.BufferAttribute(scales, 1));
    const material = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: { opacity: { value: 0.25 } },
      vertexShader: `attribute float aSize; varying float vShade;
        void main(){vec4 mv=modelViewMatrix*vec4(position,1.);gl_Position=projectionMatrix*mv;
        gl_PointSize=clamp(110.*aSize/-mv.z,1.,34.);vShade=aSize;}`,
      fragmentShader: `uniform float opacity; varying float vShade;
        void main(){float r=length(gl_PointCoord-.5)*2.;float a=exp(-r*r*5.)*(1.-smoothstep(.65,1.,r));
        gl_FragColor=vec4(mix(vec3(.26,.025,.025),vec3(.7,.15,.08),vShade*.5),a*opacity);}`,
    });
    return { geometry, material };
  }, [count]);
  useEffect(
    () => () => {
      geometry.dispose();
      material.dispose();
    },
    [geometry, material],
  );
  useFrame(() => {
    if (!root.current) return;
    root.current.visible = composition.scene === "R1";
    if (!root.current.visible) return;
    const t = frame.time * 0.55,
      positions = geometry.attributes.position.array as Float32Array;
    for (let i = 0; i < count; i++) {
      const u = i / (count - 1),
        a = t - u * 2.8;
      const spread = 0.025 + Math.sin(u * Math.PI) * 0.09;
      const theta = i * 2.39996 + t * 0.13;
      positions[i * 3] = Math.sin(a) * 1.8 + Math.cos(theta) * spread;
      positions[i * 3 + 1] =
        2.72 + Math.cos(a * 1.6) * 0.25 + Math.sin(theta) * spread;
      positions[i * 3 + 2] =
        -0.75 + Math.sin(a * 1.2) * 0.3 + Math.sin(i * 1.73) * spread;
    }
    geometry.attributes.position.needsUpdate = true;
  });
  return (
    <points
      ref={root}
      name="SmokeDragon"
      geometry={geometry}
      material={material}
      frustumCulled={false}
    />
  );
}
