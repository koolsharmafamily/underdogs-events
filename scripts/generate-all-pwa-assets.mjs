import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';
import { renderRawCoin3D, assemblePremiumIcon } from './render-pwa-icon.mjs';

const rootDir = process.cwd();
const publicDir = path.join(rootDir, 'public');
const appDir = path.join(rootDir, 'app');
const splashDir = path.join(publicDir, 'splash');

if (!fs.existsSync(splashDir)) {
  fs.mkdirSync(splashDir, { recursive: true });
}

// Splash screen generator: ink background with coin centered at 30% width
async function generateSplash(trimmedCoin, width, height) {
  const coinWidth = Math.round(width * 0.30);
  
  // Resize coin preserving aspect ratio
  const coinResized = await sharp(trimmedCoin)
    .resize(coinWidth, coinWidth, {
      fit: 'contain',
      background: { r: 0, g: 0, b: 0, alpha: 0 }
    })
    .toBuffer();

  const coinMeta = await sharp(coinResized).metadata();
  const coinW = coinMeta.width;
  const coinH = coinMeta.height;

  const coinLeft = Math.round((width - coinW) / 2);
  const coinTop = Math.round((height - coinH) / 2) - Math.round(height * 0.02);
  const coinCenterY = coinTop + coinH / 2;

  // Background with subtle magenta radial glow and contact shadow
  const shadowY = coinCenterY + (coinH / 2) * 0.985;
  const shadowRx = (coinW / 2) * 0.72;
  const shadowRy = (coinH / 2) * 0.095;
  const glowRadius = (coinW / 2) * 1.5;

  const bgSvg = Buffer.from(`
<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="splashGlow" cx="50%" cy="${(coinCenterY / height) * 100}%" r="${(glowRadius / width) * 100}%">
      <stop offset="0%" stop-color="#D73EBC" stop-opacity="0.14"/>
      <stop offset="35%" stop-color="#240B22" stop-opacity="0.08"/>
      <stop offset="65%" stop-color="#0F0814" stop-opacity="0.03"/>
      <stop offset="100%" stop-color="#07090D" stop-opacity="0.0"/>
    </radialGradient>

    <radialGradient id="splashShadow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#000000" stop-opacity="0.95"/>
      <stop offset="40%" stop-color="#000000" stop-opacity="0.75"/>
      <stop offset="75%" stop-color="#07090D" stop-opacity="0.25"/>
      <stop offset="100%" stop-color="#07090D" stop-opacity="0.0"/>
    </radialGradient>

    <radialGradient id="floorGlow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#D73EBC" stop-opacity="0.16"/>
      <stop offset="45%" stop-color="#D73EBC" stop-opacity="0.05"/>
      <stop offset="100%" stop-color="#07090D" stop-opacity="0.0"/>
    </radialGradient>
  </defs>

  <!-- Deep ink base fill #07090D -->
  <rect width="${width}" height="${height}" fill="#07090D"/>

  <!-- Radial aura behind coin -->
  <rect width="${width}" height="${height}" fill="url(#splashGlow)"/>

  <!-- Floor reflection glow -->
  <ellipse cx="${width / 2}" cy="${shadowY + 4}" rx="${shadowRx * 0.9}" ry="${shadowRy * 1.5}" fill="url(#floorGlow)"/>

  <!-- Contact shadow -->
  <ellipse cx="${width / 2}" cy="${shadowY}" rx="${shadowRx}" ry="${shadowRy}" fill="url(#splashShadow)"/>
</svg>
`);

  const bgBuffer = await sharp(bgSvg).resize(width, height).png().toBuffer();

  const finalSplash = await sharp(bgBuffer)
    .composite([
      {
        input: coinResized,
        left: coinLeft,
        top: coinTop,
      },
    ])
    .png({ quality: 95, compressionLevel: 8 })
    .toBuffer();

  return finalSplash;
}

