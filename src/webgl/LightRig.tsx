"use client";

/**
 * Every world lights the scene with exactly this many lights. three.js compiles
 * light counts into each lit shader, so equal counts let a material compiled in one
 * world draw in any other without a recompile (the badge most of all, as it travels
 * between worlds). A world with fewer lights pads with SpareLights.
 */
export const LIGHT_RIG = { directional: 3, point: 3 } as const;

/** Unlit placeholders that keep a world's light counts at LIGHT_RIG. */
export function SpareLights({
  directional = 0,
  point = 0,
}: {
  directional?: number;
  point?: number;
}) {
  return (
    <>
      {Array.from({ length: directional }, (_, i) => (
        <directionalLight key={`d${i}`} intensity={0} />
      ))}
      {Array.from({ length: point }, (_, i) => (
        <pointLight key={`p${i}`} intensity={0} />
      ))}
    </>
  );
}
