import fs from 'node:fs';
import path from 'node:path';
import * as THREE from 'three';

const srcDir = path.resolve(process.cwd(), 'GLBs');
const files = fs.readdirSync(srcDir).filter((f) => f.endsWith('.glb')).sort();

function parseGlb(filePath) {
  const buf = fs.readFileSync(filePath);
  const jsonLen = buf.readUInt32LE(12);
  const gltf = JSON.parse(buf.subarray(20, 20 + jsonLen).toString('utf8'));
  const binOffset = 20 + jsonLen + 8;
  const bin = buf.subarray(binOffset);
  return { gltf, bin, sizeBytes: buf.length };
}

function getAccessorMinMax(gltf, bin, accessorIdx) {
  const acc = gltf.accessors[accessorIdx];
  if (acc.min && acc.max) {
    return {
      min: new THREE.Vector3(acc.min[0], acc.min[1], acc.min[2]),
      max: new THREE.Vector3(acc.max[0], acc.max[1], acc.max[2]),
      count: acc.count,
    };
  }
  const bv = gltf.bufferViews[acc.bufferView];
  const byteOffset = (bv.byteOffset || 0) + (acc.byteOffset || 0);
  const min = new THREE.Vector3(Infinity, Infinity, Infinity);
  const max = new THREE.Vector3(-Infinity, -Infinity, -Infinity);
  for (let i = 0; i < acc.count; i++) {
    const off = byteOffset + i * 12;
    const x = bin.readFloatLE(off);
    const y = bin.readFloatLE(off + 4);
    const z = bin.readFloatLE(off + 8);
    if (x < min.x) min.x = x;
    if (y < min.y) min.y = y;
    if (z < min.z) min.z = z;
    if (x > max.x) max.x = x;
    if (y > max.y) max.y = y;
    if (z > max.z) max.z = z;
  }
  return { min, max, count: acc.count };
}

