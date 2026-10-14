"use client";
import { ContactShadows, MeshReflectorMaterial } from "@react-three/drei";
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

export function StageFloor({ world }: { world: WorldId }) {
  const { settings } = useQuality();
  const activeWorld = useStore((s) => s.world);
  if (activeWorld !== world) return null;
  const color =
    world === "home" ? "#090D17" : world === "redroom" ? "#080303" : "#6E574D";
  return (
    <group name={`${world}-grounding`}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.025, 0]}>
        <planeGeometry args={[100, 100]} />
        {settings.hasReflector ? (
          <MeshReflectorMaterial
            resolution={128}
            blur={[160, 64]}
            mixBlur={1}
            mixStrength={world === "diwali" ? 0.16 : 0.32}
            mirror={0.12}
            color={color}
            metalness={0.25}
            roughness={0.72}
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
    </group>
  );
}
