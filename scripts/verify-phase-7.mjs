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

async function verifySeoAndRoutes(page) {
  console.log('--- Verifying SEO, Open Graph, Sitemap, Robots & JSON-LD (Part 13.7) ---');

  const sitemapRes = await page.goto(`${BASE_URL}/sitemap.xml`);
  const sitemapText = await sitemapRes.text();
  const sitemapOk =
    sitemapRes.status() === 200 &&
    sitemapText.includes('/the-red-room') &&
    sitemapText.includes('/diwali');

  const robotsRes = await page.goto(`${BASE_URL}/robots.txt`);
  const robotsText = await robotsRes.text();
  const robotsOk = robotsRes.status() === 200 && robotsText.includes('sitemap.xml');

  const routeChecks = {};
  for (const route of ['/', '/the-red-room', '/diwali']) {
    await page.goto(`${BASE_URL}${route}`, { waitUntil: 'domcontentloaded' });
    const seo = await page.evaluate(() => {
      const canonical = document.querySelector('link[rel="canonical"]')?.getAttribute('href');
      const ogImage = document.querySelector('meta[property="og:image"]')?.getAttribute('content');
      const ogWidth = document.querySelector('meta[property="og:image:width"]')?.getAttribute('content');
      const ogHeight = document.querySelector('meta[property="og:image:height"]')?.getAttribute('content');
      const ldJsonRaw = document.querySelector('script[type="application/ld+json"]')?.textContent;
      const ldJson = ldJsonRaw ? JSON.parse(ldJsonRaw) : null;
      const outboundLinks = Array.from(document.querySelectorAll('a[href]'))
        .map((a) => a.getAttribute('href') || '')
        .filter((h) => /^https?:|^mailto:|^tel:/i.test(h));
      return { canonical, ogImage, ogWidth, ogHeight, ldJson, outboundLinks };
    });
    routeChecks[route] = seo;
  }

  return { sitemapOk, robotsOk, routeChecks };
}

