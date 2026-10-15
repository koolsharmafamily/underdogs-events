import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const rootDir = process.cwd();
const mediaDir = path.join(rootDir, 'public/media');
const publicDir = path.join(rootDir, 'public');

async function main() {
  const sourcePath = path.join(mediaDir, 'badge-enamel-still.png');
  if (!fs.existsSync(sourcePath)) {
    console.error('Source badge image not found!');
    process.exit(1);
  }

  // 1. Generate 192x192 icon
  await sharp(sourcePath)
    .resize(192, 192, { fit: 'contain', background: { r: 7, g: 9, b: 13, alpha: 1 } })
    .png()
    .toFile(path.join(publicDir, 'icon-192.png'));
  console.log('✓ Generated public/icon-192.png');

  // 2. Generate 512x512 icon
  await sharp(sourcePath)
    .resize(512, 512, { fit: 'contain', background: { r: 7, g: 9, b: 13, alpha: 1 } })
    .png()
    .toFile(path.join(publicDir, 'icon-512.png'));
  console.log('✓ Generated public/icon-512.png');

  // 3. Generate apple-touch-icon.png (180x180)
  await sharp(sourcePath)
    .resize(180, 180, { fit: 'contain', background: { r: 7, g: 9, b: 13, alpha: 1 } })
    .png()
    .toFile(path.join(publicDir, 'apple-touch-icon.png'));
  console.log('✓ Generated public/apple-touch-icon.png');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
