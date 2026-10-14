"use client";
import { Environment, Lightformer } from "@react-three/drei";
import { useStore } from "@/state/store";

/** Reflection cards illuminate the supplied materials without replacing them. */
export function StudioEnvironment() {
  const world = useStore((s) => s.world);
  const warm = world === "redroom";
  const festive = world === "diwali";
  return (
    <Environment
      key={world}
      resolution={128}
      environmentIntensity={warm ? 0.23 : festive ? 0.38 : 0.5}
    >
      <Lightformer
        form="rect"
        intensity={3.2}
        color={warm ? "#FFE0B0" : "#F4F1FF"}
        scale={[3, 7, 1]}
        position={[-4, 4, 4]}
        target={[0, 1.6, 0]}
      />
      <Lightformer
        form="rect"
        intensity={warm ? 0.8 : 1.6}
        color={warm ? "#B53525" : festive ? "#E98BB8" : "#DD7BDC"}
        scale={[1, 5, 1]}
        position={[4, 2, -1]}
        target={[0, 1.6, 0]}
      />
      <Lightformer
        form="rect"
        intensity={1.4}
        color="#FFF0D8"
        scale={[6, 2, 1]}
        position={[0, 6, 0]}
        target={[0, 1, 0]}
      />
    </Environment>
  );
}
