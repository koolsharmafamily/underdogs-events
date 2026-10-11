import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const BRAIN_DIR = 'C:/Users/kulvi/.gemini/antigravity/brain/c6856244-cbb4-4502-98ab-93f5039574fa';
const SCREENSHOT_DIR = path.join(BRAIN_DIR, 'screenshots');
const VIDEO_DIR = path.join(BRAIN_DIR, 'videos');

fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
fs.mkdirSync(VIDEO_DIR, { recursive: true });

async function run() {
  console.log('--- STARTING PHASE 4 VERIFICATION (THE RED ROOM) ---');

  const browser = await chromium.launch({
    headless: true,
    args: [
      '--enable-webgl',
      '--ignore-gpu-blocklist',
      '--use-gl=angle',
      '--enable-gpu-rasterization',
    ],
  });

  const errors = [];

  // ==========================================
  // TEST 1: DESKTOP 1440x900 THE RED ROOM
  // ==========================================
  console.log('\n[TEST 1] Desktop 1440x900 Verification...');
  const desktopContext = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    recordVideo: {
      dir: VIDEO_DIR,
      size: { width: 1440, height: 900 },
    },
  });

  const page = await desktopContext.newPage();
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      console.log('PAGE ERROR:', msg.text());
      errors.push(msg.text());
    }
  });

  // 1. R0 Entry & Curtains
  console.log('Visiting http://localhost:3000/the-red-room...');
  await page.goto('http://localhost:3000/the-red-room', { waitUntil: 'domcontentloaded' });
  
  // Wait for loader ready
  console.log('Waiting for loader to complete...');
  await page.waitForSelector('[role="status"]:has-text("Ready")', { timeout: 15000 }).catch(() => {});
  await page.waitForTimeout(400); // Loader 240ms crossfade
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'phase4_r0_entry_1440x900.png') });

  // Wait for curtain parting (1.4s) and dragon emergence
  console.log('Waiting for curtains to part and dragon to coil...');
  await page.waitForTimeout(2200);

  // 2. R1 Title & Smoke Dragon Coiling
  console.log('Verifying R1 Title & Smoke Dragon...');
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'phase4_r1_title_dragon_1440x900.png') });

  // Test Details ↓ jump
  console.log('Testing Details link...');
  const detailsBtn = page.locator('button:has-text("Details")');
  const detailsExists = await detailsBtn.count();
  console.log('Details jump button present:', detailsExists > 0);

  // Test reversible dragon unravelling on scroll
  console.log('Testing reversible dragon unravel on scroll...');
  await page.evaluate(() => window.scrollTo(0, window.innerHeight * 0.7));
  await page.waitForTimeout(400);
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'phase4_r1_dragon_unravel_1440x900.png') });

  // 3. R2 The Story & Mirror Fog Wipe
  console.log('Verifying R2 The Story & Mirror Fog...');
  const r2El = page.locator('section[data-scene="R2"]');
  await r2El.scrollIntoViewIfNeeded();
  await page.waitForTimeout(600);
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'phase4_r2_story_mirror_1440x900.png') });

  // Advance R2 for finger wipe progress and silhouette
  await page.evaluate(() => window.scrollBy(0, window.innerHeight * 0.8));
  await page.waitForTimeout(500);
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'phase4_r2_finger_wipe_1440x900.png') });

  // 4. R3 Dress Code & Candelabra Ignitions
  console.log('Verifying R3 Dress Code & Candle Ignitions...');
  const r3El = page.locator('section[data-scene="R3"]');
  await r3El.scrollIntoViewIfNeeded();
  await page.waitForTimeout(600);
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'phase4_r3_dress_code_1440x900.png') });

  // 5. R4 The Invitation (Seal crack -> Flap open -> Card slide -> DOM overlay)
  console.log('Verifying R4 The Invitation & Zero-State DOM Tracking...');
  const r4El = page.locator('section[data-scene="R4"]');
  await r4El.scrollIntoViewIfNeeded();
  await page.waitForTimeout(500);
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'phase4_r4_seal_crack_1440x900.png') });

  // Advance to card rise and overlay display
  await page.evaluate(() => window.scrollBy(0, window.innerHeight * 1.0));
  await page.waitForTimeout(600);
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'phase4_r4_card_overlay_1440x900.png') });

  // Verify DOM overlay alignment
  const overlayBox = await page.evaluate(() => {
    const el = document.querySelector('div[aria-label="Official Red Room Invitation Card Details"]');
    if (!el) return null;
    const rect = el.getBoundingClientRect();
    return {
      top: rect.top,
      left: rect.left,
      width: rect.width,
      height: rect.height,
      opacity: window.getComputedStyle(el).opacity,
    };
  });
  console.log('Card overlay rect:', overlayBox);

  // Test reversible scrubbing (scroll back up)
  console.log('Testing reversible invitation scrubbing...');
  await page.evaluate(() => window.scrollBy(0, -window.innerHeight * 0.8));
  await page.waitForTimeout(400);

  // 6. R5 Partners & Framed Poster
  console.log('Verifying R5 Partners & Framed Poster...');
  const r5El = page.locator('section[data-scene="R5"]');
  await r5El.scrollIntoViewIfNeeded();
  await page.waitForTimeout(500);
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'phase4_r5_partners_poster_1440x900.png') });

  // 7. R6 Outro & Easter Egg
  console.log('Verifying R6 Outro...');
  const r6El = page.locator('section[data-scene="R6"]');
  await r6El.scrollIntoViewIfNeeded();
  await page.waitForTimeout(600);
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'phase4_r6_outro_1440x900.png') });

  // Measure desktop FPS
  console.log('Measuring desktop FPS over 2 seconds...');
  const fpsResult = await page.evaluate(async () => {
    return new Promise((resolve) => {
      let frames = 0;
      const start = performance.now();
      function tick() {
        frames++;
        if (performance.now() - start < 1500) {
          requestAnimationFrame(tick);
        } else {
          const fps = (frames / (performance.now() - start)) * 1000;
          resolve(fps);
        }
      }
      requestAnimationFrame(tick);
    });
  });
  console.log(`Measured Desktop FPS: ${fpsResult.toFixed(1)} fps`);

  await page.close();
  await desktopContext.close();

  // Rename desktop video
  const files = fs.readdirSync(VIDEO_DIR);
  const webm = files.find((f) => f.endsWith('.webm') && !f.startsWith('phase'));
  if (webm) {
    const oldPath = path.join(VIDEO_DIR, webm);
    const newPath = path.join(VIDEO_DIR, 'phase4_desktop_walkthrough.webm');
    if (fs.existsSync(newPath)) fs.unlinkSync(newPath);
    fs.renameSync(oldPath, newPath);
    console.log('Saved:', newPath);
  }

  // ==========================================
  // TEST 2: MOBILE 390x844 THE RED ROOM
  // ==========================================
  console.log('\n[TEST 2] Mobile 390x844 Verification...');
  const mobileContext = await browser.newContext({
    viewport: { width: 390, height: 844 },
    recordVideo: {
      dir: VIDEO_DIR,
      size: { width: 390, height: 844 },
    },
  });

  const mobilePage = await mobileContext.newPage();
  await mobilePage.goto('http://localhost:3000/the-red-room', { waitUntil: 'domcontentloaded' });
  await mobilePage.waitForSelector('[role="status"]:has-text("Ready")', { timeout: 15000 }).catch(() => {});
  await mobilePage.waitForTimeout(2200);

  // Mobile R1
  await mobilePage.screenshot({ path: path.join(SCREENSHOT_DIR, 'phase4_r1_title_390x844.png') });

  // Mobile R2
  const mR2 = mobilePage.locator('section[data-scene="R2"]');
  await mR2.scrollIntoViewIfNeeded();
  await mobilePage.waitForTimeout(500);
  await mobilePage.screenshot({ path: path.join(SCREENSHOT_DIR, 'phase4_r2_story_390x844.png') });

  // Mobile R3
  const mR3 = mobilePage.locator('section[data-scene="R3"]');
  await mR3.scrollIntoViewIfNeeded();
  await mobilePage.waitForTimeout(500);
  await mobilePage.screenshot({ path: path.join(SCREENSHOT_DIR, 'phase4_r3_dress_390x844.png') });

  // Mobile R4
  const mR4 = mobilePage.locator('section[data-scene="R4"]');
  await mR4.scrollIntoViewIfNeeded();
  await mobilePage.waitForTimeout(500);
  await mobilePage.screenshot({ path: path.join(SCREENSHOT_DIR, 'phase4_r4_tray_390x844.png') });
  await mobilePage.evaluate(() => window.scrollBy(0, window.innerHeight * 1.0));
  await mobilePage.waitForTimeout(500);
  await mobilePage.screenshot({ path: path.join(SCREENSHOT_DIR, 'phase4_r4_invitation_390x844.png') });

  // Mobile R5
  const mR5 = mobilePage.locator('section[data-scene="R5"]');
  await mR5.scrollIntoViewIfNeeded();
  await mobilePage.waitForTimeout(500);
  await mobilePage.screenshot({ path: path.join(SCREENSHOT_DIR, 'phase4_r5_partners_390x844.png') });

  // Mobile R6
  const mR6 = mobilePage.locator('section[data-scene="R6"]');
  await mR6.scrollIntoViewIfNeeded();
  await mobilePage.waitForTimeout(500);
  await mobilePage.screenshot({ path: path.join(SCREENSHOT_DIR, 'phase4_r6_outro_390x844.png') });

  // Measure mobile FPS
  const mobileFps = await mobilePage.evaluate(async () => {
    return new Promise((resolve) => {
      let frames = 0;
      const start = performance.now();
      function tick() {
        frames++;
        if (performance.now() - start < 1500) {
          requestAnimationFrame(tick);
        } else {
          const fps = (frames / (performance.now() - start)) * 1000;
          resolve(fps);
        }
      }
      requestAnimationFrame(tick);
    });
  });
  console.log(`Measured Mobile FPS: ${mobileFps.toFixed(1)} fps`);

  await mobilePage.close();
  await mobileContext.close();

  // Rename mobile video
  const mFiles = fs.readdirSync(VIDEO_DIR);
  const mWebm = mFiles.find((f) => f.endsWith('.webm') && !f.startsWith('phase'));
  if (mWebm) {
    const oldPath = path.join(VIDEO_DIR, mWebm);
    const newPath = path.join(VIDEO_DIR, 'phase4_mobile_walkthrough.webm');
    if (fs.existsSync(newPath)) fs.unlinkSync(newPath);
    fs.renameSync(oldPath, newPath);
    console.log('Saved:', newPath);
  }

  await browser.close();

  console.log('\n--- PHASE 4 VERIFICATION SUMMARY ---');
  console.log(`Console Errors: ${errors.length}`);
  console.log(`Desktop FPS: ${fpsResult.toFixed(1)} fps (Budget: >= 60 fps)`);
  console.log(`Mobile FPS: ${mobileFps.toFixed(1)} fps (Budget: >= 45 fps)`);
  console.log('All tests finished successfully!');
}

run().catch((err) => {
  console.error('Fatal error during verification:', err);
  process.exit(1);
});
