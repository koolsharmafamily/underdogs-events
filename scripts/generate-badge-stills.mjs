import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { chromium } from 'playwright';
import sharp from 'sharp';

// Renders transparent 512 px stills of the badge GLBs with the project's own three.js.
//   node scripts/generate-badge-stills.mjs              # every still
//   node scripts/generate-badge-stills.mjs halloween    # only stills whose name contains "halloween"
// CHROMIUM_PATH overrides the browser Playwright launches.
const rootDir = process.cwd();
const mediaDir = path.join(rootDir, 'public/media');
const threeDir = path.join(rootDir, 'node_modules/three');
const only = process.argv.slice(2);
const ORIGIN = 'http://stills.local';
if (!fs.existsSync(mediaDir)) {
  fs.mkdirSync(mediaDir, { recursive: true });
}

async function renderStill(modelPath, outputName, lightingConfig) {
  if (only.length && !only.some((o) => outputName.includes(o))) return;
  console.log(`Rendering still for ${modelPath} -> ${outputName}...`);
  const browser = await chromium.launch({
    headless: true,
    executablePath: process.env.CHROMIUM_PATH || undefined,
    args: ['--enable-webgl', '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'],
  });

  const page = await browser.newPage({
    viewport: { width: 1024, height: 1024, deviceScaleFactor: 1 },
  });
  // Serve the page, the model and three.js from disk; nothing leaves the machine.
  await page.route(`${ORIGIN}/**`, (route) => {
    const { pathname } = new URL(route.request().url());
    if (pathname === '/') return route.fulfill({ contentType: 'text/html', body: html });
    if (pathname === '/model.glb') return route.fulfill({ path: path.join(rootDir, modelPath) });
    if (pathname.startsWith('/three/')) return route.fulfill({ path: path.join(threeDir, pathname.slice('/three/'.length)) });
    return route.fulfill({ status: 404 });
  });

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body, html { margin: 0; padding: 0; overflow: hidden; background: transparent; width: 1024px; height: 1024px; }
    canvas { width: 1024px; height: 1024px; display: block; }
  </style>
</head>
<body>
  <div id="container"></div>
  <script type="importmap">{"imports":{"three":"/three/build/three.module.js","three/addons/":"/three/examples/jsm/"}}</script>
  <script type="module">
    import * as THREE from 'three';
    import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
    import { MeshoptDecoder } from 'three/addons/libs/meshopt_decoder.module.js';

    const width = 1024;
    const height = 1024;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 20);
    camera.position.set(0, 0, 2.5);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, preserveDrawingBuffer: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(1);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.AgXToneMapping;
    renderer.toneMappingExposure = ${lightingConfig.exposure || 1.0};
    document.getElementById('container').appendChild(renderer.domElement);

    ${lightingConfig.code}

    const loader = new GLTFLoader();
    loader.setMeshoptDecoder(MeshoptDecoder);
    loader.load('/model.glb', (gltf) => {
      const model = gltf.scene;
      model.position.set(0, 0, 0);
      model.rotation.set(0, 0, 0);
      model.scale.set(1.0, 1.0, 1.0);
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

  await page.goto(`${ORIGIN}/`);
  await page.waitForFunction(() => window.__READY === true || window.__ERROR !== undefined, { timeout: 20000 });

  const error = await page.evaluate(() => window.__ERROR);
  if (error) {
    throw new Error('WebGL render error: ' + error);
  }

  await page.waitForTimeout(500);

  // The full-size PNG is only an intermediate; the site serves the WebP.
  const pngPath = path.join(os.tmpdir(), `${outputName}.png`);
  await page.screenshot({ path: pngPath, omitBackground: true });
  await browser.close();

  // Convert to WebP 512px and 1024px
  const webp512 = path.join(mediaDir, `${outputName}.webp`);
  await sharp(pngPath)
    .resize(512, 512)
    .webp({ quality: 92, alphaQuality: 100, lossless: false })
    .toFile(webp512);

  console.log(`✓ Saved 512px WebP: ${webp512}`);
}

async function main() {
  // 1. Jewelled Badge (Diwali)
  await renderStill('public/models/badge-jewelled.glb', 'badge-jewelled-still', {
    exposure: 1.15,
    code: `
      const amb = new THREE.AmbientLight(0x42050E, 0.6);
      scene.add(amb);

      const key = new THREE.DirectionalLight(0xFFE3A3, 2.5);
      key.position.set(-3.5, 4.5, 3.5);
      scene.add(key);

      const rim = new THREE.DirectionalLight(0xE0217A, 2.8);
      rim.position.set(0.5, 2.0, -2.0);
      scene.add(rim);

      const fill = new THREE.DirectionalLight(0xE5B25D, 1.5);
      fill.position.set(3.0, 1.5, 2.5);
      scene.add(fill);

      const point = new THREE.PointLight(0xFFF6D6, 1.8, 10);
      point.position.set(0, 0, 2.0);
      scene.add(point);
    `,
  });

  // 2. Halloween Badge (Red Room): candle key from upper left, red rim behind right,
  // as in the Red Room set. The ring and halo carry their own glow.
  await renderStill('public/models/badge-halloween.glb', 'badge-halloween-still', {
    exposure: 1.0,
    code: `
      scene.add(new THREE.AmbientLight(0x2a0403, 0.6));

      const key = new THREE.PointLight(0xff9a4a, 9, 12, 2);
      key.position.set(-2.0, 1.4, 2.4);
      scene.add(key);

      const rim = new THREE.PointLight(0xff2a1f, 6, 10, 2);
      rim.position.set(1.8, 0.6, -1.0);
      scene.add(rim);
    `,
  });

  console.log('All badge stills generated successfully!');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
