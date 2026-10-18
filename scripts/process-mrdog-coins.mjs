import fs from "node:fs";
import path from "node:path";
import { NodeIO } from "@gltf-transform/core";
import { ALL_EXTENSIONS } from "@gltf-transform/extensions";
import { dedup, meshopt } from "@gltf-transform/functions";
import { MeshoptEncoder, MeshoptDecoder } from "meshoptimizer";
import { chromium } from "playwright";
import sharp from "sharp";

const rootDir = process.cwd();

const COINS = [
  {
    src: "Mr. Dog/mr-dog-coin-OG.glb",
    targetName: "mr-dog-coin-OG.glb",
    outfit: "home",
  },
  {
    src: "Mr. Dog/mr-dog-coin-red-room.glb",
    targetName: "mr-dog-coin-red-room.glb",
    outfit: "redroom",
  },
  {
    src: "Mr. Dog/mr-dog-coin-diwali.glb",
    targetName: "mr-dog-coin-diwali.glb",
    outfit: "diwali",
  },
];

const STILLS = [
  "avatar",
  "avatar-blink",
  "avatar-wink",
  "avatar-x",
  "greet",
  "idle",
  "listening",
  "rage",
  "shrug",
  "sorry",
  "talk-closed",
  "talk-open",
  "talk-round",
  "talk-small",
  "talking",
  "thinking",
  "wink",
];

async function prepareAndCompressCoins() {
  await MeshoptEncoder.ready;
  await MeshoptDecoder.ready;

  const io = new NodeIO()
    .registerExtensions(ALL_EXTENSIONS)
    .registerDependencies({
      "meshopt.encoder": MeshoptEncoder,
      "meshopt.decoder": MeshoptDecoder,
    });

  for (const coin of COINS) {
    console.log(`\nProcessing ${coin.src} for Mr. Dog (${coin.outfit})...`);
    const doc = await io.read(path.join(rootDir, coin.src));
    const root = doc.getRoot();

    // 1. Center the coin at [0, 0, 0] so it spins symmetrically around its center
    const mrDogCoin = root.listNodes().find((n) => n.getName() === "MrDog_Coin");
    if (mrDogCoin) {
      mrDogCoin.setTranslation([0, 0, 0]);
    }

    // 2. Scale by 25.0 so that 40mm coin body becomes 1.0 unit across
    const coinRoot = root.listNodes().find((n) => n.getName() === "MrDog_Coin_Root");
    if (coinRoot) {
      const s = coinRoot.getScale();
      coinRoot.setScale([s[0] * 25.0, s[1] * 25.0, s[2] * 25.0]);
    } else {
      root.listScenes()[0]?.listChildren().forEach((c) => {
        const s = c.getScale();
        c.setScale([s[0] * 25.0, s[1] * 25.0, s[2] * 25.0]);
      });
    }

    // 3. Deduplicate (avoid meshopt quantization which shifts node translations of small sub-mm parts)
    await doc.transform(dedup());

    const bin = await io.writeBinary(doc);
    console.log(`Optimized size: ${(bin.byteLength / 1024).toFixed(1)} KB`);

    // Write ONLY to Mr. Dog's model files (NEVER overwrite hero badges!)
    const pubPath = path.join(rootDir, "public/models", coin.targetName);
    const glbPath = path.join(rootDir, "GLBs", coin.targetName);
    fs.writeFileSync(pubPath, bin);
    fs.writeFileSync(glbPath, bin);
    console.log(`Saved to ${pubPath} and ${glbPath}`);
  }
}

