import * as THREE from "three";

/**
 * Swaps KHR transmission glass for plain transparency in the same colour.
 * Transmission makes three.js render every opaque object a second time into an
 * offscreen target each frame (about 40 extra draw calls in the Red Room) for a
 * refraction nobody can see at this size. Materials are cloned once and shared,
 * so static batching still merges them.
 */
export function cheapGlass(root: THREE.Object3D) {
  const swapped = new Map<THREE.Material, THREE.Material>();
  root.traverse((node) => {
    const mesh = node as THREE.Mesh;
    if (!mesh.isMesh) return;
    const swap = (material: THREE.Material) => {
      const physical = material as THREE.MeshPhysicalMaterial;
      if (!physical.isMeshPhysicalMaterial || !(physical.transmission > 0)) return material;
      let glass = swapped.get(material);
      if (!glass) {
        const clone = physical.clone();
        clone.transmission = 0;
        clone.transparent = true;
        clone.opacity = Math.min(physical.opacity, 1 - 0.6 * physical.transmission);
        clone.depthWrite = false;
        glass = clone;
        swapped.set(material, glass);
      }
      return glass;
    };
    mesh.material = Array.isArray(mesh.material) ? mesh.material.map(swap) : swap(mesh.material);
  });
  return root;
}
