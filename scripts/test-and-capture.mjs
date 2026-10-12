import { chromium } from 'playwright';
import path from 'node:path';
import fs from 'node:fs';

const ARTIFACTS_DIR = 'C:/Users/kulvi/.gemini/antigravity/brain/c6856244-cbb4-4502-98ab-93f5039574fa';
const SCREENSHOTS_DIR = path.join(ARTIFACTS_DIR, 'screenshots');
const VIDEOS_DIR = path.join(ARTIFACTS_DIR, 'videos');

fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
fs.mkdirSync(VIDEOS_DIR, { recursive: true });

async function run() {
  console.log('=== STARTING HIGH-FIDELITY TEST AND CAPTURE ===');
  const browser = await chromium.launch({
    headless: true,
    args: ['--enable-webgl', '--enable-webgl2', '--ignore-gpu-blocklist', '--enable-gpu-rasterization'],
  });

  // -------------------------------------------------------------------------
  // 1. DESKTOP CAPTURE & STABILITY TEST (1440x900)
  // -------------------------------------------------------------------------
  console.log('\n--- 1. DESKTOP HERO & SECTIONS (1440x900) ---');
  const desktopCtx = await browser.newContext({
    viewport: { width: 1440, height: 900 },
  });
  const page = await desktopCtx.newPage();
  page.on('console', (msg) => {
    if (msg.type() === 'error') console.log('[Browser Error]', msg.text());
  });

  // (A) Home Hero (Desktop)
  console.log('Loading Home (/) ...');
  await page.goto('http://localhost:3000/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2600); // Wait for loader handoff + 400ms crossfade + pop to settle cleanly

  const homeDesktopShot = path.join(SCREENSHOTS_DIR, 'verified_home_hero_pink_1440x900.png');
  await page.screenshot({ path: homeDesktopShot });
  console.log('Captured Home Desktop (Pink Badge):', homeDesktopShot);

  const p0 = await page.evaluate(() => (window).__threeRenderer?.info?.programs?.length ?? null);
  console.log('Programs on Home:', p0);

  // (B) The Red Room R1 (Desktop direct visit to confirm authentic neon GLB)
  console.log('\nDirect visit to The Red Room (/the-red-room) ...');
  await page.goto('http://localhost:3000/the-red-room', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);

  const redRoomDesktopShot = path.join(SCREENSHOTS_DIR, 'verified_redroom_r1_neon_1440x900.png');
  await page.screenshot({ path: redRoomDesktopShot });
  console.log('Captured Red Room Desktop (Red Neon Badge):', redRoomDesktopShot);

  const p1 = await page.evaluate(() => (window).__threeRenderer?.info?.programs?.length ?? null);
  console.log('Programs on Red Room:', p1);

  // (C) Diwali D1 (Desktop direct visit to confirm authentic jewelled GLB)
  console.log('\nDirect visit to Diwali (/diwali) ...');
  await page.goto('http://localhost:3000/diwali', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);

  const diwaliDesktopShot = path.join(SCREENSHOTS_DIR, 'verified_diwali_d1_jewelled_1440x900.png');
  await page.screenshot({ path: diwaliDesktopShot });
  console.log('Captured Diwali Desktop (Pink-and-Gold Jewelled Badge):', diwaliDesktopShot);

  const p2 = await page.evaluate(() => (window).__threeRenderer?.info?.programs?.length ?? null);
  console.log('Programs on Diwali:', p2);

  await desktopCtx.close();

  // -------------------------------------------------------------------------
  // 2. MOBILE CAPTURE (390x844)
  // -------------------------------------------------------------------------
  console.log('\n--- 2. MOBILE HERO & SECTIONS (390x844) ---');
  const mobileCtx = await browser.newContext({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
  });
  const mobilePage = await mobileCtx.newPage();

  // (A) Home Mobile
  console.log('Loading Home Mobile ...');
  await mobilePage.goto('http://localhost:3000/', { waitUntil: 'networkidle' });
  await mobilePage.waitForTimeout(2600);

  const homeMobileShot = path.join(SCREENSHOTS_DIR, 'verified_home_hero_pink_390x844.png');
  await mobilePage.screenshot({ path: homeMobileShot });
  console.log('Captured Home Mobile (Pink Badge):', homeMobileShot);

  // (B) The Red Room Mobile
  console.log('Loading Red Room Mobile ...');
  await mobilePage.goto('http://localhost:3000/the-red-room', { waitUntil: 'networkidle' });
  await mobilePage.waitForTimeout(2000);

  const redRoomMobileShot = path.join(SCREENSHOTS_DIR, 'verified_redroom_r1_neon_390x844.png');
  await mobilePage.screenshot({ path: redRoomMobileShot });
  console.log('Captured Red Room Mobile (Red Neon Badge):', redRoomMobileShot);

  // (C) Diwali Mobile
  console.log('Loading Diwali Mobile ...');
  await mobilePage.goto('http://localhost:3000/diwali', { waitUntil: 'networkidle' });
  await mobilePage.waitForTimeout(2000);

  const diwaliMobileShot = path.join(SCREENSHOTS_DIR, 'verified_diwali_d1_jewelled_390x844.png');
  await mobilePage.screenshot({ path: diwaliMobileShot });
  console.log('Captured Diwali Mobile (Jewelled Badge):', diwaliMobileShot);

  await mobileCtx.close();

  // -------------------------------------------------------------------------
  // 3. TRANSITION RECORDINGS & PROGRAM STABILITY ACROSS FULL CYCLE
  // -------------------------------------------------------------------------
  console.log('\n--- 3. TRANSITION RECORDINGS & PROGRAM STABILITY ---');
  const recordCtx = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    recordVideo: { dir: VIDEOS_DIR, size: { width: 1440, height: 900 } },
  });
  const recPage = await recordCtx.newPage();
  recPage.on('console', (msg) => {
    if (msg.type() === 'error') console.log('[Rec Browser Error]', msg.text());
  });

  // Load Home
  console.log('Starting cycle at Home (/) ...');
  await recPage.goto('http://localhost:3000/', { waitUntil: 'networkidle' });
  await recPage.waitForTimeout(2600);

  const cycle0 = await recPage.evaluate(() => (window).__threeRenderer?.info?.programs?.length ?? null);
  console.log('Cycle Step 0 [Home]:', cycle0);

  // Trigger T1: Home -> The Red Room
  console.log('Triggering T1: Home -> The Red Room ...');
  await recPage.click('header a[href="/the-red-room"]', { force: true });
  await recPage.waitForTimeout(3800); // Transition plays with continuous camera & dissolve

  const cycle1 = await recPage.evaluate(() => (window).__threeRenderer?.info?.programs?.length ?? null);
  console.log('Cycle Step 1 [The Red Room]:', cycle1);

  // Click Diwali link
  console.log('Triggering T3: The Red Room -> Diwali ...');
  await recPage.click('header a[href="/diwali"]', { force: true });
  await recPage.waitForTimeout(3600);

  const cycle2 = await recPage.evaluate(() => (window).__threeRenderer?.info?.programs?.length ?? null);
  console.log('Cycle Step 2 [Diwali]:', cycle2);

  // Click Home link
  console.log('Triggering T4: Diwali -> Home ...');
  await recPage.click('header a[href="/"]', { force: true });
  await recPage.waitForTimeout(3600);

  const cycle3 = await recPage.evaluate(() => (window).__threeRenderer?.info?.programs?.length ?? null);
  console.log('Cycle Step 3 [Return to Home]:', cycle3);

  // Second cycle: Home -> Red Room -> Diwali -> Home
  console.log('\n--- Testing Full Cycle 2 (warm loop) ---');
  await recPage.click('header a[href="/the-red-room"]', { force: true });
  await recPage.waitForTimeout(3800);
  const cycle4 = await recPage.evaluate(() => (window).__threeRenderer?.info?.programs?.length ?? null);
  console.log('Cycle 2 Step 1 [The Red Room]:', cycle4);

  await recPage.click('header a[href="/diwali"]', { force: true });
  await recPage.waitForTimeout(3600);
  const cycle5 = await recPage.evaluate(() => (window).__threeRenderer?.info?.programs?.length ?? null);
  console.log('Cycle 2 Step 2 [Diwali]:', cycle5);

  await recPage.click('header a[href="/"]', { force: true });
  await recPage.waitForTimeout(3600);
  const cycle6 = await recPage.evaluate(() => (window).__threeRenderer?.info?.programs?.length ?? null);
  console.log('Cycle 2 Step 3 [Return to Home]:', cycle6);

  console.log('\n=== FINAL PROGRAM METRICS ===');
  console.log(`Initial: ${cycle0} -> R1: ${cycle1} -> D1: ${cycle2} -> Home: ${cycle3}`);
  console.log(`Cycle 2: R1: ${cycle4} -> D1: ${cycle5} -> Home: ${cycle6}`);
  console.log(`Cycle 2 constant: ${cycle3 === cycle4 && cycle4 === cycle5 && cycle5 === cycle6 ? 'YES (100% CONSTANT)' : 'NO'}`);

  await recordCtx.close();
  await browser.close();
  console.log('\n=== ALL CAPTURES AND VERIFICATIONS COMPLETE ===');
}

run().catch((err) => {
  console.error('ERROR:', err);
  process.exit(1);
});
