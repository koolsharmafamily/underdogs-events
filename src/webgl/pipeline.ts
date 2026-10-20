import * as THREE from "three";

export { rendersDirect } from "./tiers";

let composerTarget: THREE.WebGLRenderTarget | null = null;

/**
 * Compiles `object` for the output paths it will be drawn in. three.js bakes the
 * path into every program: through the composer it renders to a linear offscreen
 * target with no tone mapping; direct it renders sRGB with AgX. Compiling for the
 * wrong path (or without the scene's lights, fog and environment) only moves the
 * real compile to the first frame the object appears, which is usually
 * mid-transition. Programs are created synchronously, so the renderer state is
 * restored before this returns; the promise resolves when they have linked.
 */
export function compileFor(
  gl: THREE.WebGLRenderer,
  object: THREE.Object3D,
  camera: THREE.Camera,
  scene: THREE.Scene,
  paths: { direct: boolean }[],
): Promise<unknown> {
  const previousTarget = gl.getRenderTarget();
  const previousToneMapping = gl.toneMapping;
  const jobs: Promise<unknown>[] = [];
  for (const { direct } of paths) {
    if (direct) {
      gl.setRenderTarget(null);
      gl.toneMapping = THREE.AgXToneMapping;
    } else {
      composerTarget ??= new THREE.WebGLRenderTarget(1, 1, {
        type: THREE.HalfFloatType,
      });
      gl.setRenderTarget(composerTarget);
      gl.toneMapping = THREE.NoToneMapping;
    }
    jobs.push(
      object === scene
        ? gl.compileAsync(scene, camera)
        : gl.compileAsync(object, camera, scene),
    );
  }
  gl.setRenderTarget(previousTarget);
  gl.toneMapping = previousToneMapping;
  return Promise.all(jobs);
}
