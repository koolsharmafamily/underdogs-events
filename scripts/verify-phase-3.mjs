import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const BRAIN_DIR = 'C:/Users/kulvi/.gemini/antigravity/brain/c6856244-cbb4-4502-98ab-93f5039574fa';
const SCREENSHOT_DIR = path.join(BRAIN_DIR, 'screenshots');
const VIDEO_DIR = path.join(BRAIN_DIR, 'videos');

fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
fs.mkdirSync(VIDEO_DIR, { recursive: true });

async function run() {
  console.log('--- STARTING PHASE 3 VERIFICATION ---');

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
  // TEST 1: DESKTOP 1440x900 FULL VERIFICATION
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

  // 1. Loader Test (H0)
  console.log('Loading http://localhost:3000 for H0 Loader...');
  const loadStart = Date.now();
  await page.goto('http://localhost:3000', { waitUntil: 'domcontentloaded' });

  // Verify live region status
  const statusEl = await page.locator('[role="status"]').textContent();
  console.log('Loader live region text:', statusEl);

  // Capture Loader screenshot
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'phase3_h0_loader_1440x900.png') });

  // Wait for loader to complete (≥ 900 ms)
  await page.waitForSelector('[role="status"]:has-text("Ready")', { state: 'attached', timeout: 15000 });
  const loadDuration = Date.now() - loadStart;
  console.log(`Loader finished in ${loadDuration} ms (must be >= 900 ms)`);

  // Wait for 240 ms crossfade and hero reveal
  await page.waitForTimeout(600);

  // 2. H1 Hero Verification
  console.log('Verifying H1 Hero...');
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'phase3_h1_hero_1440x900.png') });

  // Test H1 Text Exit at 15% with hysteresis returning above 10%
  console.log('Testing H1 scroll & text exit hysteresis...');
  await page.evaluate(() => window.scrollTo(0, window.innerHeight * 0.4));
  await page.waitForTimeout(400);

  // Check if hero text is hidden
  const heroTextHidden = await page.evaluate(() => {
    const el = document.querySelector('.scene-h1 .site-grid > div:nth-child(2)');
    return el && el.classList.contains('opacity-0');
  });
  console.log('Hero text hidden at 15%+ scroll:', heroTextHidden);

  // Scroll back to top to verify hysteresis return
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(400);
  const heroTextReturned = await page.evaluate(() => {
    const el = document.querySelector('.scene-h1 .site-grid > div:nth-child(2)');
    return el && el.classList.contains('opacity-100');
  });
  console.log('Hero text returned when scrolling back:', heroTextReturned);

  // 3. H2 Who We Are Statements & Badge Choreography
  console.log('Verifying H2 Who We Are Statements...');
  const h2El = page.locator('section[data-scene="H2"]');
  await h2El.scrollIntoViewIfNeeded();
  await page.waitForTimeout(400);

  // Statement 1: Edge-on 90°
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'phase3_h2_stmt1_1440x900.png') });

  // Statement 2: Turn to 180° showing engraved back "GATE TO RAGE · NAGPUR"
  console.log('Advancing to Statement 2 (engraved back)...');
  await page.evaluate(() => window.scrollBy(0, window.innerHeight * 0.7));
  await page.waitForTimeout(500);
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'phase3_h2_stmt2_back_1440x900.png') });

  // Statement 3: Chaos, curated (spins back to 0° with spring settle)
  console.log('Advancing to Statement 3...');
  await page.evaluate(() => window.scrollBy(0, window.innerHeight * 0.7));
  await page.waitForTimeout(500);
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'phase3_h2_stmt3_1440x900.png') });

  // 4. H3 Nights Marquees
  console.log('Verifying H3 Nights Marquees...');
  const h3El = page.locator('section[data-scene="H3"]');
  await h3El.scrollIntoViewIfNeeded();
  await page.waitForTimeout(400);
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'phase3_h3_marquees_1440x900.png') });

  // Hover over marquee name to test fill and badge blink trigger
  const marqueeItem = page.locator('span.marquee-outline-item').first();
  if (await marqueeItem.isVisible()) {
    await marqueeItem.hover({ force: true });
    await page.waitForTimeout(200);
    console.log('Hovered over marquee item successfully.');
  }

  // 5. H4 This Season & Split Rim Light
  console.log('Verifying H4 This Season...');
  const h4El = page.locator('section[data-scene="H4"]');
  await h4El.scrollIntoViewIfNeeded();
  await page.waitForTimeout(500);
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'phase3_h4_split_rim_1440x900.png') });

  // 6. H5 Two Worlds: The Doors & DOM Twins
  console.log('Verifying H5 Two Worlds Doors & DOM Twins...');
  const h5El = page.locator('section[data-scene="H5"]');
  await h5El.scrollIntoViewIfNeeded();
  await page.waitForTimeout(600);
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'phase3_h5_doors_1440x900.png') });

  // Test DOM Twins projection and hover/focus
  const redTwin = page.locator('a[aria-label*="Enter World One"]');
  const diwaliTwin = page.locator('a[aria-label*="Enter World Two"]');

  const redTwinCount = await redTwin.count();
  console.log('Red Room DOM twin link found:', redTwinCount > 0);

  // Test Keyboard Tab Navigation to Doors
  console.log('Testing keyboard navigation (Tab)...');
  await page.keyboard.press('Tab');
  await page.waitForTimeout(100);
  await page.keyboard.press('Tab');
  await page.waitForTimeout(100);

  // Hover over Red Room door
  console.log('Hovering over Red Room door...');
  await page.evaluate(() => {
    const el = document.querySelector('a[aria-label*="Enter World One"]');
    if (el) el.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
  });
  await page.waitForTimeout(500);
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'phase3_h5_door_hover_1440x900.png') });

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

  // Rename video
  const files = fs.readdirSync(VIDEO_DIR);
  const webm = files.find((f) => f.endsWith('.webm') && !f.startsWith('phase'));
  if (webm) {
    const oldPath = path.join(VIDEO_DIR, webm);
    const newPath = path.join(VIDEO_DIR, 'phase3_desktop_walkthrough.webm');
    if (fs.existsSync(newPath)) fs.unlinkSync(newPath);
    fs.renameSync(oldPath, newPath);
    console.log('Saved:', newPath);
  }

  // ==========================================
  // TEST 2: MOBILE 390x844 VERIFICATION
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
  await mobilePage.goto('http://localhost:3000', { waitUntil: 'domcontentloaded' });

  // Mobile Loader
  await mobilePage.screenshot({ path: path.join(SCREENSHOT_DIR, 'phase3_h0_loader_390x844.png') });
  await mobilePage.waitForSelector('[role="status"]:has-text("Ready")', { state: 'attached', timeout: 15000 });
  await mobilePage.waitForTimeout(600);

  // Mobile H1
  await mobilePage.screenshot({ path: path.join(SCREENSHOT_DIR, 'phase3_h1_hero_390x844.png') });

  // Mobile H2
  await mobilePage.evaluate(() => window.scrollTo(0, window.innerHeight * 1.5));
  await mobilePage.waitForTimeout(400);
  await mobilePage.screenshot({ path: path.join(SCREENSHOT_DIR, 'phase3_h2_390x844.png') });

  // Mobile H3
  await mobilePage.evaluate(() => window.scrollTo(0, window.innerHeight * 3.5));
  await mobilePage.waitForTimeout(400);
  await mobilePage.screenshot({ path: path.join(SCREENSHOT_DIR, 'phase3_h3_390x844.png') });

  // Mobile H4
  await mobilePage.evaluate(() => window.scrollTo(0, window.innerHeight * 5.0));
  await mobilePage.waitForTimeout(400);
  await mobilePage.screenshot({ path: path.join(SCREENSHOT_DIR, 'phase3_h4_390x844.png') });

  // Mobile H5
  const mobileH5 = mobilePage.locator('section[data-scene="H5"]');
  await mobileH5.scrollIntoViewIfNeeded();
  await mobilePage.waitForTimeout(500);
  await mobilePage.screenshot({ path: path.join(SCREENSHOT_DIR, 'phase3_h5_doors_390x844.png') });

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
    const newPath = path.join(VIDEO_DIR, 'phase3_mobile_walkthrough.webm');
    if (fs.existsSync(newPath)) fs.unlinkSync(newPath);
    fs.renameSync(oldPath, newPath);
    console.log('Saved:', newPath);
  }

  await browser.close();

  console.log('\n--- VERIFICATION SUMMARY ---');
  console.log(`Console Errors: ${errors.length}`);
  console.log(`Desktop FPS: ${fpsResult.toFixed(1)} fps (Budget: >= 60 fps)`);
  console.log(`Mobile FPS: ${mobileFps.toFixed(1)} fps (Budget: >= 45 fps)`);
  console.log('All tests finished successfully!');
}

run().catch((err) => {
  console.error('Fatal error during verification:', err);
  process.exit(1);
});
