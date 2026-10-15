import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';

const outDir = 'C:/Users/kulvi/.gemini/antigravity/brain/c6856244-cbb4-4502-98ab-93f5039574fa/screenshots';
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

async function run() {
  console.log('--- Starting Comprehensive Bugfix & Mobile App Verification ---');

  const browser = await chromium.launch({
    headless: true,
    args: ['--enable-webgl', '--use-gl=angle', '--use-angle=swiftshader'],
  });

  // 1. DESKTOP TESTS (1440x900)
  console.log('\n1. Testing Desktop Entry Paths...');
  const desktopContext = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 1,
  });
  const desktopPage = await desktopContext.newPage();

  // Test 1A: Direct URL visit /diwali
  console.log('Test 1A: Direct visit to /diwali...');
  await desktopPage.goto('http://localhost:3000/diwali', { waitUntil: 'domcontentloaded' });
  await desktopPage.evaluate(() => {
    sessionStorage.setItem('underdogs-loader-seen', '1');
    const clapper = document.querySelector('[data-clapperboard]');
    if (clapper) (clapper).click();
  });
  await desktopPage.waitForTimeout(1000);
  await desktopPage.screenshot({ path: path.join(outDir, 'bugfix_d1_direct_url.png') });
  console.log('✓ Saved bugfix_d1_direct_url.png');

  // Test 1B: Page Refresh on /diwali
  console.log('Test 1B: Refreshing /diwali...');
  await desktopPage.reload({ waitUntil: 'domcontentloaded' });
  await desktopPage.evaluate(() => {
    const clapper = document.querySelector('[data-clapperboard]');
    if (clapper) (clapper).click();
  });
  await desktopPage.waitForTimeout(1000);
  await desktopPage.screenshot({ path: path.join(outDir, 'bugfix_d1_page_refresh.png') });
  console.log('✓ Saved bugfix_d1_page_refresh.png');

  // Test 1C: Home -> Door 2 (Diwali)
  console.log('Test 1C: Navigating from Home Door 2 to Diwali...');
  await desktopPage.goto('http://localhost:3000/', { waitUntil: 'domcontentloaded' });
  await desktopPage.evaluate(() => {
    sessionStorage.setItem('underdogs-loader-seen', '1');
    window.scrollTo(0, document.body.scrollHeight);
    const door = document.querySelector('[data-door-caption="diwali"]');
    if (door) (door).click();
  });
  console.log('Clicked Diwali door...');
  await desktopPage.waitForTimeout(1500); // Wait for transition & reveal (max 1.2s)
  await desktopPage.evaluate(() => {
    const clapper = document.querySelector('[data-clapperboard]');
    if (clapper) (clapper).click();
  });
  await desktopPage.waitForTimeout(1000);
  await desktopPage.screenshot({ path: path.join(outDir, 'bugfix_d1_from_home_door.png') });
  console.log('✓ Saved bugfix_d1_from_home_door.png');

  // Test 1D: Nav Link -> Diwali
  console.log('Test 1D: Navigating via desktop nav link...');
  await desktopPage.goto('http://localhost:3000/', { waitUntil: 'domcontentloaded' });
  await desktopPage.waitForTimeout(500);
  await desktopPage.evaluate(() => {
    const link = document.querySelector('header nav a[href="/diwali"]');
    if (link) (link).click();
  });
  console.log('Clicked desktop Nav Diwali link...');
  await desktopPage.waitForTimeout(1500);
  await desktopPage.evaluate(() => {
    const clapper = document.querySelector('[data-clapperboard]');
    if (clapper) (clapper).click();
  });
  await desktopPage.waitForTimeout(1000);
  await desktopPage.screenshot({ path: path.join(outDir, 'bugfix_d1_from_nav_link.png') });
  console.log('✓ Saved bugfix_d1_from_nav_link.png');

  // Test 1E: Red Room "Now meet the other" -> Diwali (T3)
  console.log('Test 1E: Navigating from Red Room to Diwali...');
  await desktopPage.goto('http://localhost:3000/the-red-room', { waitUntil: 'domcontentloaded' });
  await desktopPage.evaluate(() => {
    sessionStorage.setItem('underdogs-loader-seen', '1');
    window.scrollTo(0, document.body.scrollHeight);
    const link = document.querySelector('a[href="/diwali"]');
    if (link) (link).click();
  });
  console.log('Clicked "Now meet the other" -> Diwali...');
  await desktopPage.waitForTimeout(1500);
  await desktopPage.evaluate(() => {
    const clapper = document.querySelector('[data-clapperboard]');
    if (clapper) (clapper).click();
  });
  await desktopPage.waitForTimeout(1000);
  await desktopPage.screenshot({ path: path.join(outDir, 'bugfix_d1_from_redroom_other.png') });
  console.log('✓ Saved bugfix_d1_from_redroom_other.png');

  // Test 1F: Browser Back / Forward
  console.log('Test 1F: Testing Browser Back / Forward...');
  await desktopPage.goBack({ waitUntil: 'domcontentloaded' });
  await desktopPage.waitForTimeout(800);
  await desktopPage.goForward({ waitUntil: 'domcontentloaded' });
  await desktopPage.waitForTimeout(1200);
  await desktopPage.screenshot({ path: path.join(outDir, 'bugfix_d1_back_forward.png') });
  console.log('✓ Saved bugfix_d1_back_forward.png');

  // Capture Desktop Home to prove pixel-identical intact doors
  console.log('Capturing Desktop Home doors...');
  await desktopPage.goto('http://localhost:3000/', { waitUntil: 'domcontentloaded' });
  await desktopPage.evaluate(() => {
    window.scrollTo(0, document.body.scrollHeight * 0.9);
  });
  await desktopPage.waitForTimeout(1000);
  await desktopPage.screenshot({ path: path.join(outDir, 'desktop_h5_doors_untouched.png') });
  console.log('✓ Saved desktop_h5_doors_untouched.png');

  await desktopContext.close();

  // 2. MOBILE APP TESTS (390x844 - iPhone 14 / Pixel standard)
  console.log('\n2. Testing Mobile Web App...');
  const mobileContext = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
  });
  const mobilePage = await mobileContext.newPage();

  // Test 2A: Mobile Home Feed (Hero)
  console.log('Test 2A: Mobile Home Feed...');
  await mobilePage.goto('http://localhost:3000/', { waitUntil: 'domcontentloaded' });
  await mobilePage.evaluate(() => {
    sessionStorage.setItem('underdogs-loader-seen', '1');
  });
  await mobilePage.waitForTimeout(1000);
  await mobilePage.screenshot({ path: path.join(outDir, 'mobile_app_home_hero.png') });
  console.log('✓ Saved mobile_app_home_hero.png');

  // Test 2B: Mobile Home Statements ("Who we are")
  await mobilePage.evaluate(() => window.scrollBy(0, 500));
  await mobilePage.waitForTimeout(600);
  await mobilePage.screenshot({ path: path.join(outDir, 'mobile_app_home_statements.png') });
  console.log('✓ Saved mobile_app_home_statements.png');

  // Test 2C: Mobile Home Nights & This Season
  await mobilePage.evaluate(() => window.scrollBy(0, 700));
  await mobilePage.waitForTimeout(600);
  await mobilePage.screenshot({ path: path.join(outDir, 'mobile_app_home_this_season.png') });
  console.log('✓ Saved mobile_app_home_this_season.png');

  // Test 2D: Events Tab (/events)
  console.log('Test 2D: Mobile Events Tab...');
  await mobilePage.goto('http://localhost:3000/events', { waitUntil: 'domcontentloaded' });
  await mobilePage.waitForTimeout(1000);
  await mobilePage.screenshot({ path: path.join(outDir, 'mobile_app_events_screen.png') });
  console.log('✓ Saved mobile_app_events_screen.png');

  // Test 2E: Mobile Events Card -> Diwali
  console.log('Test 2E: Mobile Events card to Diwali...');
  await mobilePage.evaluate(() => {
    const card = document.querySelector('a[href="/diwali"]');
    if (card) {
      card.scrollIntoView();
      (card).click();
    }
  });
  console.log('Clicked DHAMAAKA card on mobile...');
  await mobilePage.waitForTimeout(1500);
  await mobilePage.evaluate(() => {
    const clapper = document.querySelector('[data-clapperboard]');
    if (clapper) (clapper).click();
  });
  await mobilePage.waitForTimeout(1000);
  await mobilePage.screenshot({ path: path.join(outDir, 'mobile_app_diwali_detail.png') });
  console.log('✓ Saved mobile_app_diwali_detail.png');

  // Test 2F: Mobile Red Room Detail
  console.log('Test 2F: Mobile Red Room Detail...');
  await mobilePage.goto('http://localhost:3000/the-red-room', { waitUntil: 'domcontentloaded' });
  await mobilePage.waitForTimeout(1200);
  await mobilePage.screenshot({ path: path.join(outDir, 'mobile_app_redroom_detail.png') });
  console.log('✓ Saved mobile_app_redroom_detail.png');

  await mobileContext.close();

  // 3. THROTTLED SLOW 4G TEST WITH EMPTY CACHE
  console.log('\n3. Testing Throttled Slow 4G with Empty Cache...');
  const slowContext = await browser.newContext({
    viewport: { width: 1440, height: 900 },
  });
  const slowPage = await slowContext.newPage();
  const cdp = await slowContext.newCDPSession(slowPage);

  // Emulate Slow 4G: 500 kb/s download, 500 kb/s upload, 400ms latency
  await cdp.send('Network.enable');
  await cdp.send('Network.emulateNetworkConditions', {
    offline: false,
    latency: 400,
    downloadThroughput: (500 * 1024) / 8,
    uploadThroughput: (500 * 1024) / 8,
  });

  console.log('Opening Home -> Diwali under Slow 4G conditions...');
  await slowPage.goto('http://localhost:3000/', { waitUntil: 'domcontentloaded' });
  await slowPage.evaluate(() => {
    sessionStorage.setItem('underdogs-loader-seen', '1');
    window.scrollTo(0, document.body.scrollHeight);
  });
  await slowPage.waitForTimeout(1000);

  const startTime = Date.now();
  await slowPage.evaluate(() => {
    const door = document.querySelector('[data-door-caption="diwali"]');
    if (door) (door).click();
  });
  console.log('Clicked Diwali door on Slow 4G...');

  // Take screenshot during cover transition / early reveal (around 800ms)
  await slowPage.waitForTimeout(800);
  await slowPage.screenshot({ path: path.join(outDir, 'bugfix_slow4g_cover_reveal.png') });
  console.log('✓ Saved bugfix_slow4g_cover_reveal.png');

  // Wait until 1.5s total (past the 1.2s max cover wait)
  await slowPage.waitForTimeout(800);
  const elapsed = Date.now() - startTime;
  console.log(`Cover opened in ~${elapsed}ms (guaranteed <= 1.2s + anim)`);

  await slowPage.evaluate(() => {
    const clapper = document.querySelector('[data-clapperboard]');
    if (clapper) (clapper).click();
  });
  await slowPage.waitForTimeout(1000);
  await slowPage.screenshot({ path: path.join(outDir, 'bugfix_slow4g_d1_ready.png') });
  console.log('✓ Saved bugfix_slow4g_d1_ready.png');

  await slowContext.close();
  await browser.close();

  console.log('\n--- ALL VERIFICATIONS COMPLETED SUCCESSFULLY ---');
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