async function renderMrDogStills() {
  console.log("\nRendering Mr. Dog 2D avatar & expression stills from Mr. Dog coin GLBs...");
  const browser = await chromium.launch({
    headless: true,
    args: ["--enable-webgl", "--use-gl=angle", "--use-angle=swiftshader"],
  });

  const page = await browser.newPage({
    viewport: { width: 512, height: 512, deviceScaleFactor: 1 },
  });

  for (const coin of COINS) {
    const glbPath = path.join(rootDir, "public/models", coin.targetName);
    const glbB64 = fs.readFileSync(glbPath).toString("base64");
    const glbDataUri = `data:model/gltf-binary;base64,${glbB64}`;
    const outDir = path.join(rootDir, "public/media/mr-dog", coin.outfit);
    fs.mkdirSync(outDir, { recursive: true });

    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body, html { margin: 0; padding: 0; overflow: hidden; background: transparent; width: 512px; height: 512px; }
    canvas { width: 512px; height: 512px; display: block; }
  </style>
</head>
<body>
  <div id="container"></div>
  <script type="module">
    import * as THREE from 'https://esm.sh/three@0.186.1';
    import { GLTFLoader } from 'https://esm.sh/three@0.186.1/examples/jsm/loaders/GLTFLoader.js';
    import { MeshoptDecoder } from 'https://esm.sh/three@0.186.1/examples/jsm/libs/meshopt_decoder.module.js';

    const width = 512;
    const height = 512;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 20);
    camera.position.set(0, 0, 2.22);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, preserveDrawingBuffer: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(1);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.NeutralToneMapping;
    renderer.toneMappingExposure = 1.05;
    document.getElementById('container').appendChild(renderer.domElement);

    const amb = new THREE.AmbientLight(0xffffff, 0.65);
    scene.add(amb);

    const dir1 = new THREE.DirectionalLight(0xffffff, 2.2);
    dir1.position.set(-3.0, 4.5, 4.0);
    scene.add(dir1);

    const dir2 = new THREE.DirectionalLight(0xfff5fa, 1.4);
    dir2.position.set(3.5, 2.5, 3.5);
    scene.add(dir2);

    const rim = new THREE.DirectionalLight(0xd9dce3, 1.5);
    rim.position.set(0, -3.5, 1.5);
    scene.add(rim);

    let model = null;
    let nodes = {};
    let baseRot = {};

    const loader = new GLTFLoader();
    loader.setMeshoptDecoder(MeshoptDecoder);
    loader.load('${glbDataUri}', (gltf) => {
      model = gltf.scene;
      model.traverse((o) => {
        if (o.name) {
          nodes[o.name] = o;
          baseRot[o.name] = o.rotation.clone();
        }
      });
      scene.add(model);
      renderer.render(scene, camera);
      window.__READY = true;
    }, undefined, (err) => {
      console.error(err);
      window.__ERROR = err.message;
    });

    window.setPose = (pose) => {
      if (!model) return;
      for (const name of Object.keys(nodes)) {
        const n = nodes[name];
        if (baseRot[name]) n.rotation.copy(baseRot[name]);
        if (name !== 'MrDog_Coin_Root') n.scale.set(1, 1, 1);
      }

      const head = nodes['Head'] || nodes['Face_MrDog'];
      const eyeL = nodes['Mask_Eye_L'] || nodes['Eye_L'];
      const eyeR = nodes['Mask_Eye_R'] || nodes['Eye_R'];
      const tongue = nodes['Tongue'];
      const xL0 = nodes['X_L_0'];
      const xL1 = nodes['X_L_1'];
      const xR0 = nodes['X_R_0'];
      const xR1 = nodes['X_R_1'];

      if (pose === 'avatar-blink') {
        if (eyeL) eyeL.scale.y = 0.22;
        if (eyeR) eyeR.scale.y = 0.22;
        if (xL0) xL0.scale.set(0.7, 0.2, 1);
        if (xL1) xL1.scale.set(0.7, 0.2, 1);
        if (xR0) xR0.scale.set(0.7, 0.2, 1);
        if (xR1) xR1.scale.set(0.7, 0.2, 1);
      } else if (pose === 'avatar-wink' || pose === 'wink') {
        if (eyeL) eyeL.scale.y = 0.22;
        if (xL0) xL0.scale.set(0.7, 0.2, 1);
        if (xL1) xL1.scale.set(0.7, 0.2, 1);
        if (head) head.rotation.z = 0.05;
      } else if (pose === 'listening') {
        if (head) head.rotation.z = 0.09;
      } else if (pose === 'thinking' || pose === 'shrug') {
        if (head) head.rotation.z = -0.08;
      } else if (pose === 'rage' || pose === 'avatar-x') {
        if (tongue) tongue.rotation.z = 0.14;
      } else if (pose === 'talk-open' || pose === 'talking') {
        if (tongue) tongue.scale.y = 1.12;
      }
      renderer.render(scene, camera);
    };
  </script>
</body>
</html>
    `;

    await page.setContent(html);
    await page.waitForFunction(() => window.__READY === true || window.__ERROR !== undefined, {
      timeout: 15000,
    });

    const error = await page.evaluate(() => window.__ERROR);
    if (error) throw new Error("Render error for " + coin.outfit + ": " + error);

    for (const still of STILLS) {
      await page.evaluate((p) => window.setPose(p), still);
      await page.waitForTimeout(40);
      const buf = await page.screenshot({ omitBackground: true });
      const outPath = path.join(outDir, `${still}.webp`);
      await sharp(buf)
        .webp({ quality: 92, alphaQuality: 100 })
        .toFile(outPath);
    }
    console.log(`Saved all ${STILLS.length} stills for Mr. Dog (${coin.outfit}) in ${outDir}`);
  }

  await browser.close();
}

async function main() {
  await prepareAndCompressCoins();
  await renderMrDogStills();
}

main().catch(console.error);
