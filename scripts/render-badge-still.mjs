import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';
import sharp from 'sharp';

const rootDir = process.cwd();
const mediaDir = path.join(rootDir, 'public/media');
if (!fs.existsSync(mediaDir)) {
  fs.mkdirSync(mediaDir, { recursive: true });
}

async function renderBadgeStill() {
  console.log('Rendering authentic PINK badge still from public/models/badge-enamel.glb...');

  const glbPath = path.join(rootDir, 'public/models/badge-enamel.glb');
  const glbBase64 = fs.readFileSync(glbPath).toString('base64');
  const glbDataUri = `data:model/gltf-binary;base64,${glbBase64}`;

  const threeJsPath = path.join(rootDir, 'node_modules/three/build/three.module.js');
  const threeJs = fs.readFileSync(threeJsPath, 'utf8');

  // Launch headless browser with WebGL
  const browser = await chromium.launch({
    headless: true,
    args: ['--enable-webgl', '--use-gl=angle', '--use-angle=swiftshader'],
  });

  const page = await browser.newPage({
    viewport: { width: 1024, height: 1024, deviceScaleFactor: 1 },
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
  <script type="importmap">
    {
      "imports": {
        "three": "./node_modules/three/build/three.module.js",
        "three/addons/": "./node_modules/three/examples/jsm/"
      }
    }
  </script>
</head>
<body>
  <div id="container"></div>
  <script type="module">
    import * as THREE from 'https://esm.sh/three@0.186.1';
    import { GLTFLoader } from 'https://esm.sh/three@0.186.1/examples/jsm/loaders/GLTFLoader.js';
    import { MeshoptDecoder } from 'https://esm.sh/three@0.186.1/examples/jsm/libs/meshopt_decoder.module.js';

    const width = 1024;
    const height = 1024;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 20);
    camera.position.set(0, 0, 2.5);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, preserveDrawingBuffer: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(1);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.NeutralToneMapping;
    renderer.toneMappingExposure = 1.0;
    document.getElementById('container').appendChild(renderer.domElement);

    // Studio Lighting matching HomeStage.tsx for rich magenta and ink-black contrast
    const amb = new THREE.AmbientLight(0x0b0e14, 0.35);
    scene.add(amb);

    const dir1 = new THREE.DirectionalLight(0xffffff, 2.4);
    dir1.position.set(-4.0, 5.5, 4.0);
    scene.add(dir1);

    const dir2 = new THREE.DirectionalLight(0xfff5fa, 1.5);
    dir2.position.set(3.5, 2.5, 3.5);
    scene.add(dir2);

    const rim = new THREE.DirectionalLight(0xd9dce3, 1.8);
    rim.position.set(0, -3.5, 1.5);
    scene.add(rim);

    const loader = new GLTFLoader();
    loader.setMeshoptDecoder(MeshoptDecoder);
    loader.load('${glbDataUri}', (gltf) => {
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

  await page.setContent(html);

  // Wait for model render
  await page.waitForFunction(() => window.__READY === true || window.__ERROR !== undefined, { timeout: 15000 });

  const error = await page.evaluate(() => window.__ERROR);
  if (error) {
    throw new Error('WebGL render error: ' + error);
  }

  // Small delay for clean buffer flush
  await page.waitForTimeout(500);

  const pngPath = path.join(mediaDir, 'badge-enamel-still.png');
  await page.screenshot({ path: pngPath, omitBackground: true });
  console.log(`✓ Saved raw capture: ${pngPath}`);

  await browser.close();

  // Convert to WebP 1024px and 512px via sharp
  const webp1024 = path.join(mediaDir, 'badge-enamel-still.webp');
  const webp512 = path.join(mediaDir, 'badge-enamel-still-512.webp');

  await sharp(pngPath)
    .webp({ quality: 92, alphaQuality: 100, lossless: false })
    .toFile(webp1024);
  console.log(`✓ Saved 1024px WebP: ${webp1024}`);

  await sharp(pngPath)
    .resize(512, 512)
    .webp({ quality: 90, alphaQuality: 100, lossless: false })
    .toFile(webp512);
  console.log(`✓ Saved 512px WebP: ${webp512}`);

  console.log('Badge still generation complete!');
}

renderBadgeStill().catch(err => {
  console.error(err);
  process.exit(1);
});
