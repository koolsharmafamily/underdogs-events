import { chromium } from "playwright";
import fs from "fs";
import path from "path";

const outDir = "C:/Users/kulvi/.gemini/antigravity/brain/c6856244-cbb4-4502-98ab-93f5039574fa/screenshots";
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

async function run() {
  const browser = await chromium.launch({
    headless: true,
    args: ["--enable-webgl", "--use-gl=angle", "--use-angle=swiftshader"],
  });

  const consoleErrors = [];

  // Helper to scroll to H5
  async function scrollToH5(page) {
    await page.evaluate(() => {
      const h5 = document.querySelector('section[data-scene="H5"]');
      if (h5) {
        h5.scrollIntoView({ behavior: "instant" });
      }
    });
    await page.waitForTimeout(1500);
  }

  // 1. Desktop 1440px
  console.log("1. Desktop 1440px...");
  const page1440 = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  page1440.on("console", (msg) => {
    if (msg.type() === "error") consoleErrors.push(`[1440] ${msg.text()}`);
  });
  await page1440.addInitScript(() => {
    sessionStorage.setItem("underdogs-loader-seen", "1");
  });
  await page1440.goto("http://localhost:3000/", { waitUntil: "networkidle" });
  await page1440.waitForTimeout(2000);
  await scrollToH5(page1440);
  await page1440.screenshot({ path: path.join(outDir, "doors_blend_1440px.png") });

  // 1b. Hover Red Room Door
  console.log("1b. Hover Red Room Door...");
  await page1440.hover('[data-door-caption="red"]');
  await page1440.waitForTimeout(800);
  await page1440.screenshot({ path: path.join(outDir, "doors_hover_redroom.png") });

  // 1c. Hover Diwali Door
  console.log("1c. Hover Diwali Door...");
  await page1440.hover('[data-door-caption="diwali"]');
  await page1440.waitForTimeout(800);
  await page1440.screenshot({ path: path.join(outDir, "doors_hover_diwali.png") });

  // 1d. Open Official Flyer Lightbox (Diwali)
  console.log("1d. Open Diwali Lightbox...");
  await page1440.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('section[data-scene="H5"] button'));
    const diwaliBtn = btns.find((b) => b.textContent && b.textContent.includes("View official flyer"));
    if (diwaliBtn) {
      // Find the second one (Diwali)
      const matches = btns.filter((b) => b.textContent && b.textContent.includes("View official flyer"));
      if (matches[1]) matches[1].click();
      else diwaliBtn.click();
    }
  });
  await page1440.waitForTimeout(800);
  await page1440.screenshot({ path: path.join(outDir, "doors_lightbox_diwali.png") });
  await page1440.keyboard.press("Escape");
  await page1440.waitForTimeout(500);

  // 1e. Open Official Flyer Lightbox (Red Room)
  console.log("1e. Open Red Room Lightbox...");
  await page1440.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('section[data-scene="H5"] button'));
    const matches = btns.filter((b) => b.textContent && b.textContent.includes("View official flyer"));
    if (matches[0]) matches[0].click();
  });
  await page1440.waitForTimeout(800);
  await page1440.screenshot({ path: path.join(outDir, "doors_lightbox_redroom.png") });
  await page1440.keyboard.press("Escape");
  await page1440.waitForTimeout(500);
  await page1440.close();

  // 2. Landscape / Small Desktop 1024px
  console.log("2. 1024px Breakpoint...");
  const page1024 = await browser.newPage({ viewport: { width: 1024, height: 768 } });
  page1024.on("console", (msg) => {
    if (msg.type() === "error") consoleErrors.push(`[1024] ${msg.text()}`);
  });
  await page1024.addInitScript(() => {
    sessionStorage.setItem("underdogs-loader-seen", "1");
  });
  await page1024.goto("http://localhost:3000/", { waitUntil: "networkidle" });
  await page1024.waitForTimeout(2000);
  await scrollToH5(page1024);
  await page1024.screenshot({ path: path.join(outDir, "doors_blend_1024px.png") });
  await page1024.close();

  // 3. Tablet 768px
  console.log("3. 768px Breakpoint...");
  const page768 = await browser.newPage({ viewport: { width: 768, height: 1024 } });
  page768.on("console", (msg) => {
    if (msg.type() === "error") consoleErrors.push(`[768] ${msg.text()}`);
  });
  await page768.addInitScript(() => {
    sessionStorage.setItem("underdogs-loader-seen", "1");
  });
  await page768.goto("http://localhost:3000/", { waitUntil: "networkidle" });
  await page768.waitForTimeout(2000);
  await scrollToH5(page768);
  await page768.screenshot({ path: path.join(outDir, "doors_blend_768px.png") });
  await page768.close();

  // 4. Mobile 390px
  console.log("4. Mobile 390px...");
  const page390 = await browser.newPage({
    viewport: { width: 390, height: 844 },
    userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148",
  });
  page390.on("console", (msg) => {
    if (msg.type() === "error") consoleErrors.push(`[390] ${msg.text()}`);
  });
  await page390.addInitScript(() => {
    sessionStorage.setItem("underdogs-loader-seen", "1");
  });
  await page390.goto("http://localhost:3000/", { waitUntil: "networkidle" });
  await page390.waitForTimeout(2000);
  // Scroll down to "This season" section
  await page390.evaluate(() => {
    window.scrollTo(0, 1100);
  });
  await page390.waitForTimeout(1000);
  await page390.screenshot({ path: path.join(outDir, "doors_blend_390px_feed.png") });

  // 4b. Mobile Lightbox opened
  console.log("4b. Mobile Lightbox opened...");
  await page390.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const match = btns.find((b) => b.textContent && b.textContent.includes("View official flyer"));
    if (match) match.click();
  });
  await page390.waitForTimeout(800);
  await page390.screenshot({ path: path.join(outDir, "doors_lightbox_390px.png") });
  await page390.keyboard.press("Escape");
  await page390.waitForTimeout(500);
  await page390.close();

  // 5. Motion OFF
  console.log("5. Motion OFF...");
  const pageMotionOff = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await pageMotionOff.addInitScript(() => {
    sessionStorage.setItem("underdogs-loader-seen", "1");
    localStorage.setItem("underdogs-motion-enabled", "false");
  });
  await pageMotionOff.goto("http://localhost:3000/", { waitUntil: "networkidle" });
  await pageMotionOff.waitForTimeout(2000);
  await scrollToH5(pageMotionOff);
  await pageMotionOff.screenshot({ path: path.join(outDir, "doors_blend_motion_off.png") });
  await pageMotionOff.close();

  // 6. T1 Fallback
  console.log("6. T1 Fallback...");
  const pageT1 = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await pageT1.addInitScript(() => {
    sessionStorage.setItem("underdogs-loader-seen", "1");
  });
  await pageT1.goto("http://localhost:3000/", { waitUntil: "networkidle" });
  await pageT1.waitForTimeout(1000);
  await pageT1.evaluate(() => {
    if (window.__store) {
      window.__store.getState().setTier("T1");
    }
  });
  await scrollToH5(pageT1);
  await pageT1.screenshot({ path: path.join(outDir, "doors_blend_t1_fallback.png") });
  await pageT1.close();

  await browser.close();

  console.log("Console errors encountered:", consoleErrors);
  console.log("Captures completed successfully!");
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
