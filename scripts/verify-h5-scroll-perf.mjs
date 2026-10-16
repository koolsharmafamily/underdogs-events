import { chromium } from "playwright";

async function run() {
  const browser = await chromium.launch({
    headless: true,
    args: ["--enable-webgl", "--use-gl=angle", "--use-angle=swiftshader"],
  });

  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.addInitScript(() => {
    sessionStorage.setItem("underdogs-loader-seen", "1");
  });

  await page.goto("http://localhost:3000/", { waitUntil: "networkidle" });
  await page.waitForTimeout(2000);

  // Monitor frame delta times during smooth scroll from top to H5
  const perfResult = await page.evaluate(async () => {
    const frameTimes = [];
    let lastTime = performance.now();
    let isTracking = true;

    function recordFrame() {
      if (!isTracking) return;
      const now = performance.now();
      frameTimes.push(now - lastTime);
      lastTime = now;
      requestAnimationFrame(recordFrame);
    }
    requestAnimationFrame(recordFrame);

    // Scroll down over 2.5 seconds
    const totalScroll = document.body.scrollHeight;
    const startTime = performance.now();
    const duration = 2500;

    await new Promise((resolve) => {
      function step() {
        const elapsed = performance.now() - startTime;
        const progress = Math.min(1, elapsed / duration);
        window.scrollTo(0, progress * (totalScroll * 0.7));
        if (progress < 1) {
          requestAnimationFrame(step);
        } else {
          isTracking = false;
          resolve();
        }
      }
      requestAnimationFrame(step);
    });

    const maxFrameTime = Math.max(...frameTimes.slice(10));
    const avgFrameTime = frameTimes.slice(10).reduce((a, b) => a + b, 0) / (frameTimes.length - 10);
    const longFrames = frameTimes.filter((t) => t > 50).length;

    return {
      totalFrames: frameTimes.length,
      maxFrameTime: maxFrameTime.toFixed(2),
      avgFrameTime: avgFrameTime.toFixed(2),
      longFrames,
    };
  });

  console.log("Performance Result:", perfResult);
  await browser.close();
}

run().catch(console.error);
