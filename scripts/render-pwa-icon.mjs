import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';
import sharp from 'sharp';

const rootDir = process.cwd();
const mediaDir = path.join(rootDir, 'public/media');
const publicDir = path.join(rootDir, 'public');
const appDir = path.join(rootDir, 'app');
const splashDir = path.join(publicDir, 'splash');

if (!fs.existsSync(splashDir)) {
  fs.mkdirSync(splashDir, { recursive: true });
}

// 1. Render raw 3D coin on transparent background at high resolution (1400x1400)
async function renderRawCoin3D(turnDeg = 8.5) {
  const glbPath = path.join(rootDir, 'public/models/badge-enamel.glb');
  const glbBase64 = fs.readFileSync(glbPath).toString('base64');
  const glbDataUri = `data:model/gltf-binary;base64,${glbBase64}`;

  const browser = await chromium.launch({
    headless: true,
    args: ['--enable-webgl', '--use-gl=angle', '--use-angle=swiftshader'],
  });

  const page = await browser.newPage({
    viewport: { width: 1400, height: 1400, deviceScaleFactor: 1 },
  });

  const turnRad = (turnDeg * Math.PI) / 180;
  const pitchRad = (3.5 * Math.PI) / 180;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body, html { margin: 0; padding: 0; overflow: hidden; background: transparent; width: 1400px; height: 1400px; }
    canvas { width: 1400px; height: 1400px; display: block; }
  </style>
</head>
<body>
  <div id="container"></div>
  <script type="module">
    import * as THREE from 'https://esm.sh/three@0.186.1';
    import { GLTFLoader } from 'https://esm.sh/three@0.186.1/examples/jsm/loaders/GLTFLoader.js';
    import { MeshoptDecoder } from 'https://esm.sh/three@0.186.1/examples/jsm/libs/meshopt_decoder.module.js';
    import { RoomEnvironment } from 'https://esm.sh/three@0.186.1/examples/jsm/environments/RoomEnvironment.js';

    const width = 1400;
    const height = 1400;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(28, 1, 0.1, 50);
    camera.position.set(0, 0, 3.2);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, preserveDrawingBuffer: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(1);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.NeutralToneMapping;
    renderer.toneMappingExposure = 1.0;
    document.getElementById('container').appendChild(renderer.domElement);

    // Studio Lighting matching authentic GLB deep magenta
    const ambLight = new THREE.AmbientLight(0x0b0e14, 0.4);
    scene.add(ambLight);

    // Pure white key light top-left for crisp specular chrome bevel and white letters
    const keyLight = new THREE.DirectionalLight(0xffffff, 2.3);
    keyLight.position.set(-3.8, 5.0, 3.8);
    scene.add(keyLight);

    // Soft neutral fill from right
    const fillLight = new THREE.DirectionalLight(0xffffff, 1.1);
    fillLight.position.set(3.8, 2.0, 3.0);
    scene.add(fillLight);

    // Thin magenta rim light highlighting bevel and rim thickness (#D73EBC)
    const rimLight = new THREE.DirectionalLight(0xd73ebc, 2.0);
    rimLight.position.set(1.5, -3.8, 2.2);
    scene.add(rimLight);

    // Chrome reflection kicker for lower rim thickness
    const chromeKicker = new THREE.DirectionalLight(0xd9dce3, 1.5);
    chromeKicker.position.set(-1.0, -3.2, 2.0);
    scene.add(chromeKicker);

    const loader = new GLTFLoader();
    loader.setMeshoptDecoder(MeshoptDecoder);
    loader.load('${glbDataUri}', (gltf) => {
      const model = gltf.scene;

      // Center the model geometry
      const box = new THREE.Box3().setFromObject(model);
      const center = box.getCenter(new THREE.Vector3());
      const size = box.getSize(new THREE.Vector3());
      model.position.sub(center);

      // Apply subtle 8-10° turn so bevel and rim thickness show cleanly
      model.rotation.set(${pitchRad}, ${turnRad}, -0.015);
      
      const maxDim = Math.max(size.x, size.y);
      const targetScale = 1.35 / maxDim;
      model.scale.set(targetScale, targetScale, targetScale);

      scene.add(model);

      renderer.render(scene, camera);
      window.__READY = true;
    }, undefined, (err) => {
      console.error(err);
      window.__ERROR = err.message;
    });
  </script>
</body>
</html>
  `;

  await page.setContent(html);
  await page.waitForFunction(() => window.__READY === true || window.__ERROR !== undefined, { timeout: 25000 });

  const error = await page.evaluate(() => window.__ERROR);
  if (error) {
    await browser.close();
    throw new Error('WebGL render error: ' + error);
  }

  await page.waitForTimeout(500);

  const rawBuffer = await page.screenshot({ omitBackground: true });
  await browser.close();

  // Trim transparent padding to get exact coin bounds
  const trimmed = await sharp(rawBuffer).trim().toBuffer();
  return trimmed;
}

// 2. Generate premium background SVG: deep ink #07090D, radial magenta glow (~10%), vignette
function generateBackgroundSvg(canvasW, canvasH, coinDiameter, coinCenterY) {
  const coinRadius = coinDiameter / 2;
  const shadowY = coinCenterY + coinRadius * 0.985;
  const shadowRx = coinRadius * 0.72;
  const shadowRy = coinRadius * 0.095;
  const glowRadius = coinRadius * 1.3;

  return Buffer.from(`
<svg width="${canvasW}" height="${canvasH}" viewBox="0 0 ${canvasW} ${canvasH}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <!-- Background Radial Gradient: deep ink #07090D with soft magenta glow behind the coin (~10%) -->
    <radialGradient id="bgGlow" cx="50%" cy="${(coinCenterY / canvasH) * 100}%" r="${(glowRadius / canvasW) * 100}%">
      <stop offset="0%" stop-color="#D73EBC" stop-opacity="0.16"/>
      <stop offset="30%" stop-color="#801C70" stop-opacity="0.10"/>
      <stop offset="55%" stop-color="#260C25" stop-opacity="0.05"/>
      <stop offset="85%" stop-color="#0E0A12" stop-opacity="0.01"/>
      <stop offset="100%" stop-color="#07090D" stop-opacity="0.0"/>
    </radialGradient>

    <!-- Faint Vignette towards the outer corners -->
    <radialGradient id="vignette" cx="50%" cy="50%" r="72%">
      <stop offset="55%" stop-color="#000000" stop-opacity="0.0"/>
      <stop offset="85%" stop-color="#030406" stop-opacity="0.35"/>
      <stop offset="100%" stop-color="#010203" stop-opacity="0.65"/>
    </radialGradient>

    <!-- Floor Contact Shadow directly under the bottom coin edge -->
    <radialGradient id="contactShadow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#000000" stop-opacity="0.95"/>
      <stop offset="35%" stop-color="#000000" stop-opacity="0.80"/>
      <stop offset="70%" stop-color="#07090D" stop-opacity="0.25"/>
      <stop offset="100%" stop-color="#07090D" stop-opacity="0.0"/>
    </radialGradient>

    <!-- Subtle Magenta Reflection / Ambient Floor Glow -->
    <radialGradient id="floorReflectionGlow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#D73EBC" stop-opacity="0.18"/>
      <stop offset="45%" stop-color="#D73EBC" stop-opacity="0.05"/>
      <stop offset="100%" stop-color="#07090D" stop-opacity="0.0"/>
    </radialGradient>
  </defs>

  <!-- Deep ink base fill #07090D -->
  <rect width="${canvasW}" height="${canvasH}" fill="#07090D"/>

  <!-- Soft radial glow behind the coin -->
  <rect width="${canvasW}" height="${canvasH}" fill="url(#bgGlow)"/>

  <!-- Soft reflection glow on the floor -->
  <ellipse cx="${canvasW / 2}" cy="${shadowY + 5}" rx="${shadowRx * 0.9}" ry="${shadowRy * 1.5}" fill="url(#floorReflectionGlow)"/>

  <!-- Soft contact shadow directly under the coin rim -->
  <ellipse cx="${canvasW / 2}" cy="${shadowY}" rx="${shadowRx}" ry="${shadowRy}" fill="url(#contactShadow)"/>

  <!-- Corner vignette -->
  <rect width="${canvasW}" height="${canvasH}" fill="url(#vignette)"/>
</svg>
`);
}

// 3. Build subtle floor reflection from the bottom of the coin with feathered radial mask (no hard edge lines!)
async function buildFloorReflection(trimmedCoin, coinW, coinH) {
  const cropH = Math.round(coinH * 0.22);
  const cropTop = coinH - cropH;

  const bottomSection = await sharp(trimmedCoin)
    .extract({ left: 0, top: cropTop, width: coinW, height: cropH })
    .flip() // vertical mirror
    .blur(5)
    .toBuffer();

  // Create elliptical fade mask with feathered sides to guarantee zero edge lines
  const fadeMaskSvg = Buffer.from(`
<svg width="${coinW}" height="${cropH}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="refFade" cx="50%" cy="0%" r="80%">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0.25"/>
      <stop offset="35%" stop-color="#ffffff" stop-opacity="0.12"/>
      <stop offset="70%" stop-color="#ffffff" stop-opacity="0.03"/>
      <stop offset="100%" stop-color="#ffffff" stop-opacity="0.0"/>
    </radialGradient>
  </defs>
  <rect width="${coinW}" height="${cropH}" fill="url(#refFade)"/>
</svg>
`);

  const fadeMask = await sharp(fadeMaskSvg).toColourspace('b-w').toBuffer();

  const reflection = await sharp(bottomSection)
    .ensureAlpha()
    .composite([
      {
        input: fadeMask,
        blend: 'dest-in',
      },
    ])
    .toBuffer();

  return { buffer: reflection, height: cropH };
}

// 4. Assemble complete premium icon
async function assemblePremiumIcon(trimmedCoin, canvasSize, coinFillFraction, isMaskable = false) {
  const coinTargetSize = Math.round(canvasSize * coinFillFraction);

  // Resize coin with 100% transparent letterboxing background (zero edge lines)
  const coinResized = await sharp(trimmedCoin)
    .resize(coinTargetSize, coinTargetSize, {
      fit: 'contain',
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .toBuffer();

  const coinMeta = await sharp(coinResized).metadata();
  const coinW = coinMeta.width;
  const coinH = coinMeta.height;

  // Center coin slightly above center for grounded weight
  const coinLeft = Math.round((canvasSize - coinW) / 2);
  const coinTop = Math.round((canvasSize - coinH) / 2) - Math.round(canvasSize * 0.015);
  const coinCenterY = coinTop + coinH / 2;

  // Generate background SVG
  const bgSvg = generateBackgroundSvg(canvasSize, canvasSize, Math.max(coinW, coinH), coinCenterY);
  const bgBuffer = await sharp(bgSvg).resize(canvasSize, canvasSize).png().toBuffer();

  // Generate soft floor reflection
  const { buffer: reflectionBuffer, height: refH } = await buildFloorReflection(coinResized, coinW, coinH);
  const reflectionTop = coinTop + coinH - 4;

  // Composite: Background -> Floor reflection -> Coin
  const compositeLayers = [
    {
      input: reflectionBuffer,
      left: coinLeft,
      top: Math.min(reflectionTop, canvasSize - refH),
    },
    {
      input: coinResized,
      left: coinLeft,
      top: coinTop,
    },
  ];

  const finalIcon = await sharp(bgBuffer)
    .composite(compositeLayers)
    .png({ quality: 100, compressionLevel: 9 })
    .toBuffer();

  return finalIcon;
}

export { renderRawCoin3D, assemblePremiumIcon };
