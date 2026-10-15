import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright';
import sharp from 'sharp';

const rootDir = process.cwd();
const mediaDir = path.join(rootDir, 'public/media');
if (!fs.existsSync(mediaDir)) {
  fs.mkdirSync(mediaDir, { recursive: true });
}

async function renderStill(modelPath, outputName, lightingConfig) {
  console.log(`Rendering still for ${modelPath} -> ${outputName}...`);
  const glbBase64 = fs.readFileSync(path.join(rootDir, modelPath)).toString('base64');
  const glbDataUri = `data:model/gltf-binary;base64,${glbBase64}`;

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
    renderer.toneMapping = THREE.AgXToneMapping;
    renderer.toneMappingExposure = ${lightingConfig.exposure || 1.0};
    document.getElementById('container').appendChild(renderer.domElement);

    ${lightingConfig.code}

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
  await page.waitForFunction(() => window.__READY === true || window.__ERROR !== undefined, { timeout: 20000 });

  const error = await page.evaluate(() => window.__ERROR);
  if (error) {
    throw new Error('WebGL render error: ' + error);
  }

  await page.waitForTimeout(500);

  const pngPath = path.join(mediaDir, `${outputName}.png`);
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

  // 2. Neon Badge (Red Room)
  await renderStill('public/models/badge-neon.glb', 'badge-neon-still', {
    exposure: 1.0,
    code: `
      const amb = new THREE.AmbientLight(0x1a0508, 0.5);
      scene.add(amb);

      const key = new THREE.DirectionalLight(0xff2a40, 2.2);
      key.position.set(-3.0, 4.0, 3.0);
      scene.add(key);

      const rim = new THREE.DirectionalLight(0xff5577, 2.0);
      rim.position.set(2.0, -2.0, 2.0);
      scene.add(rim);

      const point = new THREE.PointLight(0xff002b, 2.5, 10);
      point.position.set(0, 0, 1.8);
      scene.add(point);
    `,
  });

  console.log('All badge stills generated successfully!');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
