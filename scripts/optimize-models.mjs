import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';

const srcDir = path.resolve(process.cwd(), 'GLBs');
const destDir = path.resolve(process.cwd(), 'public/models');

if (!fs.existsSync(destDir)) {
  fs.mkdirSync(destDir, { recursive: true });
}

/**
 * Parses the JSON chunk of a GLB file to compute total triangle count.
 */
function countGlbTriangles(filePath) {
  try {
    const buf = fs.readFileSync(filePath);
    if (buf.length < 20) return 0;
    const magic = buf.readUInt32LE(0);
    if (magic !== 0x46546c67) return 0; // 'glTF'
    const jsonChunkLength = buf.readUInt32LE(12);
    const jsonChunkType = buf.readUInt32LE(16);
    if (jsonChunkType !== 0x4e4f534a) return 0; // 'JSON'
    const jsonStr = buf.subarray(20, 20 + jsonChunkLength).toString('utf8');
    const gltf = JSON.parse(jsonStr);
    const accessors = gltf.accessors || [];
    const meshes = gltf.meshes || [];
    let tris = 0;
    for (const mesh of meshes) {
      for (const prim of mesh.primitives || []) {
        const mode = prim.mode ?? 4; // 4 = TRIANGLES
        if (mode !== 4) continue;
        if (prim.indices !== undefined && accessors[prim.indices]) {
          tris += Math.floor((accessors[prim.indices].count || 0) / 3);
        } else if (prim.attributes?.POSITION !== undefined && accessors[prim.attributes.POSITION]) {
          tris += Math.floor((accessors[prim.attributes.POSITION].count || 0) / 3);
        }
      }
    }
    return tris;
  } catch {
    return 0;
  }
}

const files = fs.readdirSync(srcDir).filter((f) => f.endsWith('.glb'));

console.log(`Processing ${files.length} GLB files from ${srcDir}...`);

const report = [];

const COPY_VERBATIM = new Set([
  'badge-enamel.glb',
  'badge-neon.glb',
  'badge-jewelled.glb',
  'diwali-diya-brass.glb',
  'diwali-diya-terracotta.glb',
  'diwali-kandil.glb',
  'diwali-marigold.glb',
  'diwali-rose-petal.glb',
  'diwali-card.glb',
  'redroom-candle.glb',
  'redroom-invitation.glb',
]);

for (const file of files) {
  const inPath = path.join(srcDir, file);
  const outPath = path.join(destDir, file);

  if (COPY_VERBATIM.has(file)) {
    console.log(`\nCopying original ${file} verbatim...`);
    fs.copyFileSync(inPath, outPath);
  } else {
    console.log(`\nOptimizing ${file} (preserving full scene graph & anchors)...`);
    try {
      execSync(
        `npx @gltf-transform/cli optimize "${inPath}" "${outPath}" --compress meshopt --texture-compress webp --texture-size 1024 --join false --flatten false --prune false --palette false --simplify false`,
        { stdio: 'pipe' }
      );
    } catch {
      fs.copyFileSync(inPath, outPath);
    }
  }

  const stat = fs.statSync(outPath);
  const tris = countGlbTriangles(outPath);
  const kb = stat.size / 1024;
  report.push({ file, bytes: stat.size, kb: Number(kb.toFixed(1)), triangles: tris });
  console.log(`✓ ${file}: ${kb.toFixed(1)} KB (${tris.toLocaleString()} triangles)`);
}

// Part 12.4 World Budgets (MB)
const BUDGETS_MB = {
  home: 2.5,
  redroom: 6.0,
  diwali: 5.0,
};

function sumWorldBytes(predicate) {
  return report.filter((r) => predicate(r.file)).reduce((acc, r) => acc + r.bytes, 0);
}

const homeBytes = sumWorldBytes(
  (f) => f === 'badge-enamel.glb' || f.startsWith('door-')
);
const redroomBytes = sumWorldBytes(
  (f) => f.startsWith('redroom-') || f === 'curtain-open.glb' || f === 'badge-neon.glb'
);
const diwaliBytes = sumWorldBytes(
  (f) => f.startsWith('diwali-') || f === 'curtain-open-diwali.glb' || f === 'badge-jewelled.glb'
);

const worldSummary = [
  { world: 'Home', mb: homeBytes / (1024 * 1024), budgetMb: BUDGETS_MB.home },
  { world: 'The Red Room', mb: redroomBytes / (1024 * 1024), budgetMb: BUDGETS_MB.redroom },
  { world: 'Diwali', mb: diwaliBytes / (1024 * 1024), budgetMb: BUDGETS_MB.diwali },
];

console.log('\n=== Part 12.4 Model Budget Report ===');
let budgetFailed = false;
for (const w of worldSummary) {
  const status = w.mb <= w.budgetMb ? 'PASS' : 'FAIL';
  if (w.mb > w.budgetMb) budgetFailed = true;
  console.log(`${w.world}: ${w.mb.toFixed(2)} MB / ${w.budgetMb.toFixed(2)} MB [${status}]`);
}

if (budgetFailed) {
  console.error('\nERROR: One or more worlds exceeded the Part 12.4 model size budget!');
  process.exit(1);
}

console.log('\nAll 3D assets verified and within Part 12.4 budgets!');
