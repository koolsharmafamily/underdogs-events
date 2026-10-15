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

  // 1. Mobile Home
  console.log("Capturing Mobile Home...");
  const pageHome = await browser.newPage({
    viewport: { width: 390, height: 844 },
    userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 16_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.5 Mobile/15E148 Safari/604.1",
  });
  await pageHome.addInitScript(() => {
    sessionStorage.setItem("underdogs-loader-seen", "1");
  });
  await pageHome.goto("http://localhost:3000/", { waitUntil: "domcontentloaded" });
  await pageHome.waitForTimeout(1500);
  await pageHome.screenshot({ path: path.join(outDir, "mobile_nav_docked_home.png") });
  await pageHome.close();
  console.log("Saved mobile_nav_docked_home.png");

  // 2. Mobile Events
  console.log("Capturing Mobile Events...");
  const pageEvents = await browser.newPage({
    viewport: { width: 390, height: 844 },
    userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 16_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.5 Mobile/15E148 Safari/604.1",
  });
  await pageEvents.addInitScript(() => {
    sessionStorage.setItem("underdogs-loader-seen", "1");
  });
  await pageEvents.goto("http://localhost:3000/events", { waitUntil: "domcontentloaded" });
  await pageEvents.waitForTimeout(1500);
  await pageEvents.screenshot({ path: path.join(outDir, "mobile_nav_docked_events.png") });
  await pageEvents.close();
  console.log("Saved mobile_nav_docked_events.png");

  // 3. Mobile Diwali
  console.log("Capturing Mobile Diwali...");
  const pageDiwali = await browser.newPage({
    viewport: { width: 390, height: 844 },
    userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 16_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.5 Mobile/15E148 Safari/604.1",
  });
  await pageDiwali.addInitScript(() => {
    sessionStorage.setItem("underdogs-loader-seen", "1");
    sessionStorage.setItem("underdogs-dhamaaka-clapper-seen", "1");
  });
  await pageDiwali.goto("http://localhost:3000/diwali", { waitUntil: "domcontentloaded" });
  await pageDiwali.waitForTimeout(1000);
  await pageDiwali.mouse.click(195, 420);
  await pageDiwali.waitForTimeout(2000);
  await pageDiwali.screenshot({ path: path.join(outDir, "mobile_nav_docked_diwali.png") });
  await pageDiwali.close();
  console.log("Saved mobile_nav_docked_diwali.png");

  // 4. Mobile Red Room
  console.log("Capturing Mobile Red Room...");
  const pageRedRoom = await browser.newPage({
    viewport: { width: 390, height: 844 },
    userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 16_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.5 Mobile/15E148 Safari/604.1",
  });
  await pageRedRoom.addInitScript(() => {
    sessionStorage.setItem("underdogs-loader-seen", "1");
  });
  await pageRedRoom.goto("http://localhost:3000/the-red-room", { waitUntil: "domcontentloaded" });
  await pageRedRoom.waitForTimeout(2000);
  await pageRedRoom.screenshot({ path: path.join(outDir, "mobile_nav_docked_redroom.png") });
  await pageRedRoom.close();
  console.log("Saved mobile_nav_docked_redroom.png");

  // 5. Desktop check (1440x900)
  console.log("Capturing Desktop...");
  const desktopPage = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await desktopPage.addInitScript(() => {
    sessionStorage.setItem("underdogs-loader-seen", "1");
  });
  await desktopPage.goto("http://localhost:3000/", { waitUntil: "domcontentloaded" });
  await desktopPage.waitForTimeout(1500);
  await desktopPage.screenshot({ path: path.join(outDir, "desktop_nav_untouched.png") });
  await desktopPage.close();
  console.log("Saved desktop_nav_untouched.png");

  await browser.close();
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
