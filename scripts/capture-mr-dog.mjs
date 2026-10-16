import { chromium } from "playwright";
import fs from "fs";
import path from "path";

const outDir = "C:/Users/kulvi/.gemini/antigravity/brain/c6856244-cbb4-4502-98ab-93f5039574fa/screenshots";
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

async function capture() {
  const browser = await chromium.launch({
    headless: true,
    args: ["--enable-webgl", "--use-gl=angle", "--use-angle=swiftshader"],
  });

  // ==========================================
  // 1. DESKTOP CAPTURES
  // ==========================================
  console.log("=== CAPTURING DESKTOP ===");
  const desktopContext = await browser.newContext({
    viewport: { width: 1440, height: 900 },
  });
  const page = await desktopContext.newPage();

  // Pre-seed storage so loader is skipped
  await page.addInitScript(() => {
    sessionStorage.setItem("underdogs-loader-seen", "1");
    sessionStorage.setItem("underdogs-dhamaaka-clapper-seen", "1");
  });

  // 1A. Desktop Home: Launcher & Nav Roll-link
  console.log("Desktop: Home Launcher...");
  await page.goto("http://localhost:3000/", { waitUntil: "networkidle" });
  await page.waitForTimeout(2000);
  await page.screenshot({ path: path.join(outDir, "desktop_home_launcher.png") });

  // 1B. Desktop Home: Open Panel
  console.log("Desktop: Home Panel...");
  // Click launcher or nav button
  await page.evaluate(() => {
    window.__mrDogStore = window.__mrDogStore || null;
    const btn = document.querySelector('button[aria-label*="Ask Mr. Dog"]');
    if (btn) btn.click();
  });
  await page.waitForTimeout(2000);
  await page.screenshot({ path: path.join(outDir, "desktop_home_panel.png") });

  // 1C. Desktop Red Room: Panel with Red Room Outfit
  console.log("Desktop: Red Room Panel...");
  await page.goto("http://localhost:3000/the-red-room", { waitUntil: "networkidle" });
  await page.waitForTimeout(2000);
  await page.evaluate(() => {
    const btn = document.querySelector('button[aria-label*="Ask Mr. Dog"]');
    if (btn) btn.click();
  });
  await page.waitForTimeout(2500);
  await page.screenshot({ path: path.join(outDir, "desktop_redroom_panel.png") });

  // 1D. Desktop Diwali: Panel with Diwali Outfit
  console.log("Desktop: Diwali Panel...");
  await page.goto("http://localhost:3000/diwali", { waitUntil: "networkidle" });
  await page.waitForTimeout(2000);
  // Dismiss clapperboard if present
  await page.evaluate(() => {
    window.dispatchEvent(new PointerEvent("pointerdown"));
    const opener = document.querySelector('[aria-label*="opener"]');
    if (opener) opener.click();
  });
  await page.mouse.click(720, 450);
  await page.waitForTimeout(1000);

  await page.evaluate(() => {
    const btn = document.querySelector('button[aria-label*="Ask Mr. Dog"]');
    if (btn) btn.click();
  });
  await page.waitForTimeout(2500);
  await page.screenshot({ path: path.join(outDir, "desktop_diwali_panel.png") });

  // ==========================================
  // 2. MOBILE CAPTURES
  // ==========================================
  console.log("=== CAPTURING MOBILE ===");
  const mobileContext = await browser.newContext({
    viewport: { width: 390, height: 844 },
    userAgent:
      "Mozilla/5.0 (iPhone; CPU iPhone OS 16_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.5 Mobile/15E148 Safari/604.1",
  });
  const mPage = await mobileContext.newPage();

  await mPage.addInitScript(() => {
    sessionStorage.setItem("underdogs-loader-seen", "1");
    sessionStorage.setItem("underdogs-dhamaaka-clapper-seen", "1");
  });

  // 2A. Mobile Home: Docked Tab Bar with Raised Mr. Dog Button
  console.log("Mobile: Home Tab Bar...");
  await mPage.goto("http://localhost:3000/", { waitUntil: "networkidle" });
  await mPage.waitForTimeout(2000);
  await mPage.screenshot({ path: path.join(outDir, "mobile_home_tabbar.png") });

  // 2B. Mobile Sheet: Open Chat Sheet on Home
  console.log("Mobile: Home Sheet...");
  await mPage.evaluate(() => {
    const btn = document.querySelector('button[aria-label*="Mr. Dog"]');
    if (btn) btn.click();
  });
  await mPage.waitForTimeout(2000);
  await mPage.screenshot({ path: path.join(outDir, "mobile_home_sheet.png") });

  // 2C. Mobile Sheet: Sample Conversation
  console.log("Mobile: Conversation test...");
  // Click a quick reply chip
  await mPage.evaluate(() => {
    const chips = Array.from(document.querySelectorAll("button")).filter(b => 
      b.textContent?.includes("When is Red Room?") || 
      b.textContent?.includes("What is Underdogs?") ||
      b.textContent?.includes("Diwali timing?")
    );
    if (chips.length > 0) chips[0].click();
  });
  await mPage.waitForTimeout(3000);
  await mPage.screenshot({ path: path.join(outDir, "mobile_sheet_conversation.png") });

  // 2D. Mobile Red Room: Tab Bar & Sheet
  console.log("Mobile: Red Room Tab Bar & Sheet...");
  await mPage.goto("http://localhost:3000/the-red-room", { waitUntil: "networkidle" });
  await mPage.waitForTimeout(2000);
  await mPage.screenshot({ path: path.join(outDir, "mobile_redroom_tabbar.png") });

  await mPage.evaluate(() => {
    const btn = document.querySelector('button[aria-label*="Mr. Dog"]');
    if (btn) btn.click();
  });
  await mPage.waitForTimeout(2000);
  await mPage.screenshot({ path: path.join(outDir, "mobile_redroom_sheet.png") });

  // 2E. Mobile Diwali: Tab Bar & Sheet
  console.log("Mobile: Diwali Tab Bar & Sheet...");
  await mPage.goto("http://localhost:3000/diwali", { waitUntil: "networkidle" });
  await mPage.waitForTimeout(2000);
  await mPage.evaluate(() => {
    window.dispatchEvent(new PointerEvent("pointerdown"));
    const opener = document.querySelector('[aria-label*="opener"]');
    if (opener) opener.click();
  });
  await mPage.mouse.click(195, 422);
  await mPage.waitForTimeout(1000);
  await mPage.screenshot({ path: path.join(outDir, "mobile_diwali_tabbar.png") });

  await mPage.evaluate(() => {
    const btn = document.querySelector('button[aria-label*="Mr. Dog"]');
    if (btn) btn.click();
  });
  await mPage.waitForTimeout(2000);
  await mPage.screenshot({ path: path.join(outDir, "mobile_diwali_sheet.png") });

  console.log("=== ALL SCREENSHOTS CAPTURED SUCCESSFULLY ===");
  await browser.close();
}

capture().catch((err) => {
  console.error("Capture failed:", err);
  process.exit(1);
});
