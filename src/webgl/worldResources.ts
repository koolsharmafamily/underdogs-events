import * as THREE from "three";
import type { WorldId } from "@/theme/tokens";
const resources = new Map<WorldId, Set<{ dispose: () => void }>>();
export function rememberWorldResources(world: WorldId, root: THREE.Object3D) {
  const owned = new Set<{ dispose: () => void }>();
  root.traverse((node) => {
    const mesh = node as THREE.Mesh;
    if (mesh.geometry) owned.add(mesh.geometry);
    if (mesh.material)
      for (const material of Array.isArray(mesh.material)
        ? mesh.material
        : [mesh.material]) {
        owned.add(material);
        for (const value of Object.values(material))
          if (value instanceof THREE.Texture) owned.add(value);
      }
  });
  resources.set(world, owned);
}
export function releaseWorldResources(world: WorldId) {
  resources.get(world)?.forEach((resource) => resource.dispose());
  resources.delete(world);
}
