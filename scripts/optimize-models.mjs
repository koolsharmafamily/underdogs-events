// Optimises GLBs/*.glb into public/models with the gltf-transform library
// (Meshopt geometry + WebP textures at 1024), keeping every node, name and anchor.
//
//   npm run models:optimize                 # all models
//   npm run models:optimize -- badge-       # only files whose name contains "badge-"
import fs from 'node:fs';
import path from 'node:path';
import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS, EXTMeshoptCompression } from '@gltf-transform/extensions';
import { dedup, meshopt, textureCompress } from '@gltf-transform/functions';
import { MeshoptDecoder, MeshoptEncoder } from 'meshoptimizer';
import sharp from 'sharp';

const srcDir = path.resolve(process.cwd(), 'GLBs');
const destDir = path.resolve(process.cwd(), 'public/models');
const only = process.argv.slice(2);

// Small props whose instancing code reads raw positions: geometry stays exact.
const COPY_VERBATIM = new Set([
  'diwali-diya-brass.glb',
  'diwali-diya-terracotta.glb',
  'diwali-kandil.glb',
  'diwali-marigold.glb',
  'diwali-rose-petal.glb',
  'diwali-card.glb',
  'redroom-candle.glb',
  'redroom-invitation.glb',
]);

// The badge dissolve samples noise in badge-root space (dissolve.glsl.ts), so
// quantized vertex positions are safe for the badges too.
// The Halloween logo's face texture is drawn at 2048; the badge is shown large.
const TEXTURE_SIZE = { 'badge-halloween.glb': 2048 };
const BUDGETS_MB = { home: 2.5, redroom: 6.0, diwali: 5.0, mrdog: 2.0 };
const WORLD_FILES = {
  home: (f) => f === 'badge-enamel.glb' || f.startsWith('door-'),
  redroom: (f) => f.startsWith('redroom-') || f === 'curtain-open.glb' || f === 'badge-halloween.glb',
  diwali: (f) => f === 'badge-jewelled.glb',
  mrdog: (f) => f === 'mr-dog.glb' || f === 'mr-dog-party-coin.glb',
};

function countTriangles(doc) {
  let tris = 0;
  for (const mesh of doc.getRoot().listMeshes())
    for (const prim of mesh.listPrimitives()) {
      if (prim.getMode() !== 4) continue;
      const idx = prim.getIndices();
      tris += Math.floor((idx ? idx.getCount() : prim.getAttribute('POSITION').getCount()) / 3);
    }
  return tris;
}

await MeshoptEncoder.ready;
await MeshoptDecoder.ready;
const io = new NodeIO()
  .registerExtensions(ALL_EXTENSIONS)
  .registerDependencies({ 'meshopt.encoder': MeshoptEncoder, 'meshopt.decoder': MeshoptDecoder });

fs.mkdirSync(destDir, { recursive: true });
const files = fs.readdirSync(srcDir).filter((f) => f.endsWith('.glb') && (!only.length || only.some((o) => f.includes(o))));
console.log(`Processing ${files.length} GLB file(s) from ${srcDir}`);

for (const file of files) {
  const inPath = path.join(srcDir, file);
  const outPath = path.join(destDir, file);
  if (COPY_VERBATIM.has(file)) {
    // Lossless Meshopt only (no quantisation), as scripts/compress-models.mjs does.
    const doc = await io.read(inPath);
    doc
      .createExtension(EXTMeshoptCompression)
      .setRequired(true)
      .setEncoderOptions({ method: EXTMeshoptCompression.EncoderMethod.QUANTIZE });
    await io.write(outPath, doc);
  } else {
    const doc = await io.read(inPath);
    await doc.transform(
      dedup(),
      textureCompress({ encoder: sharp, targetFormat: 'webp', resize: [TEXTURE_SIZE[file] ?? 1024, TEXTURE_SIZE[file] ?? 1024] }),
      // One quantisation volume per model keeps every node's origin in place, so
      // the eye and tongue pivots the badge animates stay where they were drawn.
      meshopt({ encoder: MeshoptEncoder, level: 'medium', quantizationVolume: 'scene' }),
    );
    await io.write(outPath, doc);
  }
  const tris = countTriangles(await io.read(outPath));
  const kb = fs.statSync(inPath).size / 1024;
  const outKb = fs.statSync(outPath).size / 1024;
  console.log(`✓ ${file}: ${kb.toFixed(0)} KB → ${outKb.toFixed(0)} KB (${tris.toLocaleString()} triangles)`);
}

console.log('\nModel budget (public/models):');
let failed = false;
for (const [world, test] of Object.entries(WORLD_FILES)) {
  const bytes = fs.readdirSync(destDir).filter(test).reduce((sum, f) => sum + fs.statSync(path.join(destDir, f)).size, 0);
  const mb = bytes / 1024 / 1024;
  const ok = mb <= BUDGETS_MB[world];
  failed ||= !ok;
  console.log(`  ${world}: ${mb.toFixed(2)} MB / ${BUDGETS_MB[world]} MB ${ok ? 'PASS' : 'FAIL'}`);
}
if (failed) process.exit(1);
