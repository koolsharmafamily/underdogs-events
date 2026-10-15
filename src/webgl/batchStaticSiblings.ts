import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";

/** Batch only sibling meshes sharing an identical material and vertex layout.
 * Parent hinges, named anchors, source materials and vertex colours are retained. */
export function batchStaticSiblings(root: THREE.Object3D, flatten = false) {
  const parents: THREE.Object3D[] = [];
  root.updateWorldMatrix(true, true);
  const inverse = root.matrixWorld.clone().invert();
  if (flatten) parents.push(root);
  else
    root.traverse((node) => {
      if (!(node as THREE.Mesh).isMesh) parents.push(node);
    });
  for (const parent of parents) {
    const groups = new Map<string, THREE.Mesh[]>();
    const children: THREE.Object3D[] = [];
    if (flatten) root.traverse((child) => children.push(child));
    else children.push(...parent.children);
    for (const child of children) {
      const mesh = child as THREE.Mesh;
      if (
        !mesh.isMesh ||
        (mesh as THREE.InstancedMesh).isInstancedMesh ||
        !mesh.visible ||
        Array.isArray(mesh.material) ||
        mesh.children.length ||
        mesh.morphTargetInfluences ||
        mesh.name === "Drips" ||
        mesh.name === "Mirror_Glass"
      )
        continue;
      const key =
        mesh.material.uuid +
        ":" +
        Boolean(mesh.geometry.index) +
        ":" +
        Object.entries(mesh.geometry.attributes)
          .sort()
          .map(([name, attribute]) => `${name}:${attribute.itemSize}`)
          .join(",");
      const group = groups.get(key) ?? [];
      group.push(mesh);
      groups.set(key, group);
    }
    for (const meshes of groups.values()) {
      if (meshes.length < 2) continue;
      const geometries = meshes.map((mesh) => {
        mesh.updateMatrix();
        const geometry = mesh.geometry.clone();
        // Meshopt can expose normalized integer attributes. Baking transforms
        // into those arrays clips vertices; decode to floats before merging.
        for (const [name, attribute] of Object.entries(geometry.attributes)) {
          const values = new Float32Array(attribute.count * attribute.itemSize);
          for (let i = 0; i < attribute.count; i++)
            for (let j = 0; j < attribute.itemSize; j++)
              values[i * attribute.itemSize + j] = attribute.getComponent(i, j);
          geometry.setAttribute(
            name,
            new THREE.BufferAttribute(values, attribute.itemSize),
          );
        }
        return geometry.applyMatrix4(
          flatten
            ? new THREE.Matrix4().multiplyMatrices(inverse, mesh.matrixWorld)
            : mesh.matrix,
        );
      });
      const merged = mergeGeometries(geometries, false);
      geometries.forEach((g) => g.dispose());
      if (!merged) continue;
      meshes.forEach((mesh) => {
        mesh.visible = false;
      });
      const batch = new THREE.Mesh(merged, meshes[0].material);
      batch.name = "StaticMaterialBatch";
      parent.add(batch);
    }
  }
  return root;
}
