import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';

const srcDir = path.resolve(process.cwd(), 'brand-source/3d');
const destDir = path.resolve(process.cwd(), 'public/models');

if (!fs.existsSync(destDir)) {
  fs.mkdirSync(destDir, { recursive: true });
}

const files = fs.readdirSync(srcDir).filter((f) => f.endsWith('.glb'));

console.log(`Processing ${files.length} GLB files from ${srcDir}...`);

for (const file of files) {
  const inPath = path.join(srcDir, file);
  const outPath = path.join(destDir, file);

  console.log(`\nOptimizing ${file}...`);
  try {
    // Attempt gltf-transform optimization
    execSync(
      `npx @gltf-transform/cli optimize "${inPath}" "${outPath}" --compress meshopt --texture-compress webp --texture-size 1024`,
      { stdio: 'inherit' }
    );
  } catch (err) {
    console.warn(`gltf-transform failed for ${file}, falling back to direct copy:`, err.message);
    fs.copyFileSync(inPath, outPath);
  }

  const stat = fs.statSync(outPath);
  console.log(`✓ ${file}: ${(stat.size / 1024).toFixed(1)} KB`);
}

console.log('\nAll 3D assets ready in public/models/ !');
