import { chromium } from 'playwright';
import path from 'path';
import fs from 'fs';

const BASE_URL = 'http://localhost:3000';
const ARTIFACT_DIR = 'C:/Users/kulvi/.gemini/antigravity/brain/c6856244-cbb4-4502-98ab-93f5039574fa';
const SCREENSHOT_DIR = path.join(ARTIFACT_DIR, 'screenshots');
const VIDEO_DIR = path.join(ARTIFACT_DIR, 'videos');

fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
fs.mkdirSync(VIDEO_DIR, { recursive: true });

async function measureFps(page, durationMs = 1000) {
  return page.evaluate((ms) => {
    return new Promise((resolve) => {
      let frames = 0;
      const start = performance.now();
      function step(now) {
        frames++;
        if (now - start < ms) {
          requestAnimationFrame(step);
        } else {
          const elapsed = (now - start) / 1000;
          resolve(Number((frames / elapsed).toFixed(1)));
        }
      }
      requestAnimationFrame(step);
    });
  }, durationMs);
}

async function runDesktopVerification(browser) {
  console.log('--- Starting Desktop (1440x900) Phase 6 Transitions Verification ---');
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    recordVideo: {
      dir: VIDEO_DIR,
      size: { width: 1440, height: 900 },
    },
  });

  const page = await context.newPage();
  const consoleErrors = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    }
  });
  page.on('pageerror', (err) => {
    consoleErrors.push(err.message);
  });

  // 1. Load Home and wait for H0 loader handoff
  await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle' });
  await page.waitForSelector('[role="status"]:has-text("Ready")', { state: 'attached', timeout: 15000 });
  await page.waitForTimeout(800);

  // Scroll to H5 (Doors)
  await page.evaluate(() => {
    const h5 = document.querySelector('[data-scene="H5"]');
    if (h5 && window.__lenis) {
      window.__lenis.scrollTo(h5, { immediate: true });
    } else if (h5) {
      h5.scrollIntoView({ behavior: 'instant' });
    }
  });
  await page.waitForTimeout(1000);

  const h5ScrollBeforeT1 = await page.evaluate(() => Math.round(window.scrollY));
  console.log('Home H5 scroll position before T1:', h5ScrollBeforeT1);

  // Hover Red Room door to trigger preloading & 10° door swing
  const redDoorLink = page.locator('a[href="/the-red-room"]').last();
  await redDoorLink.hover({ force: true });
  await page.waitForTimeout(500);

  // 2. Trigger T1: Home -> The Red Room (2.40 s total, cover at 1.35 s)
  const t1Start = Date.now();
  await redDoorLink.click({ force: true });

  // At ~120 ms (captures frame at ~550 ms after compositor sync): door swung open 75°, camera pushing in, badge dissolving Enamel -> Neon
  await page.waitForTimeout(120);
  const pathAt550ms = new URL(page.url()).pathname;
  await page.screenshot({
    path: path.join(SCREENSHOT_DIR, 'phase6_t1_door_push_1440x900.png'),
  });

  // At ~1150 ms: crimson velvet curtains sweeping closed (just before 1.35 s cover point)
  await page.waitForTimeout(450);
  await page.screenshot({
    path: path.join(SCREENSHOT_DIR, 'phase6_t1_curtains_cover_1440x900.png'),
  });

  // Wait for route change to /the-red-room
  await page.waitForURL('**/the-red-room', { timeout: 5000 });
  const t1RouteChangeMs = Date.now() - t1Start;
  console.log(`T1 route changed at ${t1RouteChangeMs} ms (target cover: ~1350 ms, pathAt550ms: ${pathAt550ms})`);

  // Curtains parting on /the-red-room
  await page.waitForTimeout(200);
  await page.screenshot({
    path: path.join(SCREENSHOT_DIR, 'phase6_t1_redroom_reveal_1440x900.png'),
  });

  // Wait for T1 to finish completely
  await page.waitForTimeout(1200);

  // 3. Scroll to R6 (Outro) on /the-red-room and trigger T3: Red Room -> Diwali
  await page.evaluate(() => {
    const r6 = document.querySelector('[data-scene="R6"]');
    if (r6 && window.__lenis) {
      window.__lenis.scrollTo(r6.offsetTop + r6.offsetHeight * 0.45, { immediate: true });
    }
  });
  await page.waitForTimeout(900);

  const r6ToDiwaliLink = page.locator('section[data-scene="R6"] a[href="/diwali"]');
  await r6ToDiwaliLink.hover({ force: true });
  await page.waitForTimeout(300);

  const t3aStart = Date.now();
  await r6ToDiwaliLink.click({ force: true });

  // At 250 ms: curtains closing & badge flipping 180° edge-on
  await page.waitForTimeout(250);
  await page.screenshot({
    path: path.join(SCREENSHOT_DIR, 'phase6_t3_red_to_diwali_close_1440x900.png'),
  });

  await page.waitForURL('**/diwali', { timeout: 5000 });
  const t3aRouteChangeMs = Date.now() - t3aStart;
  console.log(`T3 (Red Room -> Diwali) route changed at ${t3aRouteChangeMs} ms (target cover: ~800 ms)`);

  // Short 1.6s D0 title card playing on /diwali
  await page.waitForTimeout(250);
  await page.screenshot({
    path: path.join(SCREENSHOT_DIR, 'phase6_t3_diwali_short_d0_1440x900.png'),
  });

  // Wait for short 1.6s D0 card to finish revealing Diwali D1
  await page.waitForTimeout(1600);

  // 4. Scroll to D5 (Outro) on /diwali and trigger T3: Diwali -> The Red Room
  await page.evaluate(() => {
    const d5 = document.querySelector('[data-scene="D5"]');
    if (d5 && window.__lenis) {
      window.__lenis.scrollTo(d5.offsetTop + d5.offsetHeight * 0.45, { immediate: true });
    }
  });
  await page.waitForTimeout(900);

  const d5ToRedLink = page.locator('section[data-scene="D5"] a[href="/the-red-room"]');
  await d5ToRedLink.hover({ force: true });
  await page.waitForTimeout(300);
  await d5ToRedLink.click({ force: true });

  // At 220 ms: rani-pink drapes closing with gold flash
  await page.waitForTimeout(220);
  await page.screenshot({
    path: path.join(SCREENSHOT_DIR, 'phase6_t3_diwali_to_red_flash_1440x900.png'),
  });

  await page.waitForURL('**/the-red-room', { timeout: 5000 });
  await page.waitForTimeout(1800);

  // 5. Trigger T4: World -> Home H5 ("<- Back to the gate")
  await page.evaluate(() => {
    const r6 = document.querySelector('[data-scene="R6"]');
    if (r6 && window.__lenis) {
      window.__lenis.scrollTo(r6.offsetTop + r6.offsetHeight * 0.45, { immediate: true });
    }
  });
  await page.waitForTimeout(800);

  const backToGateLink = page.locator('section[data-scene="R6"] a[href="/"]');
  const t4Start = Date.now();
  await backToGateLink.click({ force: true });

  await page.waitForTimeout(180);
  await page.screenshot({
    path: path.join(SCREENSHOT_DIR, 'phase6_t4_pullback_fade_1440x900.png'),
  });

  await page.waitForURL(`${BASE_URL}/`, { timeout: 5000 });
  const t4RouteChangeMs = Date.now() - t4Start;
  await page.waitForTimeout(900);

  const homeScrollAfterT4Gate = await page.evaluate(() => Math.round(window.scrollY));
  console.log(`T4 (Back to the gate) route changed at ${t4RouteChangeMs} ms, landed at scrollY=${homeScrollAfterT4Gate} (H5 top ≈ ${h5ScrollBeforeT1})`);
  await page.screenshot({
    path: path.join(SCREENSHOT_DIR, 'phase6_t4_home_h5_landed_1440x900.png'),
  });

  // 6. Trigger T2: Home H5 -> Diwali (1.25 s exit to film cut, then D0 title card)
  const diwaliDoorLink = page.locator('a[href="/diwali"]').last();
  await diwaliDoorLink.hover({ force: true });
  await page.waitForTimeout(400);

  const t2Start = Date.now();
  await diwaliDoorLink.click({ force: true });

  // At ~160 ms (captures frame at ~650 ms): Diwali door leaves open 70°, warm white-gold exposure wash ramping 1.0 -> 2.2
  await page.waitForTimeout(160);
  await page.screenshot({
    path: path.join(SCREENSHOT_DIR, 'phase6_t2_gold_wash_1440x900.png'),
  });

  await page.waitForURL('**/diwali', { timeout: 3000 });
  const t2RouteChangeMs = Date.now() - t2Start;
  console.log(`T2 route changed at ${t2RouteChangeMs} ms (target cover: ~1250 ms)`);

  // Skip/finish D0 and scroll Diwali to D2 (y = 1500) to test T5 Browser Back & Forward scroll restoration
  await page.waitForTimeout(400);
  await page.mouse.click(720, 450);
  await page.waitForTimeout(900);

  await page.evaluate(() => {
    if (window.__lenis) {
      window.__lenis.scrollTo(1500, { immediate: true });
    }
    window.scrollTo(0, 1500);
  });
  await page.waitForTimeout(600);
  const diwaliSavedScroll = await page.evaluate(() => Math.round(window.scrollY));

  // 7. Trigger T5: Browser Back (/diwali -> /) and Browser Forward (/ -> /diwali)
  await page.goBack();
  await page.waitForURL(`${BASE_URL}/`, { timeout: 3000 });
  await page.waitForTimeout(700);
  const restoredHomeScroll = await page.evaluate(() => Math.round(window.scrollY));
  console.log(`T5 Browser Back to /: restored scrollY=${restoredHomeScroll} (expected ~${homeScrollAfterT4Gate})`);

  await page.goForward();
  await page.waitForURL('**/diwali', { timeout: 3000 });
  await page.waitForTimeout(700);
  const restoredDiwaliScroll = await page.evaluate(() => Math.round(window.scrollY));
  console.log(`T5 Browser Forward to /diwali: restored scrollY=${restoredDiwaliScroll} (expected ~${diwaliSavedScroll})`);
  await page.screenshot({
    path: path.join(SCREENSHOT_DIR, 'phase6_t5_restored_scroll_1440x900.png'),
  });

  const desktopFps = await measureFps(page, 1000);
  console.log(`Desktop FPS: ${desktopFps}`);

  const videoPath = await page.video().path();
  await context.close();

  const targetVideo = path.join(VIDEO_DIR, 'phase6_desktop_transitions.webm');
  if (fs.existsSync(videoPath)) {
    fs.copyFileSync(videoPath, targetVideo);
    console.log('Saved desktop transitions video:', targetVideo);
  }

  return {
    desktopFps,
    consoleErrors,
    pathAt550ms,
    t1RouteChangeMs,
    t2RouteChangeMs,
    t3aRouteChangeMs,
    t4RouteChangeMs,
    homeScrollAfterT4Gate,
    restoredHomeScroll,
    restoredDiwaliScroll,
  };
}

