import { chromium } from 'playwright';
import path from 'node:path';
import fs from 'node:fs';

const screenshotDir = path.resolve('C:/Users/kulvi/.gemini/antigravity/brain/c6856244-cbb4-4502-98ab-93f5039574fa/screenshots');
if (!fs.existsSync(screenshotDir)) {
  fs.mkdirSync(screenshotDir, { recursive: true });
}

async function run() {
  const browser = await chromium.launch({
    headless: true,
    args: ['--enable-webgl', '--ignore-gpu-blocklist', '--use-gl=angle', '--use-angle=default'],
  });

  const renderStats = {};

  // 1. Desktop Verification (1440x900)
  console.log('--- Desktop Verification (1440x900) ---');
  const desktopContext = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    hasTouch: false,
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  });
  const page = await desktopContext.newPage();

  page.on('console', (msg) => {
    if (msg.type() === 'error') console.log('[Browser Error]', msg.text());
  });

  // A. Home H1
  await page.goto('http://localhost:3000/?skipLoader=1', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);
  await page.screenshot({ path: path.join(screenshotDir, 'verified_home_h1_1440x900.png') });
  console.log('Captured verified_home_h1_1440x900.png');

  renderStats['Home_Desktop'] = await page.evaluate(() => {
    const r = window.__threeRenderer;
    return r ? { drawCalls: r.info.render.calls, triangles: r.info.render.triangles, programs: r.info.programs.length } : null;
  });

  // Scroll to H5 (both doors)
  await page.evaluate(() => {
    const h5 = document.querySelector('[data-scene="H5"]');
    if (h5) h5.scrollIntoView({ behavior: 'instant' });
  });
  await page.waitForTimeout(1000);
  await page.screenshot({ path: path.join(screenshotDir, 'verified_home_h5_1440x900.png') });
  console.log('Captured verified_home_h5_1440x900.png');

  // B. The Red Room R1
  await page.goto('http://localhost:3000/the-red-room?skipLoader=1', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1800);
  await page.screenshot({ path: path.join(screenshotDir, 'verified_redroom_r1_1440x900.png') });
  console.log('Captured verified_redroom_r1_1440x900.png');

  renderStats['RedRoom_Desktop'] = await page.evaluate(() => {
    const r = window.__threeRenderer;
    return r ? { drawCalls: r.info.render.calls, triangles: r.info.render.triangles, programs: r.info.programs.length } : null;
  });

  // Scroll to R3 (dress code, candelabras lit)
  await page.evaluate(() => {
    const r3 = document.querySelector('[data-scene="R3"]');
    if (r3) r3.scrollIntoView({ behavior: 'instant' });
  });
  await page.waitForTimeout(1200);
  await page.screenshot({ path: path.join(screenshotDir, 'verified_redroom_r3_1440x900.png') });
  console.log('Captured verified_redroom_r3_1440x900.png');

  // Scroll to R4 (invitation tray on table)
  await page.evaluate(() => {
    const r4 = document.querySelector('[data-scene="R4"]');
    if (r4) r4.scrollIntoView({ behavior: 'instant' });
  });
  await page.waitForTimeout(1200);
  await page.screenshot({ path: path.join(screenshotDir, 'verified_redroom_r4_1440x900.png') });
  console.log('Captured verified_redroom_r4_1440x900.png');

  // C. Diwali D1
  await page.goto('http://localhost:3000/diwali?skipLoader=1', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2500); // Wait for title card to finish
  await page.screenshot({ path: path.join(screenshotDir, 'verified_diwali_d1_1440x900.png') });
  console.log('Captured verified_diwali_d1_1440x900.png');

  renderStats['Diwali_Desktop'] = await page.evaluate(() => {
    const r = window.__threeRenderer;
    return r ? { drawCalls: r.info.render.calls, triangles: r.info.render.triangles, programs: r.info.programs.length } : null;
  });

  // Scroll to D2 (night sky & fireworks)
  await page.evaluate(() => {
    const d2 = document.querySelector('[data-scene="D2"]');
    if (d2) d2.scrollIntoView({ behavior: 'instant' });
  });
  await page.waitForTimeout(1200);
  await page.screenshot({ path: path.join(screenshotDir, 'verified_diwali_d2_1440x900.png') });
  console.log('Captured verified_diwali_d2_1440x900.png');

  await desktopContext.close();

  // 2. Mobile Verification (390x844)
  console.log('\n--- Mobile Verification (390x844) ---');
  const mobileContext = await browser.newContext({
    viewport: { width: 390, height: 844 },
    hasTouch: true,
    isMobile: true,
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
  });
  const mPage = await mobileContext.newPage();

  // Home H1 Mobile
  await mPage.goto('http://localhost:3000/?skipLoader=1', { waitUntil: 'networkidle' });
  await mPage.waitForTimeout(1500);
  await mPage.screenshot({ path: path.join(screenshotDir, 'verified_home_h1_390x844.png') });
  console.log('Captured verified_home_h1_390x844.png');

  renderStats['Home_Mobile'] = await mPage.evaluate(() => {
    const r = window.__threeRenderer;
    return r ? { drawCalls: r.info.render.calls, triangles: r.info.render.triangles, programs: r.info.programs.length } : null;
  });

  // Home H5 Mobile
  await mPage.evaluate(() => {
    const h5 = document.querySelector('[data-scene="H5"]');
    if (h5) h5.scrollIntoView({ behavior: 'instant' });
  });
  await mPage.waitForTimeout(1000);
  await mPage.screenshot({ path: path.join(screenshotDir, 'verified_home_h5_390x844.png') });
  console.log('Captured verified_home_h5_390x844.png');

  // Red Room R1 Mobile
  await mPage.goto('http://localhost:3000/the-red-room?skipLoader=1', { waitUntil: 'networkidle' });
  await mPage.waitForTimeout(1800);
  await mPage.screenshot({ path: path.join(screenshotDir, 'verified_redroom_r1_390x844.png') });
  console.log('Captured verified_redroom_r1_390x844.png');

  renderStats['RedRoom_Mobile'] = await mPage.evaluate(() => {
    const r = window.__threeRenderer;
    return r ? { drawCalls: r.info.render.calls, triangles: r.info.render.triangles, programs: r.info.programs.length } : null;
  });

  // Red Room R3 Mobile
  await mPage.evaluate(() => {
    const r3 = document.querySelector('[data-scene="R3"]');
    if (r3) r3.scrollIntoView({ behavior: 'instant' });
  });
  await mPage.waitForTimeout(1200);
  await mPage.screenshot({ path: path.join(screenshotDir, 'verified_redroom_r3_390x844.png') });
  console.log('Captured verified_redroom_r3_390x844.png');

  // Red Room R4 Mobile
  await mPage.evaluate(() => {
    const r4 = document.querySelector('[data-scene="R4"]');
    if (r4) r4.scrollIntoView({ behavior: 'instant' });
  });
  await mPage.waitForTimeout(1200);
  await mPage.screenshot({ path: path.join(screenshotDir, 'verified_redroom_r4_390x844.png') });
  console.log('Captured verified_redroom_r4_390x844.png');

  // Diwali D1 Mobile
  await mPage.goto('http://localhost:3000/diwali?skipLoader=1', { waitUntil: 'networkidle' });
  await mPage.waitForTimeout(2500);
  await mPage.screenshot({ path: path.join(screenshotDir, 'verified_diwali_d1_390x844.png') });
  console.log('Captured verified_diwali_d1_390x844.png');

  renderStats['Diwali_Mobile'] = await mPage.evaluate(() => {
    const r = window.__threeRenderer;
    return r ? { drawCalls: r.info.render.calls, triangles: r.info.render.triangles, programs: r.info.programs.length } : null;
  });

  // Diwali D2 Mobile
  await mPage.evaluate(() => {
    const d2 = document.querySelector('[data-scene="D2"]');
    if (d2) d2.scrollIntoView({ behavior: 'instant' });
  });
  await mPage.waitForTimeout(1200);
  await mPage.screenshot({ path: path.join(screenshotDir, 'verified_diwali_d2_390x844.png') });
  console.log('Captured verified_diwali_d2_390x844.png');

  await mobileContext.close();
  await browser.close();

  console.log('\n--- Render Statistics Summary ---');
  console.table(renderStats);
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
