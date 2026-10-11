import { chromium } from 'playwright';

async function verifyPhase1() {
  console.log('=== PHASE 1 ACCEPTANCE CRITERIA VERIFICATION ===\n');

  const browser = await chromium.launch({ headless: true });

  // 1. Desktop Test: 1440x900
  console.log('--- Testing Desktop (1440x900, Tier 3) ---');
  const desktopPage = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  
  const consoleErrors = [];
  desktopPage.on('pageerror', (err) => consoleErrors.push(err.message));

  await desktopPage.goto('http://localhost:3000/', { waitUntil: 'networkidle' });
  await desktopPage.waitForTimeout(1000);

  // Fast forward loader
  await desktopPage.keyboard.press('Space');
  await desktopPage.waitForTimeout(600);

  // Measure FPS over active scroll
  const fpsResult = await desktopPage.evaluate(async () => {
    return new Promise((resolve) => {
      const deltas = [];
      let lastTime = performance.now();
      let frames = 0;

      const step = (time) => {
        const dt = time - lastTime;
        lastTime = time;
        deltas.push(dt);
        frames++;

        // Simulate active smooth scroll
        if (window.__lenis) {
          window.__lenis.scrollTo(frames * 40, { immediate: true });
        }

        if (frames < 120) {
          requestAnimationFrame(step);
        } else {
          const avgDt = deltas.slice(10).reduce((a, b) => a + b, 0) / (deltas.length - 10);
          const fps = 1000 / avgDt;
          const minFps = 1000 / Math.max(...deltas.slice(10));
          resolve({ avgFps: fps, minFps });
        }
      };

      requestAnimationFrame(step);
    });
  });

  console.log(`Desktop FPS during active scroll: avg ${fpsResult.avgFps.toFixed(1)} fps, min ${fpsResult.minFps.toFixed(1)} fps`);

  // Verify camera movement & reversibility
  const cameraScrollCheck = await desktopPage.evaluate(async () => {
    const lenis = window.__lenis;
    const scrollMax = document.documentElement.scrollHeight - window.innerHeight;
    
    // Check forward scroll
    lenis.scrollTo(scrollMax * 0.25, { immediate: true });
    await new Promise((r) => requestAnimationFrame(r));
    const p25 = window.__frame.dampedProgress.H1 ?? window.__frame.progress.H1;

    lenis.scrollTo(scrollMax * 0.75, { immediate: true });
    await new Promise((r) => requestAnimationFrame(r));
    const p75 = window.__frame.dampedProgress.H4 ?? window.__frame.progress.H4;

    // Check reverse scroll
    lenis.scrollTo(scrollMax * 0.1, { immediate: true });
    await new Promise((r) => requestAnimationFrame(r));
    const p10 = window.__frame.dampedProgress.H1 ?? window.__frame.progress.H1;

    return { p25, p75, p10 };
  });

  console.log('Scroll progress & reversibility check:', cameraScrollCheck);

  await desktopPage.close();

  // 2. Mobile Emulation Test: 390x844
  console.log('\n--- Testing Mobile Emulation (390x844, Tier 1) ---');
  const mobileContext = await browser.newContext({
    viewport: { width: 390, height: 844 },
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
    isMobile: true,
    hasTouch: true,
  });
  const mobilePage = await mobileContext.newPage();
  await mobilePage.goto('http://localhost:3000/the-red-room', { waitUntil: 'networkidle' });
  await mobilePage.waitForTimeout(1000);

  const mobileFpsResult = await mobilePage.evaluate(async () => {
    return new Promise((resolve) => {
      const deltas = [];
      let lastTime = performance.now();
      let frames = 0;

      const step = (time) => {
        const dt = time - lastTime;
        lastTime = time;
        deltas.push(dt);
        frames++;

        if (window.__lenis) {
          window.__lenis.scrollTo(frames * 30, { immediate: true });
        }

        if (frames < 90) {
          requestAnimationFrame(step);
        } else {
          const avgDt = deltas.slice(10).reduce((a, b) => a + b, 0) / (deltas.length - 10);
          const fps = 1000 / avgDt;
          const minFps = 1000 / Math.max(...deltas.slice(10));
          resolve({ avgFps: fps, minFps });
        }
      };

      requestAnimationFrame(step);
    });
  });

  console.log(`Mobile FPS during active scroll: avg ${mobileFpsResult.avgFps.toFixed(1)} fps, min ${mobileFpsResult.minFps.toFixed(1)} fps`);

  await mobilePage.close();
  await browser.close();

  console.log('\nConsole errors during entire run:', consoleErrors);
  console.log('\n=== VERIFICATION COMPLETE ===');
}

verifyPhase1().catch(console.error);
