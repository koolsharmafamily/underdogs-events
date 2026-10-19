import { chromium } from 'playwright';
import { spawn } from 'node:child_process';
import path from 'node:path';

const artifactsDir = 'C:/Users/kulvi/.gemini/antigravity/brain/c6856244-cbb4-4502-98ab-93f5039574fa';

async function waitForServer(url, timeoutMs = 15000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(url);
      if (res.ok || res.status === 200 || res.status === 304) return true;
    } catch {
      await new Promise((r) => setTimeout(r, 400));
    }
  }
  return false;
}

async function run() {
  const PORT = 3005;
  console.log(`--- Step 1: Starting Next.js Production Server on Port ${PORT} ---`);
  const server = spawn('node', ['./node_modules/next/dist/bin/next', 'start', '-p', String(PORT)], {
    cwd: process.cwd(),
    stdio: 'inherit',
    env: { ...process.env, PORT: String(PORT) }
  });

  try {
    const isUp = await waitForServer(`http://localhost:${PORT}`, 15000);
    if (!isUp) {
      throw new Error('Server failed to start within timeout');
    }
    console.log('Next.js server is UP!');

    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({
      viewport: { width: 390, height: 844 },
      deviceScaleFactor: 3,
      isMobile: true,
      hasTouch: true,
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Mobile/15E148 Safari/604.1'
    });

    const page = await context.newPage();

    console.log('--- Step 2: Navigate to Home (/) ---');
    await page.goto(`http://localhost:${PORT}`, { waitUntil: 'networkidle' });
    // Wait for the DomLoader to exit
    await page.waitForTimeout(2500);

    // 1. Home screen screenshot showing bottom tab bar [Home] [MR. DOG] [Events]
    await page.screenshot({ path: path.join(artifactsDir, 'mobile_tab_1_home.png') });
    console.log('Captured mobile_tab_1_home.png');

    console.log('--- Step 3: Tap Center Mr. Dog Tab ---');
    const mrDogTab = page.locator('nav[aria-label="Primary navigation"] a[href="/mr-dog"]').first();
    await mrDogTab.click();
    await page.waitForTimeout(1200);

    console.log('Current URL:', page.url());

    // 2. Mr. Dog dedicated section screen with bottom tab bar active and initial question cards
    await page.screenshot({ path: path.join(artifactsDir, 'mobile_tab_2_mrdog_section.png') });
    console.log('Captured mobile_tab_2_mrdog_section.png');

    // Verify elements
    const topBarTitle = await page.locator('header[aria-label="Mobile App Header"]').innerText();
    console.log('Top bar text:', topBarTitle);

    const textarea = page.locator('textarea:visible').first();
    const fontSize = await textarea.evaluate((el) => window.getComputedStyle(el).fontSize);
    console.log('Textarea computed font-size:', fontSize);

    console.log('--- Step 4: Click Typing Box / Focus Input & Emulate Virtual Keyboard ---');
    await textarea.click();
    await textarea.focus();
    await page.waitForTimeout(300);

    // Check scale before/during focus
    const viewportScale = await page.evaluate(() => window.visualViewport ? window.visualViewport.scale : 1);
    console.log('Visual viewport scale on focus:', viewportScale);

    // Emulate iOS keyboard by setting visualViewport height to 508px (844 - 336)
    await page.evaluate(() => {
      if (window.visualViewport) {
        Object.defineProperty(window.visualViewport, 'height', { value: 508, configurable: true });
        window.visualViewport.dispatchEvent(new Event('resize'));
      }
    });
    await page.waitForTimeout(400);

    // 3. Screenshot with keyboard open: composer directly above keyboard, messages list adjusted, header visible
    await page.screenshot({ path: path.join(artifactsDir, 'mobile_tab_2_mrdog_keyboard_open.png') });
    console.log('Captured mobile_tab_2_mrdog_keyboard_open.png');

    console.log('--- Step 5: Type Question & Tap Send ---');
    await textarea.fill('What is Underdogs?');
    const sendBtn = page.locator('button[aria-label="Send message"]:visible').first();
    await sendBtn.click();
    await page.waitForTimeout(2000);

    // 4. Screenshot with replied chat
    await page.screenshot({ path: path.join(artifactsDir, 'mobile_tab_2_mrdog_replied.png') });
    console.log('Captured mobile_tab_2_mrdog_replied.png');

    console.log('--- Step 6: Dismiss Keyboard & Verify Bottom Tab Bar Slides Back In ---');
    await page.evaluate(() => {
      if (window.visualViewport) {
        Object.defineProperty(window.visualViewport, 'height', { value: 844, configurable: true });
        window.visualViewport.dispatchEvent(new Event('resize'));
      }
    });
    await page.waitForTimeout(400);

    // 5. Screenshot after keyboard closed
    await page.screenshot({ path: path.join(artifactsDir, 'mobile_tab_2_mrdog_keyboard_closed.png') });
    console.log('Captured mobile_tab_2_mrdog_keyboard_closed.png');

    console.log('--- Step 7: Tap Events Tab ---');
    const eventsTab = page.locator('nav[aria-label="Primary navigation"] a[href="/events"]').first();
    await eventsTab.click();
    await page.waitForTimeout(1200);
    console.log('Events URL:', page.url());

    // 6. Screenshot of Events tab
    await page.screenshot({ path: path.join(artifactsDir, 'mobile_tab_3_events.png') });
    console.log('Captured mobile_tab_3_events.png');

    console.log('--- Step 8: Tap Home Tab from Events ---');
    const homeTab = page.locator('nav[aria-label="Primary navigation"] a[href="/"]').first();
    await homeTab.click();
    await page.waitForTimeout(1200);
    console.log('Home URL:', page.url());

    // 7. Screenshot returning to Home
    await page.screenshot({ path: path.join(artifactsDir, 'mobile_tab_return_home.png') });
    console.log('Captured mobile_tab_return_home.png');

    console.log('--- Step 9: Desktop Viewport Check (1280x800) ---');
    const desktopPage = await context.newPage();
    await desktopPage.setViewportSize({ width: 1280, height: 800 });
    await desktopPage.goto(`http://localhost:${PORT}/mr-dog`, { waitUntil: 'networkidle' });
    await desktopPage.waitForTimeout(1200);

    // 8. Desktop dedicated concierge page
    await desktopPage.screenshot({ path: path.join(artifactsDir, 'desktop_mrdog_concierge_page.png') });
    console.log('Captured desktop_mrdog_concierge_page.png');

    await browser.close();
    console.log('All verification steps completed successfully!');
  } finally {
    server.kill('SIGTERM');
  }
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
