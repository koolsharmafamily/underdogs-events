import { chromium } from "playwright";
import fs from "fs";
import path from "path";

const outDir = "C:/Users/kulvi/.gemini/antigravity/brain/c6856244-cbb4-4502-98ab-93f5039574fa";

async function verify() {
  console.log("=== STARTING PLAYWRIGHT VERIFICATION FOR MR. DOG PARTY COIN ===");

  const browser = await chromium.launch({
    headless: true,
    args: ["--enable-webgl", "--use-gl=angle", "--use-angle=swiftshader"],
  });

  // Mobile Context: iPhone 14 Pro
  const mobileContext = await browser.newContext({
    viewport: { width: 393, height: 852 },
    deviceScaleFactor: 3,
    isMobile: true,
    hasTouch: true,
    userAgent:
      "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1",
  });

  const page = await mobileContext.newPage();

  // Pre-seed storage so loader is skipped
  await page.addInitScript(() => {
    sessionStorage.setItem("underdogs-loader-seen", "1");
    sessionStorage.setItem("underdogs-dhamaaka-clapper-seen", "1");
  });

  // 1. Home Page Tab Bar with Party Coin
  console.log("1. Navigating to Home...");
  await page.goto("http://localhost:3006/", { waitUntil: "networkidle" });
  await page.waitForTimeout(1500);

  await page.screenshot({
    path: path.join(outDir, "mobile_tabbar_party_coin.png"),
    fullPage: false,
  });
  console.log("Captured mobile_tabbar_party_coin.png");

  // Also capture close-up of the tab bar
  const nav = await page.$('nav[aria-label="Primary navigation"]');
  if (nav) {
    await nav.screenshot({
      path: path.join(outDir, "mobile_tabbar_closeup.png"),
    });
    console.log("Captured mobile_tabbar_closeup.png");
  }

  // 2. Click Mr. Dog center tab button
  console.log("2. Clicking Mr. Dog Party Coin tab button...");
  const mrDogBtn = await page.$('a[href="/mr-dog"]');
  if (mrDogBtn) {
    await mrDogBtn.click();
    await page.waitForTimeout(1500);
  }

  console.log("Current URL:", page.url());
  await page.screenshot({
    path: path.join(outDir, "mobile_mrdog_screen_with_party_coin.png"),
    fullPage: false,
  });
  console.log("Captured mobile_mrdog_screen_with_party_coin.png");

  // 3. Desktop view test
  const desktopContext = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 2,
  });
  const dPage = await desktopContext.newPage();
  await dPage.addInitScript(() => {
    sessionStorage.setItem("underdogs-loader-seen", "1");
  });

  console.log("3. Navigating to Desktop /mr-dog...");
  await dPage.goto("http://localhost:3006/mr-dog", { waitUntil: "networkidle" });
  await dPage.waitForTimeout(1500);
  await dPage.screenshot({
    path: path.join(outDir, "desktop_mrdog_party_coin.png"),
    fullPage: false,
  });
  console.log("Captured desktop_mrdog_party_coin.png");

  await browser.close();
  console.log("=== VERIFICATION COMPLETE ===");
}

verify().catch(console.error);
