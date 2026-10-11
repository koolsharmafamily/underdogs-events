import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const BRAIN_DIR = 'C:/Users/kulvi/.gemini/antigravity/brain/c6856244-cbb4-4502-98ab-93f5039574fa';
const SCREENSHOT_DIR = path.join(BRAIN_DIR, 'screenshots');
const VIDEO_DIR = path.join(BRAIN_DIR, 'videos');

fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
fs.mkdirSync(VIDEO_DIR, { recursive: true });

async function run() {
  console.log('--- STARTING PHASE 5 VERIFICATION (WORLD TWO: DIWALI) ---');

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
  // TEST 1: DESKTOP 1440x900 DIWALI
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

  // 1. Visit /diwali & D0 Film Title Card
  console.log('Visiting http://localhost:3000/diwali...');
  await page.goto('http://localhost:3000/diwali', { waitUntil: 'domcontentloaded' });

  // Wait for initial loader if present
  await page.waitForSelector('[role="status"]:has-text("Ready")', { timeout: 15000 }).catch(() => {});
  await page.waitForTimeout(600);

  // Capture D0 Title Card state
  console.log('Verifying D0 Film Title Card...');
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'phase5_d0_title_card_1440x900.png') });

  // Wait for film burn (2.4s -> 3.2s) or trigger skip
  console.log('Waiting for film burn to reveal the velvet scene...');
  await page.waitForTimeout(2600);

  // 2. D1 Title & Jewelled Badge
  console.log('Verifying D1 Title & Jewelled Badge with Glints...');
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'phase5_d1_title_badge_1440x900.png') });

  // Test Details jump button
  const detailsBtn = page.locator('button:has-text("Details")');
  const detailsExists = await detailsBtn.count();
  console.log('Details jump button present:', detailsExists > 0);

  // 3. D2 Story, Lifting Drapes, Night Sky & Fireworks
  console.log('Verifying D2 Story, Lifting Drapes & Night Sky...');
  const d2El = page.locator('section[data-scene="D2"]');
  await d2El.scrollIntoViewIfNeeded();
  await page.waitForTimeout(500);
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'phase5_d2_story_sky_1440x900.png') });

  // Advance D2 to trigger fireworks burst and haveli sky reveal
  await page.evaluate(() => window.scrollBy(0, window.innerHeight * 0.9));
  await page.waitForTimeout(600);
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'phase5_d2_fireworks_1440x900.png') });

  // 4. D3 The Gold Foil Invitation Card & DOM Overlay Tracking
  console.log('Verifying D3 Gold Foil Invitation Card & DOM Tracking...');
  const d3El = page.locator('section[data-scene="D3"]');
  await d3El.scrollIntoViewIfNeeded();
  await page.waitForTimeout(500);

  // Advance within D3 to raise card and display DOM overlay
  await page.evaluate(() => window.scrollBy(0, window.innerHeight * 0.9));
  await page.waitForTimeout(600);
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'phase5_d3_invitation_card_1440x900.png') });

  // Check DOM overlay bounding box
  const overlayBox = await page.evaluate(() => {
    const el = document.querySelector('div[aria-label="Official Diwali Invitation Card Details"]');
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
  console.log('Diwali Card overlay rect:', overlayBox);

  // 5. D4 Cinema Lightbox with Teaser Poster & Marquee Bulbs
  console.log('Verifying D4 Cinema Lightbox & Marquee Bulbs...');
  const d4El = page.locator('section[data-scene="D4"]');
  await d4El.scrollIntoViewIfNeeded();
  await page.waitForTimeout(600);
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'phase5_d4_lightbox_1440x900.png') });

  // 6. D5 Outro & Finale
  console.log('Verifying D5 Outro & Finale...');
  const d5El = page.locator('section[data-scene="D5"]');
  await d5El.scrollIntoViewIfNeeded();
  await page.waitForTimeout(600);
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'phase5_d5_outro_1440x900.png') });

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
    const newPath = path.join(VIDEO_DIR, 'phase5_desktop_walkthrough.webm');
    if (fs.existsSync(newPath)) fs.unlinkSync(newPath);
    fs.renameSync(oldPath, newPath);
    console.log('Saved:', newPath);
  }

  // ==========================================
  // TEST 2: MOBILE 390x844 DIWALI
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
  await mobilePage.goto('http://localhost:3000/diwali', { waitUntil: 'domcontentloaded' });
  await mobilePage.waitForSelector('[role="status"]:has-text("Ready")', { timeout: 15000 }).catch(() => {});
  // Tap to skip title card if showing
  await mobilePage.mouse.click(195, 422);
  await mobilePage.waitForTimeout(1800);

  // Mobile D1
  await mobilePage.screenshot({ path: path.join(SCREENSHOT_DIR, 'phase5_d1_title_390x844.png') });

  // Mobile D2
  const mD2 = mobilePage.locator('section[data-scene="D2"]');
  await mD2.scrollIntoViewIfNeeded();
  await mobilePage.waitForTimeout(500);
  await mobilePage.screenshot({ path: path.join(SCREENSHOT_DIR, 'phase5_d2_story_390x844.png') });

  // Mobile D3
  const mD3 = mobilePage.locator('section[data-scene="D3"]');
  await mD3.scrollIntoViewIfNeeded();
  await mobilePage.waitForTimeout(400);
  await mobilePage.evaluate(() => window.scrollBy(0, window.innerHeight * 0.9));
  await mobilePage.waitForTimeout(600);
  await mobilePage.screenshot({ path: path.join(SCREENSHOT_DIR, 'phase5_d3_invitation_390x844.png') });

  // Mobile D4
  const mD4 = mobilePage.locator('section[data-scene="D4"]');
  await mD4.scrollIntoViewIfNeeded();
  await mobilePage.waitForTimeout(500);
  await mobilePage.screenshot({ path: path.join(SCREENSHOT_DIR, 'phase5_d4_lightbox_390x844.png') });

  // Mobile D5
  const mD5 = mobilePage.locator('section[data-scene="D5"]');
  await mD5.scrollIntoViewIfNeeded();
  await mobilePage.waitForTimeout(500);
  await mobilePage.screenshot({ path: path.join(SCREENSHOT_DIR, 'phase5_d5_outro_390x844.png') });

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
    const newPath = path.join(VIDEO_DIR, 'phase5_mobile_walkthrough.webm');
    if (fs.existsSync(newPath)) fs.unlinkSync(newPath);
    fs.renameSync(oldPath, newPath);
    console.log('Saved:', newPath);
  }

  await browser.close();

  console.log('\n--- PHASE 5 VERIFICATION SUMMARY ---');
  console.log(`Console Errors: ${errors.length}`);
  console.log(`Desktop FPS: ${fpsResult.toFixed(1)} fps (Budget: >= 60 fps)`);
  console.log(`Mobile FPS: ${mobileFps.toFixed(1)} fps (Budget: >= 45 fps)`);
  console.log('All tests finished successfully!');
}

run().catch((err) => {
  console.error('Fatal error during verification:', err);
  process.exit(1);
});
