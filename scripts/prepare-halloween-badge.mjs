// Turns the client's Halloween logo (brand-source/3d/halloween_main_logo.glb)
// into the Red Room badge source, GLBs/badge-halloween.glb. Materials, textures
// and geometry are the client's; only the node layout changes:
//   - every node transform is baked into its mesh, so the badge is 1 unit across
//     like the other skins;
//   - the eyes are split into Eye_L / Eye_R, each under a pivot at its centre,
//     so the badge can blink and wink;
//   - the mouth sits under a "Tongue" pivot at its top centre, with
//     extras.wag = 0.5 so it wags at half the neon badge's swing.
// Then: npm run models:optimize -- badge-halloween
import path from 'node:path';
import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { compactPrimitive, prune, transformMesh, transformPrimitive } from '@gltf-transform/functions';

const SRC = path.resolve('brand-source/3d/halloween_main_logo.glb');
const OUT = path.resolve('GLBs/badge-halloween.glb');
const IDENTITY = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
const translation = ([x, y, z]) => [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, x, y, z, 1];

const io = new NodeIO().registerExtensions(ALL_EXTENSIONS);
const doc = await io.read(SRC);
const root = doc.getRoot();
const node = (name) => {
  const found = root.listNodes().find((n) => n.getName() === name);
  if (!found) throw new Error(`${SRC} has no node "${name}"`);
  return found;
};

// 1. Bake transforms.
const nodes = root.listNodes();
const world = new Map(nodes.map((n) => [n, n.getWorldMatrix()]));
for (const n of nodes) if (n.getMesh()) transformMesh(n.getMesh(), world.get(n));
for (const n of nodes) n.setMatrix(IDENTITY);

function bounds(prim) {
  const pos = prim.getAttribute('POSITION');
  return { min: pos.getMin([]), max: pos.getMax([]) };
}

/** A copy of `prim` holding only the triangles `keep` accepts, with its own vertex streams. */
function subPrimitive(prim, keep) {
  const pos = prim.getAttribute('POSITION');
  const src = prim.getIndices().getArray();
  const kept = [];
  const a = [], b = [], c = [];
  for (let i = 0; i < src.length; i += 3) {
    pos.getElement(src[i], a);
    pos.getElement(src[i + 1], b);
    pos.getElement(src[i + 2], c);
    if (keep([(a[0] + b[0] + c[0]) / 3, (a[1] + b[1] + c[1]) / 3, (a[2] + b[2] + c[2]) / 3]))
      kept.push(src[i], src[i + 1], src[i + 2]);
  }
  const indices = doc.createAccessor().setType('SCALAR').setArray(new Uint32Array(kept)).setBuffer(root.listBuffers()[0]);
  const out = prim.clone().setIndices(indices);
  compactPrimitive(out);
  return out;
}

/** Puts `prim` under a pivot node at `pivot`, as pivot > `${name}_glyph` (mesh). */
function pivoted(name, prim, pivot, extras = {}) {
  transformPrimitive(prim, translation(pivot.map((v) => -v)));
  const mesh = doc.createMesh(name).addPrimitive(prim);
  const glyph = doc.createNode(`${name}_glyph`).setMesh(mesh);
  return doc.createNode(name).setTranslation(pivot).setExtras(extras).addChild(glyph);
}

const logo = node('underdogs_logo');

// 2. Eyes: two separate X marks, split at x = 0.
const eyes = node('eyes');
const eyesPrim = eyes.getMesh().listPrimitives()[0];
for (const [name, side] of [['Eye_L', -1], ['Eye_R', 1]]) {
  const prim = subPrimitive(eyesPrim, (centroid) => Math.sign(centroid[0]) === side);
  const { min, max } = bounds(prim);
  logo.addChild(pivoted(name, prim, [(min[0] + max[0]) / 2, (min[1] + max[1]) / 2, 0]));
}
eyes.getMesh().dispose();
eyes.dispose();

// 3. Mouth: one piece (bar and tongue), pivoting at its top centre.
const mouth = node('mouth');
const mouthPrim = mouth.getMesh().listPrimitives()[0];
const { min, max } = bounds(mouthPrim);
const tongue = pivoted('Tongue', mouthPrim.clone(), [(min[0] + max[0]) / 2, max[1], 0], { wag: 0.5 });
logo.addChild(tongue);
mouth.getMesh().dispose();
mouth.dispose();

await doc.transform(prune());
await io.write(OUT, doc);
console.log(`✓ ${path.relative(process.cwd(), OUT)}`);
