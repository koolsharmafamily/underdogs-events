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
    targetNames: ["badge-enamel.glb", "mr-dog-coin-OG.glb"],
    stillName: "badge-enamel-still",
    has512: true,
  },
  {
    src: "Mr. Dog/mr-dog-coin-red-room.glb",
    targetNames: ["badge-halloween.glb", "mr-dog-coin-red-room.glb"],
    stillName: "badge-halloween-still",
    has512: false,
  },
  {
    src: "Mr. Dog/mr-dog-coin-diwali.glb",
    targetNames: ["badge-jewelled.glb", "mr-dog-coin-diwali.glb"],
    stillName: "badge-jewelled-still",
    has512: false,
  },
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
    console.log(`\nProcessing ${coin.src}...`);
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
      // Scale all top-level scene nodes if no MrDog_Coin_Root
      root.listScenes()[0]?.listChildren().forEach((c) => {
        const s = c.getScale();
        c.setScale([s[0] * 25.0, s[1] * 25.0, s[2] * 25.0]);
      });
    }

    // 2. Add Eye_L and Eye_R aliases if missing
    const maskEyeL = root.listNodes().find((n) => n.getName() === "Mask_Eye_L");
    const maskEyeR = root.listNodes().find((n) => n.getName() === "Mask_Eye_R");
    if (maskEyeL && !root.listNodes().find((n) => n.getName() === "Eye_L")) {
      maskEyeL.setName("Eye_L");
    }
    if (maskEyeR && !root.listNodes().find((n) => n.getName() === "Eye_R")) {
      maskEyeR.setName("Eye_R");
    }

    // 3. Deduplicate & optimize with meshopt
    await doc.transform(
      dedup(),
      meshopt({ encoder: MeshoptEncoder, level: "medium" })
    );

    const bin = await io.writeBinary(doc);
    console.log(`Compressed size: ${(bin.byteLength / 1024).toFixed(1)} KB`);

    // Write to public/models/ and GLBs/
    for (const target of coin.targetNames) {
      const pubPath = path.join(rootDir, "public/models", target);
      const glbPath = path.join(rootDir, "GLBs", target);
      fs.writeFileSync(pubPath, bin);
      fs.writeFileSync(glbPath, bin);
      console.log(`Saved to ${pubPath} and ${glbPath}`);
    }
  }
}

async function renderStills() {
  console.log("\nRendering transparent WebP stills from new coins...");
  const browser = await chromium.launch({
    headless: true,
    args: ["--enable-webgl", "--use-gl=angle", "--use-angle=swiftshader"],
  });

  const page = await browser.newPage({
    viewport: { width: 1024, height: 1024, deviceScaleFactor: 1 },
  });

  for (const coin of COINS) {
    const glbPath = path.join(rootDir, "public/models", coin.targetNames[0]);
    const glbB64 = fs.readFileSync(glbPath).toString("base64");
    const glbDataUri = `data:model/gltf-binary;base64,${glbB64}`;

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
    renderer.toneMapping = THREE.NeutralToneMapping;
    renderer.toneMappingExposure = 1.0;
    document.getElementById('container').appendChild(renderer.domElement);

    const amb = new THREE.AmbientLight(0xffffff, 0.6);
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

    const loader = new GLTFLoader();
    loader.setMeshoptDecoder(MeshoptDecoder);
    loader.load('${glbDataUri}', (gltf) => {
      const model = gltf.scene;
      model.position.set(0, 0, 0);
      model.rotation.set(0, 0, 0);
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
    await page.waitForFunction(() => window.__READY === true || window.__ERROR !== undefined, {
      timeout: 15000,
    });

    const error = await page.evaluate(() => window.__ERROR);
    if (error) throw new Error("Render error for " + coin.stillName + ": " + error);

    await page.waitForTimeout(400);

    const pngPath = path.join(rootDir, "public/media", `${coin.stillName}.png`);
    await page.screenshot({ path: pngPath, omitBackground: true });

    const webp1024 = path.join(rootDir, "public/media", `${coin.stillName}.webp`);
    await sharp(pngPath)
      .webp({ quality: 92, alphaQuality: 100, lossless: false })
      .toFile(webp1024);
    console.log(`Saved 1024px WebP: ${webp1024}`);

    if (coin.has512) {
      const webp512 = path.join(rootDir, "public/media", `${coin.stillName}-512.webp`);
      await sharp(pngPath)
        .resize(512, 512)
        .webp({ quality: 90, alphaQuality: 100, lossless: false })
        .toFile(webp512);
      console.log(`Saved 512px WebP: ${webp512}`);
    }
  }

  await browser.close();
  console.log("\nAll stills rendered successfully!");
}

async function main() {
  await prepareAndCompressCoins();
  await renderStills();
}

main().catch(console.error);
