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

  // 1. Desktop
  console.log("Testing Desktop...");
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  
  // Set seen loader & clapper in sessionStorage before nav
  await page.addInitScript(() => {
    sessionStorage.setItem("underdogs-loader-seen", "1");
    sessionStorage.setItem("underdogs-dhamaaka-clapper-seen", "1");
  });

  await page.goto("http://localhost:3000/diwali", { waitUntil: "networkidle" });
  await page.waitForTimeout(1000);

  // Dismiss clapperboard opener via click and pointerdown
  await page.evaluate(() => {
    window.dispatchEvent(new PointerEvent("pointerdown"));
    const opener = document.querySelector('[aria-label*="opener"]') || document.querySelector('[role="status"]');
    if (opener) opener.click();
  });
  await page.mouse.click(720, 450);

  await page.waitForTimeout(3000); // Allow reveal transition and WebGL 3D badge render
  await page.screenshot({ path: path.join(outDir, "diwali_prominent_badge_desktop.png") });
  console.log("Desktop screenshot saved.");

  // 2. Mobile
  console.log("Testing Mobile...");
  const mobilePage = await browser.newPage({
    viewport: { width: 390, height: 844 },
    userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 16_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.5 Mobile/15E148 Safari/604.1",
  });

  await mobilePage.addInitScript(() => {
    sessionStorage.setItem("underdogs-loader-seen", "1");
    sessionStorage.setItem("underdogs-dhamaaka-clapper-seen", "1");
  });

  await mobilePage.goto("http://localhost:3000/diwali", { waitUntil: "networkidle" });
  await mobilePage.waitForTimeout(1000);

  await mobilePage.evaluate(() => {
    window.dispatchEvent(new PointerEvent("pointerdown"));
    const opener = document.querySelector('[aria-label*="opener"]') || document.querySelector('[role="status"]');
    if (opener) opener.click();
  });
  await mobilePage.mouse.click(195, 420);

  await mobilePage.waitForTimeout(3000);
  await mobilePage.screenshot({ path: path.join(outDir, "diwali_prominent_badge_mobile.png") });
  console.log("Mobile screenshot saved.");

  await browser.close();
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
