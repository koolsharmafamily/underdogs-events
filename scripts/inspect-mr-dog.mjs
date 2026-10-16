import fs from 'node:fs';
import path from 'node:path';
import * as THREE from 'three';
import sharp from 'sharp';

const glbPath = path.resolve(process.cwd(), 'GLBs/mr-dog.glb');
if (!fs.existsSync(glbPath)) {
  console.error(`GLB file not found at ${glbPath}`);
  process.exit(1);
}

const fileBuf = fs.readFileSync(glbPath);
const fileSize = fileBuf.length;

// Parse GLB chunks
const magic = fileBuf.readUInt32LE(0);
const version = fileBuf.readUInt32LE(4);
const totalLength = fileBuf.readUInt32LE(8);
const jsonChunkLength = fileBuf.readUInt32LE(12);
const jsonChunkType = fileBuf.readUInt32LE(16);

const jsonBuffer = fileBuf.subarray(20, 20 + jsonChunkLength);
const gltf = JSON.parse(jsonBuffer.toString('utf8'));

let binBuffer = null;
if (fileBuf.length > 20 + jsonChunkLength) {
  const binOffset = 20 + jsonChunkLength;
  const binChunkLength = fileBuf.readUInt32LE(binOffset);
  const binChunkType = fileBuf.readUInt32LE(binOffset + 4);
  binBuffer = fileBuf.subarray(binOffset + 8, binOffset + 8 + binChunkLength);
}

console.log(`=== GLB HEADER ===`);
console.log(`File size: ${(fileSize / (1024 * 1024)).toFixed(2)} MB (${fileSize} bytes)`);
console.log(`GLB version: ${version}, declared length: ${totalLength}`);
console.log(`Nodes count: ${gltf.nodes?.length || 0}`);
console.log(`Meshes count: ${gltf.meshes?.length || 0}`);
console.log(`Materials count: ${gltf.materials?.length || 0}`);
console.log(`Textures count: ${gltf.textures?.length || 0}`);
console.log(`Images count: ${gltf.images?.length || 0}`);
console.log(`Extensions used:`, gltf.extensionsUsed || []);

// Reconstruct Three.js scene hierarchy
const threeNodes = (gltf.nodes || []).map((n, idx) => {
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
  obj.userData.gltfIdx = idx;
  obj.userData.meshIdx = n.mesh;
  return obj;
});

// Build hierarchy
(gltf.nodes || []).forEach((n, idx) => {
  if (n.children) {
    n.children.forEach((cIdx) => {
      threeNodes[idx].add(threeNodes[cIdx]);
    });
  }
});

const sceneRoot = new THREE.Group();
sceneRoot.name = 'SceneRoot';
const activeScene = gltf.scenes?.[gltf.scene ?? 0] || { nodes: [] };
(activeScene.nodes || []).forEach((rootNodeIdx) => {
  sceneRoot.add(threeNodes[rootNodeIdx]);
});
sceneRoot.updateMatrixWorld(true);

// Accessor reader helpers
function getAccessorBuffer(accIdx) {
  const acc = gltf.accessors[accIdx];
  const bv = gltf.bufferViews[acc.bufferView];
  const byteOffset = (bv.byteOffset || 0) + (acc.byteOffset || 0);
  return { acc, bv, byteOffset, buffer: binBuffer };
}

// Compute bounding boxes and triangles per mesh
let totalTriangles = 0;
const meshStats = (gltf.meshes || []).map((m, mIdx) => {
  let tris = 0;
  const primBBoxes = [];
  (m.primitives || []).forEach((prim) => {
    let primTris = 0;
    if (prim.indices !== undefined) {
      const { acc } = getAccessorBuffer(prim.indices);
      primTris = Math.floor(acc.count / 3);
    } else if (prim.attributes.POSITION !== undefined) {
      const { acc } = getAccessorBuffer(prim.attributes.POSITION);
      primTris = Math.floor(acc.count / 3);
    }
    tris += primTris;

    if (prim.attributes.POSITION !== undefined) {
      const { acc } = getAccessorBuffer(prim.attributes.POSITION);
      if (acc.min && acc.max) {
        primBBoxes.push(
          new THREE.Box3(
            new THREE.Vector3(...acc.min),
            new THREE.Vector3(...acc.max)
          )
        );
      }
    }
  });
  totalTriangles += tris;

  const combinedBox = new THREE.Box3();
  primBBoxes.forEach((b) => combinedBox.union(b));
  return {
    meshIdx: mIdx,
    name: m.name,
    primitivesCount: m.primitives?.length || 0,
    triangles: tris,
    localBox: combinedBox,
  };
});