async function verifyDesktopAndResilience(browser) {
  console.log('--- Starting Desktop (1440x900) Phase 7 & Resilience Verification ---');
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
    if (msg.type() === 'error') consoleErrors.push(msg.text());
  });
  page.on('pageerror', (err) => consoleErrors.push(err.message));

  const seoReport = await verifySeoAndRoutes(page);

  // 1. Load Home (1440x900)
  await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle' });
  await page.waitForSelector('[role="status"]:has-text("Ready")', { state: 'attached', timeout: 15000 });
  await page.waitForTimeout(800);

  await page.screenshot({
    path: path.join(SCREENSHOT_DIR, 'phase7_home_h1_1440x900.png'),
  });

  // Scroll to H5 Doors
  await page.evaluate(() => {
    const h5 = document.querySelector('[data-scene="H5"]');
    if (h5 && window.__lenis) window.__lenis.scrollTo(h5, { immediate: true });
  });
  await page.waitForTimeout(800);
  await page.screenshot({
    path: path.join(SCREENSHOT_DIR, 'phase7_home_h5_1440x900.png'),
  });

  // 2. Test WebGL Context Lost (1st loss recovers, 2nd loss drops to T0) per Part 13.8
  await page.evaluate(() => {
    window.__webglLoseContext?.();
  });
  await page.waitForTimeout(150);
  const posterVisibleDuringFirstLoss = await page
    .locator('[data-testid="t0-fallback-poster"]')
    .isVisible();
  // Wait for auto-restore (~450ms)
  await page.waitForTimeout(700);
  const recoveredAfterFirstLoss = !(await page
    .locator('[data-testid="t0-fallback-poster"]')
    .isVisible());

  const desktopFps = await measureFps(page, 1000);

  // 3. Test T0 Fallback Posters across all 3 worlds (Part 13.8)
  await page.goto(`${BASE_URL}/?tier=T0`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(800);
  // Click to skip loader fast
  await page.mouse.click(720, 450);
  await page.waitForTimeout(600);
  const t0HomeVisible = await page.locator('[data-testid="t0-fallback-poster"]').isVisible();
  const t0CanvasCount = await page.locator('canvas').count();
  await page.screenshot({
    path: path.join(SCREENSHOT_DIR, 'phase7_t0_home_poster_1440x900.png'),
  });

  await page.goto(`${BASE_URL}/the-red-room?tier=T0`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(600);
  await page.mouse.click(720, 450);
  await page.waitForTimeout(1500);
  const t0RedRoomVisible = await page.locator('[data-testid="t0-fallback-poster"]').isVisible();
  await page.screenshot({
    path: path.join(SCREENSHOT_DIR, 'phase7_t0_redroom_poster_1440x900.png'),
  });

  await page.goto(`${BASE_URL}/diwali?tier=T0`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(500);
  await page.mouse.click(720, 450);
  await page.waitForTimeout(900);
  const t0DiwaliVisible = await page.locator('[data-testid="t0-fallback-poster"]').isVisible();
  await page.screenshot({
    path: path.join(SCREENSHOT_DIR, 'phase7_t0_diwali_poster_1440x900.png'),
  });

  // 4. Test Asset Failure Notice ("Some visuals couldn't load — showing stills.") per Part 13.8
  await page.goto(`${BASE_URL}/the-red-room?assetError=1`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(500);
  await page.mouse.click(720, 450);
  await page.waitForTimeout(1500);
  const assetNoticeText = await page
    .locator('[data-testid="asset-failure-notice"]')
    .textContent();
  await page.screenshot({
    path: path.join(SCREENSHOT_DIR, 'phase7_asset_failure_notice_1440x900.png'),
  });

  const videoPath = await page.video().path();
  await context.close();

  const targetVideo = path.join(VIDEO_DIR, 'phase7_desktop_walkthrough.webm');
  if (fs.existsSync(videoPath)) {
    fs.copyFileSync(videoPath, targetVideo);
  }

  return {
    desktopFps,
    consoleErrors,
    seoReport,
    resilience: {
      posterVisibleDuringFirstLoss,
      recoveredAfterFirstLoss,
      t0HomeVisible,
      t0RedRoomVisible,
      t0DiwaliVisible,
      t0CanvasCount,
      assetNoticeText: assetNoticeText?.trim() || '',
    },
  };
}

async function verifyPortraitMobile(browser) {
  console.log('--- Starting Mobile Portrait (390x844) Framing & QA Verification ---');
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
    if (msg.type() === 'error') consoleErrors.push(msg.text());
  });
  page.on('pageerror', (err) => consoleErrors.push(err.message));

  // 1. Portrait Home (H1, H2, H5)
  await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle' });
  await page.waitForSelector('[role="status"]:has-text("Ready")', { state: 'attached', timeout: 15000 });
  await page.waitForTimeout(800);
  await page.screenshot({
    path: path.join(SCREENSHOT_DIR, 'phase7_portrait_home_h1_390x844.png'),
  });

  await page.evaluate(() => {
    const h2 = document.querySelector('[data-scene="H2"]');
    if (h2) window.scrollTo(0, h2.offsetTop + h2.offsetHeight * 0.45);
  });
  await page.waitForTimeout(700);
  await page.screenshot({
    path: path.join(SCREENSHOT_DIR, 'phase7_portrait_home_h2_390x844.png'),
  });

  await page.evaluate(() => {
    const h5 = document.querySelector('[data-scene="H5"]');
    if (h5) window.scrollTo(0, h5.offsetTop);
  });
  await page.waitForTimeout(700);
  await page.screenshot({
    path: path.join(SCREENSHOT_DIR, 'phase7_portrait_home_h5_390x844.png'),
  });

  // 2. Portrait Red Room (R1, R4, R5)
  await page.goto(`${BASE_URL}/the-red-room`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(600);
  await page.mouse.click(195, 420);
  await page.waitForTimeout(1600);
  await page.screenshot({
    path: path.join(SCREENSHOT_DIR, 'phase7_portrait_redroom_r1_390x844.png'),
  });

  await page.evaluate(() => {
    const r4 = document.querySelector('[data-scene="R4"]');
    if (r4) window.scrollTo(0, r4.offsetTop + r4.offsetHeight * 0.65);
  });
  await page.waitForTimeout(800);
  await page.screenshot({
    path: path.join(SCREENSHOT_DIR, 'phase7_portrait_redroom_r4_390x844.png'),
  });

  // 3. Portrait Diwali (D1, D2, D3, D4)
  await page.goto(`${BASE_URL}/diwali`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(500);
  await page.mouse.click(195, 420);
  await page.waitForTimeout(900);
  await page.screenshot({
    path: path.join(SCREENSHOT_DIR, 'phase7_portrait_diwali_d1_390x844.png'),
  });

  await page.evaluate(() => {
    const d3 = document.querySelector('[data-scene="D3"]');
    if (d3) window.scrollTo(0, d3.offsetTop + d3.offsetHeight * 0.55);
  });
  await page.waitForTimeout(800);
  await page.screenshot({
    path: path.join(SCREENSHOT_DIR, 'phase7_portrait_diwali_d3_390x844.png'),
  });

  await page.evaluate(() => {
    const d4 = document.querySelector('[data-scene="D4"]');
    if (d4) window.scrollTo(0, d4.offsetTop + d4.offsetHeight * 0.5);
  });
  await page.waitForTimeout(800);
  await page.screenshot({
    path: path.join(SCREENSHOT_DIR, 'phase7_portrait_diwali_d4_390x844.png'),
  });

  // 4. Test mobile URL-bar height-only resize (<120px) & orientation change debounce (Part 12.1)
  await page.setViewportSize({ width: 390, height: 780 }); // 64px URL bar change -> ignored
  await page.waitForTimeout(200);
  await page.setViewportSize({ width: 844, height: 390 }); // Landscape orientation change
  await page.waitForTimeout(500);
  await page.setViewportSize({ width: 390, height: 844 }); // Back to portrait
  await page.waitForTimeout(500);

  const mobileFps = await measureFps(page, 1000);

  // 5. Portrait T0 Fallback Poster screenshot
  await page.goto(`${BASE_URL}/the-red-room?tier=T0`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(500);
  await page.mouse.click(195, 420);
  await page.waitForTimeout(1500);
  await page.screenshot({
    path: path.join(SCREENSHOT_DIR, 'phase7_t0_redroom_poster_390x844.png'),
  });

  const videoPath = await page.video().path();
  await context.close();

  const targetVideo = path.join(VIDEO_DIR, 'phase7_mobile_walkthrough.webm');
  if (fs.existsSync(videoPath)) {
    fs.copyFileSync(videoPath, targetVideo);
  }

  return { mobileFps, consoleErrors };
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
    const desktop = await verifyDesktopAndResilience(browser);
    const mobile = await verifyPortraitMobile(browser);
    console.log('=== PHASE 7 VERIFICATION SUMMARY ===');
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
