import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const sourceImgPath = 'C:/Users/kulvi/.gemini/antigravity/brain/c6856244-cbb4-4502-98ab-93f5039574fa/party_coin_front.png';
const outDir = path.resolve(process.cwd(), 'public/media/mr-dog');

async function createCoinAssets() {
  const source = sharp(sourceImgPath);
  const { data, info } = await source.raw().toBuffer({ resolveWithObject: true });

  // Find exact tight bounds
  let minX = info.width, maxX = 0, minY = info.height, maxY = 0;
  for (let y = 0; y < info.height; y++) {
    for (let x = 0; x < info.width; x++) {
      const alpha = data[(y * info.width + x) * info.channels + 3];
      if (alpha > 8) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }

  console.log(`Exact tight bounds: minX=${minX}, maxX=${maxX}, minY=${minY}, maxY=${maxY}`);
  const pad = 6;
  const cropLeft = Math.max(0, minX - pad);
  const cropTop = Math.max(0, minY - pad);
  const cropWidth = Math.min(info.width - cropLeft, (maxX - minX + 1) + pad * 2);
  const cropHeight = Math.min(info.height - cropTop, (maxY - minY + 1) + pad * 2);

  // 1. Full Party Coin with uncropped party hat & pompom & ears
  const fullPartyCoin = await sharp(sourceImgPath)
    .extract({
      left: cropLeft,
      top: cropTop,
      width: cropWidth,
      height: cropHeight,
    })
    .resize({ width: 512 })
    .webp({ quality: 95, effort: 6 })
    .toBuffer();

  fs.writeFileSync(path.join(outDir, 'party-coin.webp'), fullPartyCoin);
  await sharp(fullPartyCoin).png().toFile(path.join(outDir, 'party-coin.png'));
  console.log('Saved party-coin.webp & party-coin.png (512px wide, uncropped hat)');

  // 2. High-res version for the tab bar: 160px wide (crystal clear on 3x retina displays)
  const tabPartyCoin = await sharp(sourceImgPath)
    .extract({
      left: cropLeft,
      top: cropTop,
      width: cropWidth,
      height: cropHeight,
    })
    .resize({ width: 160 })
    .webp({ quality: 95, effort: 6 })
    .toBuffer();

  fs.writeFileSync(path.join(outDir, 'party-coin-tab.webp'), tabPartyCoin);
  console.log('Saved party-coin-tab.webp (160px wide)');

  // 3. Circular coin disc: centered on the round coin body, including the entire circular rim
  // The coin center is at X=511, Y=542, radius ~320.
  // Diameter = 640. With 8px margin, 656x656 square:
  const discLeft = Math.round(511 - 328);
  const discTop = Math.round(542 - 328);
  const coinDisc = await sharp(sourceImgPath)
    .extract({
      left: discLeft,
      top: discTop,
      width: 656,
      height: 656,
    })
    .resize(256, 256)
    .webp({ quality: 95, effort: 6 })
    .toBuffer();

  fs.writeFileSync(path.join(outDir, 'party-coin-disc.webp'), coinDisc);
  console.log('Saved party-coin-disc.webp (256x256 round coin)');

  // Copy to brain for inspection
  fs.writeFileSync('C:/Users/kulvi/.gemini/antigravity/brain/c6856244-cbb4-4502-98ab-93f5039574fa/party_coin_tight.png', fullPartyCoin);
  fs.writeFileSync('C:/Users/kulvi/.gemini/antigravity/brain/c6856244-cbb4-4502-98ab-93f5039574fa/party_coin_disc.png', coinDisc);
}

createCoinAssets().catch(console.error);