// Compute world bounding box and stats for each node
const nodeDetails = [];
function traverseNode(node, depth = 0, parentName = null) {
  const worldPos = new THREE.Vector3();
  const worldQuat = new THREE.Quaternion();
  const worldScale = new THREE.Vector3();
  node.matrixWorld.decompose(worldPos, worldQuat, worldScale);

  const localPos = node.position.clone();
  const localScale = node.scale.clone();

  const meshIdx = node.userData.meshIdx;
  let triangles = 0;
  let localBox = null;
  let worldBox = null;

  if (meshIdx !== undefined && meshStats[meshIdx]) {
    const ms = meshStats[meshIdx];
    triangles = ms.triangles;
    localBox = ms.localBox.clone();
    worldBox = localBox.clone().applyMatrix4(node.matrixWorld);
  }

  nodeDetails.push({
    gltfIdx: node.userData.gltfIdx,
    name: node.name,
    parentName,
    depth,
    meshIdx,
    triangles,
    localPos: { x: localPos.x, y: localPos.y, z: localPos.z },
    localScale: { x: localScale.x, y: localScale.y, z: localScale.z },
    worldPos: { x: worldPos.x, y: worldPos.y, z: worldPos.z },
    localBox: localBox
      ? {
          min: { x: localBox.min.x, y: localBox.min.y, z: localBox.min.z },
          max: { x: localBox.max.x, y: localBox.max.y, z: localBox.max.z },
          size: {
            x: localBox.max.x - localBox.min.x,
            y: localBox.max.y - localBox.min.y,
            z: localBox.max.z - localBox.min.z,
          },
        }
      : null,
    worldBox: worldBox
      ? {
          min: { x: worldBox.min.x, y: worldBox.min.y, z: worldBox.min.z },
          max: { x: worldBox.max.x, y: worldBox.max.y, z: worldBox.max.z },
          size: {
            x: worldBox.max.x - worldBox.min.x,
            y: worldBox.max.y - worldBox.min.y,
            z: worldBox.max.z - worldBox.min.z,
          },
        }
      : null,
    childrenCount: node.children.length,
  });

  node.children.forEach((c) => traverseNode(c, depth + 1, node.name));
}

(activeScene.nodes || []).forEach((rootNodeIdx) => {
  traverseNode(threeNodes[rootNodeIdx], 0, null);
});

// Materials analysis
const materialDetails = (gltf.materials || []).map((m, mIdx) => {
  const pbr = m.pbrMetallicRoughness || {};
  return {
    index: mIdx,
    name: m.name,
    baseColorFactor: pbr.baseColorFactor || [1, 1, 1, 1],
    baseColorTexture: pbr.baseColorTexture ? gltf.textures?.[pbr.baseColorTexture.index]?.source : null,
    metallicFactor: pbr.metallicFactor ?? 1,
    roughnessFactor: pbr.roughnessFactor ?? 1,
    emissiveFactor: m.emissiveFactor || [0, 0, 0],
    emissiveTexture: m.emissiveTexture ? gltf.textures?.[m.emissiveTexture.index]?.source : null,
    clearcoat: m.extensions?.KHR_materials_clearcoat?.clearcoatFactor ?? null,
    doubleSided: m.doubleSided ?? false,
  };
});

