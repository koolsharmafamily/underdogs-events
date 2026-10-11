import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const rootDir = process.cwd();
const brandDir = path.join(rootDir, 'brand-source');
const mediaDir = path.join(rootDir, 'public/media');

if (!fs.existsSync(mediaDir)) {
  fs.mkdirSync(mediaDir, { recursive: true });
}

const ARTIFACT_HOME_CAPTURE =
  'C:/Users/kulvi/.gemini/antigravity/brain/c6856244-cbb4-4502-98ab-93f5039574fa/screenshots/phase3_h1_hero_1440x900.png';

async function buildPosters() {
  console.log('Generating WebP posters and 1200x630 Open Graph images (Part 13.5, 13.7 & 13.8)...');

  const halloweenSrc = path.join(brandDir, 'Halloween Post.png');
  const diwaliSrc = path.join(brandDir, 'Diwali Post.png');

  // 1. Official WebP posters (Part 13.5)
  if (fs.existsSync(halloweenSrc)) {
    const outRedWebp = path.join(mediaDir, 'red-room-poster.webp');
    await sharp(halloweenSrc).webp({ quality: 88 }).toFile(outRedWebp);
    console.log(`✓ Created ${path.relative(rootDir, outRedWebp)}`);

    // 1200x630 Open Graph crop of Halloween Post.png (Part 13.7)
    const outOgRed = path.join(mediaDir, 'og-red-room.png');
    await sharp(halloweenSrc)
      .resize(1200, 630, { fit: 'cover', position: 'attention' })
      .png({ compressionLevel: 9 })
      .toFile(outOgRed);
    console.log(`✓ Created ${path.relative(rootDir, outOgRed)} (1200x630)`);
  }

  if (fs.existsSync(diwaliSrc)) {
    const outDiwaliWebp = path.join(mediaDir, 'diwali-teaser.webp');
    await sharp(diwaliSrc).webp({ quality: 88 }).toFile(outDiwaliWebp);
    console.log(`✓ Created ${path.relative(rootDir, outDiwaliWebp)}`);

    // 1200x630 Open Graph crop of Diwali Post.png (Part 13.7)
    const outOgDiwali = path.join(mediaDir, 'og-diwali.png');
    await sharp(diwaliSrc)
      .resize(1200, 630, { fit: 'cover', position: 'attention' })
      .png({ compressionLevel: 9 })
      .toFile(outOgDiwali);
    console.log(`✓ Created ${path.relative(rootDir, outOgDiwali)} (1200x630)`);
  }

  // 2. Home enamel badge capture from build (Part 13.7 & 13.8) — clean crop of the 3D enamel badge & stage
  const homePosterWebp = path.join(mediaDir, 'home-poster.webp');
  const ogHomePng = path.join(mediaDir, 'og-home.png');

  if (fs.existsSync(ARTIFACT_HOME_CAPTURE)) {
    const badgeCropBuffer = await sharp(ARTIFACT_HOME_CAPTURE)
      .extract({ left: 710, top: 180, width: 420, height: 420 })
      .toBuffer();

    await sharp({
      create: {
        width: 1440,
        height: 900,
        channels: 4,
        background: { r: 7, g: 9, b: 13, alpha: 1 },
      },
    })
      .composite([{ input: badgeCropBuffer, left: 760, top: 240 }])
      .webp({ quality: 90 })
      .toFile(homePosterWebp);
    console.log(`✓ Created ${path.relative(rootDir, homePosterWebp)} from 3D enamel badge build capture`);

    await sharp({
      create: {
        width: 1200,
        height: 630,
        channels: 4,
        background: { r: 7, g: 9, b: 13, alpha: 1 },
      },
    })
      .composite([{ input: badgeCropBuffer, gravity: 'center' }])
      .png({ compressionLevel: 9 })
      .toFile(ogHomePng);
    console.log(`✓ Created ${path.relative(rootDir, ogHomePng)} (1200x630) from 3D enamel badge build capture`);
  }

  console.log('All posters and Open Graph assets generated successfully!');
}

buildPosters().catch((err) => {
  console.error('Error generating posters:', err);
  process.exit(1);
});