function buildSceneAndComputeBBox(gltf, bin) {
  const nodes = (gltf.nodes || []).map((n, idx) => {
    const obj = new THREE.Object3D();
    obj.name = n.name || `Node_${idx}`;
    if (n.matrix) {
      const m = new THREE.Matrix4().fromArray(n.matrix);
      m.decompose(obj.position, obj.quaternion, obj.scale);
    } else {
      if (n.translation) obj.position.fromArray(n.translation);
      if (n.rotation) obj.quaternion.fromArray(n.rotation);
      if (n.scale) obj.scale.fromArray(n.scale);
    }
    obj.userData.meshIdx = n.mesh;
    obj.userData.instancing = n.extensions?.EXT_mesh_gpu_instancing;
    return obj;
  });

  (gltf.nodes || []).forEach((n, idx) => {
    if (n.children) {
      n.children.forEach((cIdx) => {
        nodes[idx].add(nodes[cIdx]);
      });
    }
  });

  const root = new THREE.Group();
  root.name = 'SceneRoot';
  const sceneDef = (gltf.scenes && gltf.scenes[gltf.scene ?? 0]) || { nodes: [] };
  (sceneDef.nodes || []).forEach((rIdx) => {
    root.add(nodes[rIdx]);
  });

  root.updateMatrixWorld(true);

  const worldBox = new THREE.Box3();
  let totalTriangles = 0;
  let totalSubMeshes = 0;
  const nodeDetails = [];

  function readVec3At(accIdx, i) {
    const acc = gltf.accessors[accIdx];
    const bv = gltf.bufferViews[acc.bufferView];
    const off = (bv.byteOffset || 0) + (acc.byteOffset || 0) + i * 12;
    return new THREE.Vector3(bin.readFloatLE(off), bin.readFloatLE(off + 4), bin.readFloatLE(off + 8));
  }
  function readQuatAt(accIdx, i) {
    const acc = gltf.accessors[accIdx];
    const bv = gltf.bufferViews[acc.bufferView];
    const off = (bv.byteOffset || 0) + (acc.byteOffset || 0) + i * 16;
    return new THREE.Quaternion(
      bin.readFloatLE(off),
      bin.readFloatLE(off + 4),
      bin.readFloatLE(off + 8),
      bin.readFloatLE(off + 12)
    );
  }

  root.traverse((obj) => {
    if (obj === root) return;
    const wp = new THREE.Vector3();
    obj.getWorldPosition(wp);
    const meshIdx = obj.userData.meshIdx;
    const inst = obj.userData.instancing;
    let nodeBox = null;
    if (meshIdx !== undefined && gltf.meshes[meshIdx]) {
      nodeBox = new THREE.Box3();
      const meshDef = gltf.meshes[meshIdx];
      for (const prim of meshDef.primitives || []) {
        totalSubMeshes++;
        let primTris = 0;
        if (prim.indices !== undefined && gltf.accessors[prim.indices]) {
          primTris = Math.floor(gltf.accessors[prim.indices].count / 3);
        } else if (prim.attributes?.POSITION !== undefined && gltf.accessors[prim.attributes.POSITION]) {
          primTris = Math.floor(gltf.accessors[prim.attributes.POSITION].count / 3);
        }
        totalTriangles += primTris;
        if (prim.attributes?.POSITION !== undefined) {
          const { min, max } = getAccessorMinMax(gltf, bin, prim.attributes.POSITION);
          if (inst && inst.attributes) {
            const tIdx = inst.attributes.TRANSLATION;
            const rIdx = inst.attributes.ROTATION;
            const sIdx = inst.attributes.SCALE;
            const count = gltf.accessors[tIdx ?? rIdx ?? sIdx].count;
            const instMat = new THREE.Matrix4();
            const pos = new THREE.Vector3();
            const quat = new THREE.Quaternion();
            const scl = new THREE.Vector3(1, 1, 1);
            for (let i = 0; i < count; i++) {
              if (tIdx !== undefined) pos.copy(readVec3At(tIdx, i));
              else pos.set(0, 0, 0);
              if (rIdx !== undefined) quat.copy(readQuatAt(rIdx, i));
              else quat.identity();
              if (sIdx !== undefined) scl.copy(readVec3At(sIdx, i));
              else scl.set(1, 1, 1);
              instMat.compose(pos, quat, scl);
              const b = new THREE.Box3(min.clone(), max.clone());
              b.applyMatrix4(instMat);
              b.applyMatrix4(obj.matrixWorld);
              worldBox.union(b);
              nodeBox.union(b);
            }
          } else {
            const localBox = new THREE.Box3(min, max);
            localBox.applyMatrix4(obj.matrixWorld);
            worldBox.union(localBox);
            nodeBox.union(localBox);
          }
        }
      }
    }
    nodeDetails.push({
      name: obj.name,
      parent: obj.parent === root ? 'ROOT' : obj.parent?.name,
      isMesh: meshIdx !== undefined,
      worldPos: [Number(wp.x.toFixed(4)), Number(wp.y.toFixed(4)), Number(wp.z.toFixed(4))],
      localPos: [Number(obj.position.x.toFixed(4)), Number(obj.position.y.toFixed(4)), Number(obj.position.z.toFixed(4))],
      bboxMin: nodeBox ? [Number(nodeBox.min.x.toFixed(4)), Number(nodeBox.min.y.toFixed(4)), Number(nodeBox.min.z.toFixed(4))] : null,
      bboxMax: nodeBox ? [Number(nodeBox.max.x.toFixed(4)), Number(nodeBox.max.y.toFixed(4)), Number(nodeBox.max.z.toFixed(4))] : null,
    });
  });

  const materials = (gltf.materials || []).map((m) => m.name);

  return {
    worldBox: {
      min: [Number(worldBox.min.x.toFixed(4)), Number(worldBox.min.y.toFixed(4)), Number(worldBox.min.z.toFixed(4))],
      max: [Number(worldBox.max.x.toFixed(4)), Number(worldBox.max.y.toFixed(4)), Number(worldBox.max.z.toFixed(4))],
      size: [
        Number((worldBox.max.x - worldBox.min.x).toFixed(4)),
        Number((worldBox.max.y - worldBox.min.y).toFixed(4)),
        Number((worldBox.max.z - worldBox.min.z).toFixed(4)),
      ],
    },
    totalTriangles,
    totalSubMeshes,
    materials,
    nodeDetails,
  };
}

const fullReport = {};
for (const file of files) {
  const { gltf, bin, sizeBytes } = parseGlb(path.join(srcDir, file));
  const info = buildSceneAndComputeBBox(gltf, bin);
  fullReport[file] = { sizeKB: Number((sizeBytes / 1024).toFixed(1)), ...info };
}

fs.writeFileSync('scripts/glb-scene-graph-report.json', JSON.stringify(fullReport, null, 2));

for (const [file, data] of Object.entries(fullReport)) {
  console.log(`\n========================================`);
  console.log(`FILE: ${file} (${data.sizeKB} KB)`);
  console.log(`BBox Min: [${data.worldBox.min.join(', ')}] | Max: [${data.worldBox.max.join(', ')}] | Size: [${data.worldBox.size.join(', ')}]`);
  console.log(`Triangles: ${data.totalTriangles} | Sub-meshes: ${data.totalSubMeshes}`);
  console.log(`Materials: ${data.materials.join(', ')}`);
  console.log(`Nodes (${data.nodeDetails.length}):`);
  for (const n of data.nodeDetails) {
    const tag = n.isMesh ? '[Mesh]' : '[Empty/Group]';
    const boxStr = n.bboxMin ? ` bboxY=[${n.bboxMin[1]}..${n.bboxMax[1]}]` : '';
    console.log(`  - ${n.name} ${tag} (parent: ${n.parent}) worldPos=[${n.worldPos.join(', ')}]${boxStr}`);
  }
}
