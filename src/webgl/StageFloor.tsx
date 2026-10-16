"use client";
import { memo, useEffect, useState } from "react";
import { ContactShadows } from "@react-three/drei";
import { Reflector } from "./Reflector";
import { useQuality } from "./QualityProvider";
import { useStore } from "@/state/store";
import type { WorldId } from "@/theme/tokens";
import type { WebGLProgramParametersWithUniforms } from "three";
import { MeshReflectorMaterial as ReflectorMaterialImpl } from "@react-three/drei/materials/MeshReflectorMaterial";

function fadeHorizon(
  this: ReflectorMaterialImpl,
  shader: WebGLProgramParametersWithUniforms,
) {
  ReflectorMaterialImpl.prototype.onBeforeCompile.call(this, shader);
  shader.fragmentShader = shader.fragmentShader.replace(
    "#include <dithering_fragment>",
    `
    #include <dithering_fragment>
    gl_FragColor.a *= 1.0 - smoothstep(10.0, 32.0, vViewPosition.z);
  `,
  );
}

/**
 * drei counts ContactShadows' frames in a plain local that resets on every
 * re-render, so frames={1} re-captured the shadows (52 draw calls) whenever the
 * floor re-rendered. Memoised with no props, it renders once.
 */
const FloorShadows = memo(function FloorShadows() {
  return (
    <ContactShadows
      frames={1}
      position={[0, -0.012, 0]}
      scale={16}
      far={4}
      resolution={128}
      opacity={0.38}
      blur={2.8}
      color="#000000"
    />
  );
});

export function StageFloor({ world }: { world: WorldId }) {
  const { settings } = useQuality();
  const activeWorld = useStore((s) => s.world);
  // Stays mounted with its world (hidden when another is current), so the
  // reflector's targets and programs are built once. The contact shadows render
  // a single frame, so they wait for the world's first real visit: a world
  // warmed in the background would otherwise capture another world's floor.
  const active = activeWorld === world;
  const [visited, setVisited] = useState(active);
  useEffect(() => {
    if (active) setVisited(true);
  }, [active]);
  const color =
    world === "home" ? "#090D17" : world === "redroom" ? "#080303" : "#6E574D";
  return (
    <group name={`${world}-grounding`} visible={active}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.025, 0]}>
        <planeGeometry args={[100, 100]} />
        {settings.hasReflector ? (
          <Reflector
            resolution={128}
            blur={[160, 64]}
            mixBlur={1}
            mixStrength={world === "home" ? 0.65 : world === "diwali" ? 0.16 : 0.32}
            mirror={world === "home" ? 0.35 : 0.12}
            color={color}
            metalness={world === "home" ? 0.45 : 0.25}
            roughness={world === "home" ? 0.38 : 0.72}
            depthScale={0.3}
            minDepthThreshold={0.4}
            maxDepthThreshold={1.4}
            dithering
            transparent
            onBeforeCompile={fadeHorizon}
          />
        ) : (
          <meshStandardMaterial
            color={color}
            roughness={0.45}
            metalness={0.4}
            dithering
          />
        )}
      </mesh>
      {visited && <FloorShadows />}
    </group>
  );
}
