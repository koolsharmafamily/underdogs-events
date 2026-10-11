import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';

const SCREENSHOTS_DIR = 'C:/Users/kulvi/.gemini/antigravity/brain/c6856244-cbb4-4502-98ab-93f5039574fa/screenshots';

if (!fs.existsSync(SCREENSHOTS_DIR)) {
  fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
}

async function run() {
  const browser = await chromium.launch({ headless: true });

  const viewports = [
    { name: 'desktop', width: 1440, height: 900 },
    { name: 'mobile', width: 390, height: 844, isMobile: true, hasTouch: true },
  ];

  for (const vp of viewports) {
    console.log(`\n=== Testing ${vp.name} (${vp.width}x${vp.height}) ===`);
    const context = await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
      isMobile: vp.isMobile,
      hasTouch: vp.hasTouch,
    });
    const page = await context.newPage();

    const consoleErrors = [];
    const failedRequests = [];

    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    page.on('response', (res) => {
      if (res.status() >= 400) {
        failedRequests.push(`${res.url()} -> ${res.status()}`);
      }
    });

    // Helper to wait for preloader to complete
    async function waitForLoader() {
      await page.waitForFunction(() => {
        const loader = document.querySelector('.fixed.inset-0.z-50');
        return !loader || loader.style.opacity === '0' || loader.style.display === 'none';
      }, { timeout: 10000 }).catch(() => {});
      await page.waitForTimeout(1200);
    }

    // 1. Home
    console.log('Navigating to http://localhost:3000/ ...');
    await page.goto('http://localhost:3000/', { waitUntil: 'domcontentloaded' });
    await waitForLoader();

    const homeShotPath = path.join(SCREENSHOTS_DIR, `verified_home_${vp.name}_${vp.width}x${vp.height}.png`);
    await page.screenshot({ path: homeShotPath });
    console.log(`Saved screenshot: ${homeShotPath}`);

    // Scroll down to H2 and H5 to check doors and back of badge
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight * 0.35));
    await page.waitForTimeout(800);
    const h2ShotPath = path.join(SCREENSHOTS_DIR, `verified_home_h2_${vp.name}_${vp.width}x${vp.height}.png`);
    await page.screenshot({ path: h2ShotPath });

    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight * 0.95));
    await page.waitForTimeout(800);
    const h5ShotPath = path.join(SCREENSHOTS_DIR, `verified_home_h5_${vp.name}_${vp.width}x${vp.height}.png`);
    await page.screenshot({ path: h5ShotPath });

    // 2. The Red Room
    console.log('Navigating to http://localhost:3000/the-red-room ...');
    await page.goto('http://localhost:3000/the-red-room', { waitUntil: 'domcontentloaded' });
    await waitForLoader();
    const redShotPath = path.join(SCREENSHOTS_DIR, `verified_redroom_${vp.name}_${vp.width}x${vp.height}.png`);
    await page.screenshot({ path: redShotPath });

    // 3. Diwali
    console.log('Navigating to http://localhost:3000/diwali ...');
    await page.goto('http://localhost:3000/diwali', { waitUntil: 'domcontentloaded' });
    await waitForLoader();
    const diwaliShotPath = path.join(SCREENSHOTS_DIR, `verified_diwali_${vp.name}_${vp.width}x${vp.height}.png`);
    await page.screenshot({ path: diwaliShotPath });

    console.log(`Console errors (${consoleErrors.length}):`, consoleErrors);
    console.log(`Failed requests (${failedRequests.length}):`, failedRequests);

    if (consoleErrors.length > 0 || failedRequests.length > 0) {
      console.error(`Verification FAILED on ${vp.name}!`);
      process.exitCode = 1;
    }

    await context.close();
  }

  await browser.close();
  console.log('\nAll pages verified successfully!');
}

run().catch((err) => {
  console.error('Fatal error during verification:', err);
  process.exit(1);
});
