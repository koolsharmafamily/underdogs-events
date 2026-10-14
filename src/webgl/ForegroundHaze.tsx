"use client";
import { useEffect, useMemo } from "react";
import * as THREE from "three";
import { useStore } from "@/state/store";

/** Broad defocused foreground wisps frame the set without crossing its subject. */
export function ForegroundHaze() {
  const world = useStore((s) => s.world);
  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        uniforms: {
          tint: {
            value: new THREE.Color(
              world === "home"
                ? "#584266"
                : world === "redroom"
                  ? "#4C2520"
                  : "#B27D62",
            ),
          },
        },
        vertexShader:
          "varying vec2 vUv; void main(){vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}",
        fragmentShader:
          "varying vec2 vUv; uniform vec3 tint; void main(){vec2 p=(vUv-.5)*2.; float a=exp(-dot(p,p)*5.)*.055; gl_FragColor=vec4(tint,a);}",
      }),
    [world],
  );
  useEffect(() => () => material.dispose(), [material]);
  return (
    <group name="DefocusedForeground">
      <mesh position={[-2.9, 0.2, 3.4]} material={material}>
        <planeGeometry args={[4, 3]} />
      </mesh>
      <mesh position={[3.1, 2.8, 3.2]} material={material}>
        <planeGeometry args={[3, 4]} />
      </mesh>
    </group>
  );
}
