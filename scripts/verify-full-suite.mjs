import { chromium } from 'playwright';
import path from 'node:path';
import fs from 'node:fs';

const ARTIFACTS_DIR = 'C:/Users/kulvi/.gemini/antigravity/brain/c6856244-cbb4-4502-98ab-93f5039574fa';
const SCREENSHOTS_DIR = path.join(ARTIFACTS_DIR, 'screenshots');
const VIDEOS_DIR = path.join(ARTIFACTS_DIR, 'videos');

fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
fs.mkdirSync(VIDEOS_DIR, { recursive: true });

async function runVerification() {
  console.log('=== STARTING PLAYWRIGHT VERIFICATION ===');
  const browser = await chromium.launch({
    headless: true,
    args: ['--enable-webgl', '--enable-webgl2', '--use-gl=angle', '--use-angle=swiftshader'],
  });

  // 1. DESKTOP RUN (1440x900)
  console.log('\n--- TESTING DESKTOP (1440x900) & SHADER PROGRAM STABILITY ---');
  const desktopContext = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    recordVideo: { dir: VIDEOS_DIR, size: { width: 1440, height: 900 } },
  });
  const page = await desktopContext.newPage();

  // Load Home
  console.log('1. Loading Home page (/) ...');
  await page.goto('http://localhost:3000/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2500); // Wait for loader handoff to complete

  // Capture Home Desktop Screenshot
  const homeShotPath = path.join(SCREENSHOTS_DIR, 'verified_home_hero_pink_1440x900.png');
  await page.screenshot({ path: homeShotPath });
  console.log('Saved:', homeShotPath);

  const homePrograms = await page.evaluate(() => (window).__threeRenderer?.info?.programs?.length ?? null);
  console.log('Home initial programs.length:', homePrograms);

  // Navigate to The Red Room via Transition
  console.log('\n2. Triggering T1 transition to The Red Room (/the-red-room) ...');
  await page.evaluate(() => {
    const link = document.querySelector('a[href="/the-red-room"]');
    if (link) (link).click();
    else window.location.href = '/the-red-room';
  });
  await page.waitForTimeout(3500); // Wait for T1 transition and curtain opening

  // Capture Red Room Desktop Screenshot
  const redRoomShotPath = path.join(SCREENSHOTS_DIR, 'verified_redroom_r1_neon_1440x900.png');
  await page.screenshot({ path: redRoomShotPath });
  console.log('Saved:', redRoomShotPath);

  const redRoomPrograms = await page.evaluate(() => (window).__threeRenderer?.info?.programs?.length ?? null);
  console.log('The Red Room programs.length:', redRoomPrograms);

  // Navigate to Diwali via Transition
  console.log('\n3. Triggering T3 transition to Diwali (/diwali) ...');
  await page.evaluate(() => {
    const link = document.querySelector('a[href="/diwali"]');
    if (link) (link).click();
    else window.location.href = '/diwali';
  });
  await page.waitForTimeout(3500); // Wait for T3 transition

  // Capture Diwali Desktop Screenshot
  const diwaliShotPath = path.join(SCREENSHOTS_DIR, 'verified_diwali_d1_jewelled_1440x900.png');
  await page.screenshot({ path: diwaliShotPath });
  console.log('Saved:', diwaliShotPath);

  const diwaliPrograms = await page.evaluate(() => (window).__threeRenderer?.info?.programs?.length ?? null);
  console.log('Diwali programs.length:', diwaliPrograms);

  // Navigate back to Home via Transition
  console.log('\n4. Triggering T4 transition back to Home (/) ...');
  await page.evaluate(() => {
    const link = document.querySelector('a[href="/"]');
    if (link) (link).click();
    else window.location.href = '/';
  });
  await page.waitForTimeout(3500); // Wait for T4 transition

  const returnHomePrograms = await page.evaluate(() => (window).__threeRenderer?.info?.programs?.length ?? null);
  console.log('Return Home programs.length:', returnHomePrograms);

  console.log('\nPROGRAM COUNT SUMMARY:');
  console.log(`  Initial Home: ${homePrograms}`);
  console.log(`  Red Room:     ${redRoomPrograms}`);
  console.log(`  Diwali:       ${diwaliPrograms}`);
  console.log(`  Return Home:  ${returnHomePrograms}`);
  const isConstant =
    homePrograms !== null &&
    homePrograms === redRoomPrograms &&
    redRoomPrograms === diwaliPrograms &&
    diwaliPrograms === returnHomePrograms;
  console.log(`  Programs count constant across full cycle: ${isConstant ? 'YES (PASS)' : 'NO'}`);

  await desktopContext.close(); // Saves transition video

  // 2. MOBILE RUN (390x844)
  console.log('\n--- TESTING MOBILE (390x844) ---');
  const mobileContext = await browser.newContext({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
  });
  const mobilePage = await mobileContext.newPage();

  // Direct load of Home Mobile
  console.log('1. Loading Home Mobile ...');
  await mobilePage.goto('http://localhost:3000/', { waitUntil: 'networkidle' });
  await mobilePage.waitForTimeout(2500);
  const homeMobileShot = path.join(SCREENSHOTS_DIR, 'verified_home_hero_pink_390x844.png');
  await mobilePage.screenshot({ path: homeMobileShot });
  console.log('Saved:', homeMobileShot);

  // Direct load of Red Room Mobile (verifying direct visit/refresh world mapping)
  console.log('2. Direct visit to The Red Room Mobile (/the-red-room) ...');
  await mobilePage.goto('http://localhost:3000/the-red-room', { waitUntil: 'networkidle' });
  await mobilePage.waitForTimeout(2500);
  const redRoomMobileShot = path.join(SCREENSHOTS_DIR, 'verified_redroom_r1_neon_390x844.png');
  await mobilePage.screenshot({ path: redRoomMobileShot });
  console.log('Saved:', redRoomMobileShot);

  // Direct load of Diwali Mobile (verifying direct visit/refresh world mapping)
  console.log('3. Direct visit to Diwali Mobile (/diwali) ...');
  await mobilePage.goto('http://localhost:3000/diwali', { waitUntil: 'networkidle' });
  await mobilePage.waitForTimeout(2500);
  const diwaliMobileShot = path.join(SCREENSHOTS_DIR, 'verified_diwali_d1_jewelled_390x844.png');
  await mobilePage.screenshot({ path: diwaliMobileShot });
  console.log('Saved:', diwaliMobileShot);

  await mobileContext.close();
  await browser.close();
  console.log('\n=== PLAYWRIGHT VERIFICATION COMPLETE ===');
}

runVerification().catch((err) => {
  console.error('VERIFICATION ERROR:', err);
  process.exit(1);
});