// Image / Texture analysis
async function analyzeImages() {
  const imageDetails = [];
  if (gltf.images) {
    for (let i = 0; i < gltf.images.length; i++) {
      const img = gltf.images[i];
      let width = null, height = null, byteLength = null;
      if (img.bufferView !== undefined && binBuffer) {
        const bv = gltf.bufferViews[img.bufferView];
        const offset = bv.byteOffset || 0;
        const len = bv.byteLength;
        byteLength = len;
        const slice = binBuffer.subarray(offset, offset + len);
        try {
          const meta = await sharp(slice).metadata();
          width = meta.width;
          height = meta.height;
        } catch (e) {
          console.warn(`Could not read image metadata for image ${i}:`, e.message);
        }
      }
      imageDetails.push({
        index: i,
        name: img.name || `image_${i}`,
        mimeType: img.mimeType,
        byteLength,
        width,
        height,
      });
    }
  }
  return imageDetails;
}

const imageDetails = await analyzeImages();

// Rig contract check
const RIG_CONTRACT = {
  'Root, neck, head': ['MrDog_Root', 'Neck', 'Head'],
  'Ears and brows': ['Ear_L', 'Ear_R', 'Brow_L', 'Brow_R'],
  'Open eyes': ['Eyes_Open', 'Eye_L', 'Eye_R', 'Pupil_L', 'Pupil_R'],
  '✕ eyes': ['Eyes_X', 'X_L', 'X_R'],
  'Eyelids': ['Eyelid_L', 'Eyelid_R'],
  'Face': ['Nose', 'Jowl_L', 'Jowl_R', 'Lip_L', 'Lip_R', 'Jaw', 'Tongue'],
  'Collar': ['Collar', 'Tag'],
  'Outfits': ['Outfit_Home', 'Outfit_RedRoom', 'Outfit_Diwali'],
  'Outfit extras': ['Fangs', 'Sunglasses'],
};

const allContractNodes = Object.values(RIG_CONTRACT).flat();
const actualNodeNames = nodeDetails.map((n) => n.name);

const contractStatus = {};
for (const [group, nodes] of Object.entries(RIG_CONTRACT)) {
  contractStatus[group] = nodes.map((target) => {
    // Exact match
    const exact = nodeDetails.find((n) => n.name === target);
    if (exact) return { target, status: 'EXACT', actual: exact.name, node: exact };

    // Case-insensitive / prefix match
    const prefix = nodeDetails.find(
      (n) => n.name.toLowerCase().startsWith(target.toLowerCase())
    );
    if (prefix) return { target, status: 'PREFIX', actual: prefix.name, node: prefix };

    return { target, status: 'MISSING', actual: null, node: null };
  });
}

// Extra nodes not in contract
const matchedActualNames = new Set(
  Object.values(contractStatus).flatMap((list) =>
    list.filter((x) => x.actual).map((x) => x.actual)
  )
);
const extraNodes = nodeDetails.filter((n) => !matchedActualNames.has(n.name));

// Output comprehensive summary JSON for the report generator
const reportData = {
  glbPath,
  fileSize,
  totalTriangles,
  nodesCount: nodeDetails.length,
  meshesCount: meshStats.length,
  materialsCount: materialDetails.length,
  imagesCount: imageDetails.length,
  nodeDetails,
  meshStats,
  materialDetails,
  imageDetails,
  contractStatus,
  extraNodes: extraNodes.map((n) => ({
    name: n.name,
    parent: n.parentName,
    triangles: n.triangles,
    worldPos: n.worldPos,
  })),
};

fs.writeFileSync(
  path.resolve(process.cwd(), 'scripts/mr-dog-inspect-data.json'),
  JSON.stringify(reportData, null, 2)
);

console.log(`\n=== RIG CONTRACT STATUS ===`);
for (const [group, items] of Object.entries(contractStatus)) {
  console.log(`[${group}]`);
  items.forEach((item) => {
    console.log(`  - ${item.target}: ${item.status} ${item.actual ? `(${item.actual})` : ''}`);
  });
}

console.log(`\n=== EXTRA NODES (${extraNodes.length}) ===`);
extraNodes.forEach((n) => {
  console.log(`  - ${n.name} (parent: ${n.parentName}, mesh: ${n.meshIdx !== undefined})`);
});

console.log(`\nTotal triangles: ${totalTriangles}`);
console.log(`Report data written to scripts/mr-dog-inspect-data.json`);