async function main() {
  console.log('--- Step 1: Rendering 3D Coin from badge-enamel.glb ---');
  const trimmedCoin = await renderRawCoin3D(8.5);
  console.log('✓ 3D Coin rendered and trimmed cleanly');

  console.log('--- Step 2: Generating Master 1024x1024 Icons ---');
  // Standard master: coin fills ~72% of canvas, centered
  const masterStandard1024 = await assemblePremiumIcon(trimmedCoin, 1024, 0.72, false);
  // Maskable master: coin fills ~62% of canvas, inside the inner 80% safe zone
  const masterMaskable1024 = await assemblePremiumIcon(trimmedCoin, 1024, 0.62, true);

  console.log('--- Step 3: Exporting PWA Icons with Lanczos3 Sharpening ---');
  
  // 1. apple-touch-icon.png (180x180)
  const appleTouch180 = await sharp(masterStandard1024)
    .resize(180, 180, { kernel: sharp.kernel.lanczos3 })
    .sharpen({ sigma: 0.6, m1: 0.5, m2: 2 })
    .png({ quality: 100 })
    .toBuffer();
  fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), appleTouch180);
  fs.writeFileSync(path.join(appDir, 'apple-icon.png'), appleTouch180);
  console.log('✓ Saved public/apple-touch-icon.png (180x180) & app/apple-icon.png');

  // 2. icon-192.png (192x192, purpose: "any")
  const icon192 = await sharp(masterStandard1024)
    .resize(192, 192, { kernel: sharp.kernel.lanczos3 })
    .sharpen({ sigma: 0.6, m1: 0.5, m2: 2 })
    .png({ quality: 100 })
    .toBuffer();
  fs.writeFileSync(path.join(publicDir, 'icon-192.png'), icon192);
  console.log('✓ Saved public/icon-192.png (192x192, any)');

  // 3. icon-512.png (512x512, purpose: "any")
  const icon512 = await sharp(masterStandard1024)
    .resize(512, 512, { kernel: sharp.kernel.lanczos3 })
    .sharpen({ sigma: 0.5, m1: 0.4, m2: 2 })
    .png({ quality: 100 })
    .toBuffer();
  fs.writeFileSync(path.join(publicDir, 'icon-512.png'), icon512);
  console.log('✓ Saved public/icon-512.png (512x512, any)');

  // 4. maskable-192.png (192x192, purpose: "maskable")
  const maskable192 = await sharp(masterMaskable1024)
    .resize(192, 192, { kernel: sharp.kernel.lanczos3 })
    .sharpen({ sigma: 0.6, m1: 0.5, m2: 2 })
    .png({ quality: 100 })
    .toBuffer();
  fs.writeFileSync(path.join(publicDir, 'maskable-192.png'), maskable192);
  console.log('✓ Saved public/maskable-192.png (192x192, maskable)');

  // 5. maskable-512.png (512x512, purpose: "maskable")
  const maskable512 = await sharp(masterMaskable1024)
    .resize(512, 512, { kernel: sharp.kernel.lanczos3 })
    .sharpen({ sigma: 0.5, m1: 0.4, m2: 2 })
    .png({ quality: 100 })
    .toBuffer();
  fs.writeFileSync(path.join(publicDir, 'maskable-512.png'), maskable512);
  console.log('✓ Saved public/maskable-512.png (512x512, maskable)');

  // 6. favicon-32x32.png and favicon.ico
  const favicon32 = await sharp(masterStandard1024)
    .resize(32, 32, { kernel: sharp.kernel.lanczos3 })
    .sharpen({ sigma: 0.8, m1: 0.8, m2: 2 })
    .png({ quality: 100 })
    .toBuffer();
  fs.writeFileSync(path.join(publicDir, 'favicon-32x32.png'), favicon32);
  fs.writeFileSync(path.join(publicDir, 'favicon.ico'), favicon32);
  fs.writeFileSync(path.join(appDir, 'favicon.ico'), favicon32);
  console.log('✓ Saved public/favicon-32x32.png & favicon.ico');

  console.log('--- Step 4: Generating iOS Startup Splash Screens (~30% coin width) ---');
  const splashSizes = [
    { w: 1179, h: 2556, name: 'apple-splash-1179-2556.png' }, // iPhone 16 Pro / 15 Pro / 14 Pro
    { w: 1290, h: 2796, name: 'apple-splash-1290-2796.png' }, // iPhone 16 Pro Max / 15 Pro Max
    { w: 1170, h: 2532, name: 'apple-splash-1170-2532.png' }, // iPhone 16 / 15 / 14 / 13 / 12
    { w: 1284, h: 2778, name: 'apple-splash-1284-2778.png' }, // iPhone 14 Plus / 13 Pro Max
    { w: 1125, h: 2436, name: 'apple-splash-1125-2436.png' }, // iPhone 13 mini / 11 Pro / X
    { w: 750, h: 1334, name: 'apple-splash-750-1334.png' },   // iPhone SE 3/2 / 8
  ];

  for (const s of splashSizes) {
    const splashBuf = await generateSplash(trimmedCoin, s.w, s.h);
    fs.writeFileSync(path.join(splashDir, s.name), splashBuf);
    console.log(`✓ Saved public/splash/${s.name} (${s.w}x${s.h})`);
  }

  console.log('All PWA icons and splash screens successfully generated!');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
