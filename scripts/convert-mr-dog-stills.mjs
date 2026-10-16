import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const sourceDir = path.resolve(process.cwd(), 'Mr. Dog');
const targetBase = path.resolve(process.cwd(), 'public/media/mr-dog');

fs.mkdirSync(targetBase, { recursive: true });

const outfits = ['home', 'redroom', 'diwali'];
for (const o of outfits) {
  fs.mkdirSync(path.join(targetBase, o), { recursive: true });
}

// Map filenames to canonical names
const STILL_MAP = {
  'Greet': 'greet',
  'Idle': 'idle',
  'Listening': 'listening',
  'Rage': 'rage',
  'Shrug': 'shrug',
  'Sorry': 'sorry',
  'Talking': 'talking',
  'Thinking': 'thinking',
  'Wink': 'wink',
  'talk-closed': 'talk-closed',
  'talk-open': 'talk-open',
  'talk-round': 'talk-round',
  'talk-small': 'talk-small',
};

const AVATAR_MAP = {
  'avatar-normal': 'avatar',
  'avatar-blink': 'avatar-blink',
  'avatar-wink': 'avatar-wink',
  'avatar-x-eyes': 'avatar-x',
};

async function convertStills() {
  console.log('--- CONVERTING STILLS & AVATARS TO WEBP ---');

  // 1. Convert Avatars
  const avatarDir = path.join(sourceDir, 'mr-dog-stills/avatars');
  if (fs.existsSync(avatarDir)) {
    for (const file of fs.readdirSync(avatarDir)) {
      if (!file.endsWith('.png')) continue;
      // Format: mr-dog_{Outfit}_avatar-{type}_256.png
      const match = file.match(/mr-dog_([A-Za-z]+)_(avatar-[a-z-]+)_256\.png/);
      if (match) {
        const outfit = match[1].toLowerCase();
        const rawType = match[2];
        const canonical = AVATAR_MAP[rawType] || rawType;
        const srcPath = path.join(avatarDir, file);
        const destPath = path.join(targetBase, outfit, `${canonical}.webp`);

        await sharp(srcPath)
          .webp({ quality: 85, effort: 6 })
          .toFile(destPath);

        const sz = (fs.statSync(destPath).size / 1024).toFixed(1);
        console.log(`[AVATAR] ${outfit}/${canonical}.webp: ${sz} KB (budget <= 12 KB)`);
      }
    }
  }

  // 2. Convert Expression Stills
  const outfitFolders = [
    { folder: 'Home', outfit: 'home' },
    { folder: 'RedRoom', outfit: 'redroom' },
    { folder: 'Diwali', outfit: 'diwali' },
  ];

  for (const { folder, outfit } of outfitFolders) {
    const dir = path.join(sourceDir, 'mr-dog-stills', folder);
    if (!fs.existsSync(dir)) continue;

    for (const file of fs.readdirSync(dir)) {
      if (!file.endsWith('.png')) continue;
      // Format: mr-dog_{Outfit}_{Expression}_512.png
      const match = file.match(/mr-dog_[A-Za-z]+_([A-Za-z-]+)_512\.png/);
      if (match) {
        const rawName = match[1];
        const canonical = STILL_MAP[rawName] || rawName.toLowerCase();
        const srcPath = path.join(dir, file);
        const destPath = path.join(targetBase, outfit, `${canonical}.webp`);

        await sharp(srcPath)
          .webp({ quality: 85, effort: 6 })
          .toFile(destPath);

        const sz = (fs.statSync(destPath).size / 1024).toFixed(1);
        console.log(`[STILL] ${outfit}/${canonical}.webp: ${sz} KB (budget <= 35 KB)`);
      }
    }
  }

  // 3. Convert Sprites
  const spriteDir = path.join(sourceDir, 'mr-dog-sprites');
  if (fs.existsSync(spriteDir)) {
    for (const file of fs.readdirSync(spriteDir)) {
      if (!file.endsWith('.png')) continue;
      // Format: mr-dog_{Outfit}_talk-blink_strip.png
      const match = file.match(/mr-dog_([A-Za-z]+)_talk-blink_strip\.png/);
      if (match) {
        const outfit = match[1].toLowerCase();
        const srcPath = path.join(spriteDir, file);
        const destPath = path.join(targetBase, outfit, 'talk-blink-strip.webp');

        await sharp(srcPath)
          .webp({ quality: 85, effort: 6 })
          .toFile(destPath);

        const sz = (fs.statSync(destPath).size / 1024).toFixed(1);
        console.log(`[SPRITE] ${outfit}/talk-blink-strip.webp: ${sz} KB`);
      }
    }
  }

  console.log('Stills conversion complete!');
}

convertStills().catch(console.error);