async function runMobileVerification(browser) {
  console.log('--- Starting Mobile (390x844) Phase 6 Transitions Verification ---');
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
    recordVideo: {
      dir: VIDEO_DIR,
      size: { width: 390, height: 844 },
    },
  });

  const page = await context.newPage();
  const consoleErrors = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    }
  });
  page.on('pageerror', (err) => {
    consoleErrors.push(err.message);
  });

  await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle' });
  await page.waitForSelector('[role="status"]:has-text("Ready")', { state: 'attached', timeout: 15000 });
  await page.waitForTimeout(800);

  // Scroll to H5 on mobile
  await page.evaluate(() => {
    const h5 = document.querySelector('[data-scene="H5"]');
    if (h5) h5.scrollIntoView({ behavior: 'instant' });
  });
  await page.waitForTimeout(800);

  // Trigger T1 on mobile
  const redDoorLink = page.locator('section[data-scene="H5"] a[href="/the-red-room"]').last();
  await redDoorLink.click({ force: true });
  await page.waitForTimeout(280);
  await page.screenshot({
    path: path.join(SCREENSHOT_DIR, 'phase6_t1_door_push_390x844.png'),
  });

  await page.waitForURL('**/the-red-room', { timeout: 5000 });
  await page.waitForTimeout(500);
  await page.screenshot({
    path: path.join(SCREENSHOT_DIR, 'phase6_t1_redroom_reveal_390x844.png'),
  });
  await page.waitForTimeout(1200);

  // Trigger T3 on mobile: Red Room -> Diwali
  await page.evaluate(() => {
    const r6 = document.querySelector('[data-scene="R6"]');
    if (r6) window.scrollTo(0, r6.offsetTop + r6.offsetHeight * 0.45);
  });
  await page.waitForTimeout(700);

  const r6ToDiwali = page.locator('section[data-scene="R6"] a[href="/diwali"]');
  await r6ToDiwali.click({ force: true });
  await page.waitForTimeout(450);
  await page.screenshot({
    path: path.join(SCREENSHOT_DIR, 'phase6_t3_close_390x844.png'),
  });

  await page.waitForURL('**/diwali', { timeout: 5000 });
  await page.waitForTimeout(220);
  await page.screenshot({
    path: path.join(SCREENSHOT_DIR, 'phase6_t3_diwali_d0_390x844.png'),
  });
  await page.waitForTimeout(1500);

  // Trigger T4 on mobile via top-left Nav badge -> lands at Home top (scrollY = 0)
  const navHomeLink = page.locator('header a[href="/"]');
  await navHomeLink.click({ force: true });
  await page.waitForURL(`${BASE_URL}/`, { timeout: 5000 });
  await page.waitForTimeout(800);
  const mobileNavTopScroll = await page.evaluate(() => Math.round(window.scrollY));
  await page.screenshot({
    path: path.join(SCREENSHOT_DIR, 'phase6_t4_nav_top_390x844.png'),
  });

  const mobileFps = await measureFps(page, 1000);
  console.log(`Mobile FPS: ${mobileFps}, mobileNavTopScroll: ${mobileNavTopScroll}`);

  const videoPath = await page.video().path();
  await context.close();

  const targetVideo = path.join(VIDEO_DIR, 'phase6_mobile_transitions.webm');
  if (fs.existsSync(videoPath)) {
    fs.copyFileSync(videoPath, targetVideo);
    console.log('Saved mobile transitions video:', targetVideo);
  }

  return { mobileFps, consoleErrors, mobileNavTopScroll };
}

(async () => {
  const browser = await chromium.launch({
    headless: true,
    args: [
      '--enable-webgl',
      '--ignore-gpu-blocklist',
      '--use-gl=angle',
      '--enable-gpu-rasterization',
    ],
  });
  try {
    const desktop = await runDesktopVerification(browser);
    const mobile = await runMobileVerification(browser);
    console.log('=== PHASE 6 VERIFICATION SUMMARY ===');
    console.log(JSON.stringify({ desktop, mobile }, null, 2));

    const allErrors = [...desktop.consoleErrors, ...mobile.consoleErrors];
    if (allErrors.length > 0) {
      console.error('Console errors detected:', allErrors);
      process.exit(1);
    }
  } finally {
    await browser.close();
  }
})();
