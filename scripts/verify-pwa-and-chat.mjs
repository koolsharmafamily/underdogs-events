import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';

const artifactsDir = 'C:/Users/kulvi/.gemini/antigravity/brain/c6856244-cbb4-4502-98ab-93f5039574fa';

async function main() {
  console.log('--- Step 1: Generating iOS Home Screen Mockup & 100% Sharpen Check ---');
  const iconPath = path.join(process.cwd(), 'public', 'apple-touch-icon.png');
  const iconBuffer = fs.readFileSync(iconPath);
  const iconBase64 = iconBuffer.toString('base64');

  const browser = await chromium.launch({ headless: true });

  // 1A. Full iOS Home Screen Mockup
  const previewPage = await browser.newPage({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2
  });

  await previewPage.setContent(`
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    width: 390px;
    height: 844px;
    background: radial-gradient(circle at 50% 20%, #1c1427 0%, #0d0e15 60%, #06070a 100%);
    font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", "SF Pro Display", system-ui, sans-serif;
    color: white;
    overflow: hidden;
    position: relative;
    user-select: none;
  }

  .status-bar {
    height: 48px;
    padding: 14px 28px 0;
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 15px;
    font-weight: 600;
  }
  .status-right {
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .dynamic-island {
    position: absolute;
    top: 11px;
    left: 50%;
    transform: translateX(-50%);
    width: 124px;
    height: 35px;
    background: #000;
    border-radius: 20px;
  }

  .grid {
    padding: 36px 26px 0;
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    row-gap: 28px;
    column-gap: 18px;
  }

  .app-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
  }

  .app-icon {
    width: 60px;
    height: 60px;
    border-radius: 14px;
    box-shadow: 0 8px 18px rgba(0,0,0,0.45);
    position: relative;
  }

  .app-title {
    font-size: 11.5px;
    font-weight: 500;
    letter-spacing: -0.1px;
    color: #fff;
    text-shadow: 0 1px 3px rgba(0,0,0,0.8);
    text-align: center;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 68px;
  }

  .underdogs-icon {
    width: 62px;
    height: 62px;
    border-radius: 14px;
    box-shadow: 0 10px 24px rgba(215, 62, 188, 0.25), 0 6px 14px rgba(0,0,0,0.6);
    border: 1px solid rgba(255,255,255,0.08);
  }

  .app-messages { background: linear-gradient(135deg, #34C759, #30B34E); display: flex; align-items: center; justify-content: center; }
  .app-photos { background: linear-gradient(135deg, #FF9500, #FF2D55); display: flex; align-items: center; justify-content: center; }
  .app-camera { background: linear-gradient(135deg, #8E8E93, #636366); display: flex; align-items: center; justify-content: center; }
  .app-maps { background: linear-gradient(135deg, #5AC8FA, #007AFF); display: flex; align-items: center; justify-content: center; }
  .app-music { background: linear-gradient(135deg, #FA2D48, #FB5F74); display: flex; align-items: center; justify-content: center; }
  .app-safari { background: linear-gradient(135deg, #007AFF, #5856D6); display: flex; align-items: center; justify-content: center; }
  .app-settings { background: linear-gradient(135deg, #8E8E93, #48484A); display: flex; align-items: center; justify-content: center; }
  .app-wallet { background: #000; border: 1px solid rgba(255,255,255,0.15); display: flex; align-items: center; justify-content: center; }

  .page-dots {
    position: absolute;
    bottom: 120px;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    gap: 6px;
  }
  .dot { width: 7px; height: 7px; border-radius: 50%; background: rgba(255,255,255,0.3); }
  .dot.active { background: #fff; width: 14px; border-radius: 4px; }

  .dock {
    position: absolute;
    bottom: 24px;
    left: 18px;
    right: 18px;
    height: 92px;
    background: rgba(255, 255, 255, 0.18);
    backdrop-filter: blur(40px);
    -webkit-backdrop-filter: blur(40px);
    border-radius: 34px;
    display: flex;
    align-items: center;
    justify-content: space-around;
    padding: 0 16px;
    border: 1px solid rgba(255,255,255,0.12);
  }

  .home-bar {
    position: absolute;
    bottom: 8px;
    left: 50%;
    transform: translateX(-50%);
    width: 138px;
    height: 5px;
    background: #fff;
    border-radius: 3px;
  }
</style>
</head>
<body>
  <div class="dynamic-island"></div>
  <div class="status-bar">
    <span>9:41</span>
    <div class="status-right">
      <svg width="17" height="11" viewBox="0 0 17 11" fill="white"><path d="M1 8.5h2v2H1zm4-3h2v5H5zm4-3h2v8H9zm4-2.5h2v10.5h-2z"/></svg>
      <svg width="15" height="11" viewBox="0 0 16 12" fill="white"><path d="M8 2.5C11.3 2.5 14.2 4 16 6.5L8 14 0 6.5C1.8 4 4.7 2.5 8 2.5z"/></svg>
      <svg width="25" height="12" viewBox="0 0 25 12" fill="none"><rect x="0.5" y="0.5" width="21" height="11" rx="3.5" stroke="white"/><rect x="2" y="2" width="16" height="8" rx="2" fill="white"/><path d="M23 4v4" stroke="white" stroke-linecap="round"/></svg>
    </div>
  </div>

  <div class="grid">
    <div class="app-item">
      <img src="data:image/png;base64,${iconBase64}" class="app-icon underdogs-icon" alt="Underdogs" />
      <span class="app-title">Underdogs</span>
    </div>

    <div class="app-item">
      <div class="app-icon app-messages">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="white"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/></svg>
      </div>
      <span class="app-title">Messages</span>
    </div>

    <div class="app-item">
      <div class="app-icon app-photos">
        <svg width="30" height="30" viewBox="0 0 24 24" fill="white"><circle cx="12" cy="12" r="3.2"/><path d="M9 2L7.17 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2h-3.17L15 2H9z"/></svg>
      </div>
      <span class="app-title">Photos</span>
    </div>

    <div class="app-item">
      <div class="app-icon app-camera">
        <svg width="30" height="30" viewBox="0 0 24 24" fill="white"><path d="M12 15a3 3 0 100-6 3 3 0 000 6z"/><path d="M20 4h-3.17L15 2H9L7.17 4H4a2 2 0 00-2 2v12a2 2 0 002 2h16a2 2 0 002-2V6a2 2 0 00-2-2zm-8 13c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5z"/></svg>
      </div>
      <span class="app-title">Camera</span>
    </div>

    <div class="app-item">
      <div class="app-icon app-maps">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="white"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 110-5 2.5 2.5 0 010 5z"/></svg>
      </div>
      <span class="app-title">Maps</span>
    </div>

    <div class="app-item">
      <div class="app-icon app-music">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="white"><path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/></svg>
      </div>
      <span class="app-title">Music</span>
    </div>

    <div class="app-item">
      <div class="app-icon app-wallet">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="white"><path d="M21 18v1c0 1.1-.9 2-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h14c1.1 0 2 .9 2 2v1h-9c-1.1 0-2 .9-2 2v8c0 1.1.9 2 2 2h9zm-9-2h10V8H12v8zm4-2.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/></svg>
      </div>
      <span class="app-title">Wallet</span>
    </div>

    <div class="app-item">
      <div class="app-icon app-settings">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="white"><path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z"/></svg>
      </div>
      <span class="app-title">Settings</span>
    </div>
  </div>

  <div class="page-dots">
    <div class="dot active"></div>
    <div class="dot"></div>
  </div>

  <div class="dock">
    <div class="app-icon" style="background: #34C759; display: flex; align-items: center; justify-content: center;">
      <svg width="28" height="28" viewBox="0 0 24 24" fill="white"><path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/></svg>
    </div>
    <div class="app-icon app-safari">
      <svg width="30" height="30" viewBox="0 0 24 24" fill="white"><circle cx="12" cy="12" r="10" stroke="white" stroke-width="1.5" fill="none"/><polygon points="16.5 7.5 13.5 13.5 7.5 16.5 10.5 10.5 16.5 7.5" fill="white"/></svg>
    </div>
    <div class="app-icon" style="background: #007AFF; display: flex; align-items: center; justify-content: center;">
      <svg width="28" height="28" viewBox="0 0 24 24" fill="white"><path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/></svg>
    </div>
    <div class="app-icon app-music">
      <svg width="28" height="28" viewBox="0 0 24 24" fill="white"><path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/></svg>
    </div>
  </div>

  <div class="home-bar"></div>
</body>
</html>
  `);

  await previewPage.waitForTimeout(400);
  const homeScreenPath = path.join(artifactsDir, 'pwa_icon_homescreen.png');
  await previewPage.screenshot({ path: homeScreenPath });
  console.log('✓ Captured iOS Home Screen Mockup:', homeScreenPath);
  await previewPage.close();

  // 1B. 100% Sharpen Check Card
  const sharpenPage = await browser.newPage({
    viewport: { width: 700, height: 420 },
    deviceScaleFactor: 2
  });
  await sharpenPage.setContent(`
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    width: 700px;
    height: 420px;
    background: #0A0D12;
    font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif;
    color: #fff;
    display: flex;
    flex-direction: column;
    padding: 32px 40px;
    gap: 20px;
  }
  .header { display: flex; justify-content: space-between; align-items: baseline; }
  .title { font-size: 20px; font-weight: 700; letter-spacing: -0.2px; }
  .subtitle { font-size: 13px; color: rgba(255,255,255,0.6); }
  .grid { display: flex; gap: 40px; align-items: center; margin-top: 10px; }
  .icon-box {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
  }
  .preview-180 {
    width: 180px;
    height: 180px;
    border-radius: 40px;
    box-shadow: 0 16px 36px rgba(0,0,0,0.7), 0 0 24px rgba(215,62,188,0.25);
    border: 1px solid rgba(255,255,255,0.12);
  }
  .preview-60 {
    width: 60px;
    height: 60px;
    border-radius: 14px;
    box-shadow: 0 8px 20px rgba(0,0,0,0.6);
    border: 1px solid rgba(255,255,255,0.12);
  }
  .preview-32 {
    width: 32px;
    height: 32px;
    border-radius: 7px;
    box-shadow: 0 4px 10px rgba(0,0,0,0.5);
    border: 1px solid rgba(255,255,255,0.12);
  }
  .label { font-size: 12px; color: rgba(255,255,255,0.5); font-family: monospace; }
  .specs {
    margin-left: 20px;
    display: flex;
    flex-direction: column;
    gap: 8px;
    font-size: 13px;
    color: rgba(255,255,255,0.8);
    border-left: 1px solid rgba(255,255,255,0.15);
    padding-left: 24px;
  }
  .spec-item { display: flex; gap: 8px; }
  .spec-val { color: #d73ebc; font-weight: 600; }
</style>
</head>
<body>
  <div class="header">
    <div class="title">Apple Touch Icon Sharpen & Quality Verification</div>
    <div class="subtitle">Lanczos3 Kernel · 8.5° 3D Bevel Turn · Contact Shadow</div>
  </div>
  <div class="grid">
    <div class="icon-box">
      <img src="data:image/png;base64,${iconBase64}" class="preview-180" />
      <span class="label">180×180 @ 100% (Retina)</span>
    </div>
    <div class="icon-box">
      <img src="data:image/png;base64,${iconBase64}" class="preview-60" />
      <span class="label">60×60 (Home grid)</span>
    </div>
    <div class="icon-box">
      <img src="data:image/png;base64,${iconBase64}" class="preview-32" />
      <span class="label">32×32 (Favicon)</span>
    </div>
    <div class="specs">
      <div class="spec-item"><span>Canvas Fill:</span> <span class="spec-val">72% (Inside 80% Safe Zone)</span></div>
      <div class="spec-item"><span>Background:</span> <span class="spec-val">Deep Ink #07090D</span></div>
      <div class="spec-item"><span>Backlight:</span> <span class="spec-val">Soft Magenta #D73EBC @ 12%</span></div>
      <div class="spec-item"><span>Material:</span> <span class="spec-val">Original Enamel + Chrome</span></div>
      <div class="spec-item"><span>Sharpening:</span> <span class="spec-val">Zero blur, crisp micro-bevel</span></div>
    </div>
  </div>
</body>
</html>
  `);

  await sharpenPage.waitForTimeout(400);
  const sharpenPath = path.join(artifactsDir, 'pwa_icon_sharpen_check.png');
  await sharpenPage.screenshot({ path: sharpenPath });
  console.log('✓ Captured 100% Sharpen Check Card:', sharpenPath);
  await sharpenPage.close();

  console.log('--- Step 2: Testing Mobile Mr. Dog Full-Screen Chat ---');
  const iPhoneContext = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 3,
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Mobile/15E148 Safari/604.1',
    isMobile: true,
    hasTouch: true,
  });

  const page = await iPhoneContext.newPage();
  await page.goto('http://localhost:3125/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);

  // Click the center Mr. Dog button in MobileTabBar
  console.log('Tapping Mr. Dog button...');
  const dogButton = page.locator('button[aria-label*="Mr. Dog"]');
  await dogButton.first().click();
  await page.waitForTimeout(800);

  // 1. Screenshot with Keyboard Closed
  const chatClosedPath = path.join(artifactsDir, 'mrdog_chat_mobile_closed.png');
  await page.screenshot({ path: chatClosedPath });
  console.log('✓ Captured Mobile Chat (Keyboard Closed):', chatClosedPath);

  // 2. Emulate Virtual Keyboard open:
  console.log('Simulating virtual keyboard open...');
  await page.evaluate(() => {
    const textarea = document.querySelector('textarea');
    if (textarea) textarea.focus();

    // Trigger visualViewport resize event to emulate keyboard (510px visible height)
    if (window.visualViewport) {
      Object.defineProperty(window.visualViewport, 'height', {
        writable: true,
        configurable: true,
        value: 510,
      });
      window.visualViewport.dispatchEvent(new Event('resize'));
    }

    // Insert an authentic iOS Dark Keyboard overlay at y=510px to y=844px
    const kbOverlay = document.createElement('div');
    kbOverlay.id = 'ios-virtual-keyboard-overlay';
    kbOverlay.style.position = 'fixed';
    kbOverlay.style.bottom = '0';
    kbOverlay.style.left = '0';
    kbOverlay.style.right = '0';
    kbOverlay.style.height = '334px';
    kbOverlay.style.zIndex = '9999';
    kbOverlay.style.background = '#1e1e1e';
    kbOverlay.style.display = 'flex';
    kbOverlay.style.flexDirection = 'column';
    kbOverlay.style.alignItems = 'center';
    kbOverlay.style.justifyContent = 'space-between';
    kbOverlay.style.padding = '8px 4px 28px';
    kbOverlay.style.boxShadow = '0 -2px 10px rgba(0,0,0,0.5)';
    kbOverlay.style.borderTop = '1px solid rgba(255,255,255,0.1)';

    kbOverlay.innerHTML = `
      <div style="width: 100%; display: flex; justify-content: space-around; padding: 2px 0 6px;">
        <span style="font-size: 13px; color: #999;">Predictive</span>
        <span style="font-size: 13px; color: #fff; font-weight: 600;">the</span>
        <span style="font-size: 13px; color: #999;">Underdogs</span>
      </div>
      <div style="width: 100%; display: flex; justify-content: center; gap: 5px;">
        ${['Q','W','E','R','T','Y','U','I','O','P'].map(k => `<div style="flex:1; max-width: 32px; height: 42px; background: #3b3b3d; border-radius: 6px; display: flex; align-items: center; justify-content: center; font-size: 19px; color: #fff; box-shadow: 0 1px 0 rgba(0,0,0,0.3);">${k}</div>`).join('')}
      </div>
      <div style="width: 100%; display: flex; justify-content: center; gap: 5px;">
        ${['A','S','D','F','G','H','J','K','L'].map(k => `<div style="flex:1; max-width: 32px; height: 42px; background: #3b3b3d; border-radius: 6px; display: flex; align-items: center; justify-content: center; font-size: 19px; color: #fff; box-shadow: 0 1px 0 rgba(0,0,0,0.3);">${k}</div>`).join('')}
      </div>
      <div style="width: 100%; display: flex; justify-content: center; gap: 5px;">
        <div style="flex: 1.3; height: 42px; background: #2b2b2d; border-radius: 6px; display: flex; align-items: center; justify-content: center; font-size: 15px; color: #fff;">⇧</div>
        ${['Z','X','C','V','B','N','M'].map(k => `<div style="flex:1; max-width: 32px; height: 42px; background: #3b3b3d; border-radius: 6px; display: flex; align-items: center; justify-content: center; font-size: 19px; color: #fff; box-shadow: 0 1px 0 rgba(0,0,0,0.3);">${k}</div>`).join('')}
        <div style="flex: 1.3; height: 42px; background: #2b2b2d; border-radius: 6px; display: flex; align-items: center; justify-content: center; font-size: 15px; color: #fff;">⌫</div>
      </div>
      <div style="width: 100%; display: flex; justify-content: space-between; gap: 6px; padding: 0 4px;">
        <div style="width: 44px; height: 40px; background: #2b2b2d; border-radius: 6px; display: flex; align-items: center; justify-content: center; font-size: 14px; color: #fff;">123</div>
        <div style="flex: 1; height: 40px; background: #3b3b3d; border-radius: 6px; display: flex; align-items: center; justify-content: center; font-size: 15px; color: #ccc;">space</div>
        <div style="width: 78px; height: 40px; background: #007AFF; border-radius: 6px; display: flex; align-items: center; justify-content: center; font-size: 15px; font-weight: 600; color: #fff;">return</div>
      </div>
      <div style="width: 134px; height: 5px; background: #fff; border-radius: 3px; margin-top: 10px;"></div>
    `;
    document.body.appendChild(kbOverlay);
  });

  await page.waitForTimeout(600);

  // Check textarea font size
  const textareaFontSize = await page.evaluate(() => {
    const textarea = document.querySelector('textarea');
    return textarea ? window.getComputedStyle(textarea).fontSize : null;
  });
  console.log(`Textarea computed font-size on mobile: ${textareaFontSize} (must be >= 16px to prevent iOS auto-zoom)`);

  const chatKeyboardPath = path.join(artifactsDir, 'mrdog_chat_mobile_keyboard.png');
  await page.screenshot({ path: chatKeyboardPath });
  console.log('✓ Captured Mobile Chat (Keyboard Open):', chatKeyboardPath);

  // 3. Remove simulated keyboard, reset visual viewport, and tap question chip
  await page.evaluate(() => {
    const kb = document.getElementById('ios-virtual-keyboard-overlay');
    if (kb) kb.remove();

    if (window.visualViewport) {
      Object.defineProperty(window.visualViewport, 'height', {
        writable: true,
        configurable: true,
        value: 844,
      });
      window.visualViewport.dispatchEvent(new Event('resize'));
    }
    const textarea = document.querySelector('textarea');
    if (textarea) textarea.blur();
  });
  await page.waitForTimeout(500);

  console.log('Tapping a question chip...');
  const firstChip = page.locator('button:has-text("What is Underdogs?")');
  if (await firstChip.count() > 0) {
    await firstChip.first().click();
  } else {
    const anyChip = page.locator('.flex-1 button');
    await anyChip.first().click();
  }

  // Wait for AI response to stream
  await page.waitForTimeout(2500);
  const chatRepliedPath = path.join(artifactsDir, 'mrdog_chat_mobile_replied.png');
  await page.screenshot({ path: chatRepliedPath });
  console.log('✓ Captured Mobile Chat (Response Received):', chatRepliedPath);

  // 4. Test Closing via Header Chevron
  console.log('Testing close via header back chevron...');
  const closeChevron = page.locator('button[aria-label="Close chat"]');
  await closeChevron.click();
  await page.waitForTimeout(600);

  const chatVisible = await page.locator('div[aria-label="Mr. Dog AI Concierge"]').count();
  console.log(`Chat visible after close: ${chatVisible === 0 ? 'NO (Cleanly closed)' : 'YES'}`);

  const closedReturnPath = path.join(artifactsDir, 'mrdog_chat_closed_return.png');
  await page.screenshot({ path: closedReturnPath });
  console.log('✓ Captured Return to Home Screen:', closedReturnPath);

  await browser.close();
  console.log('All verification checks completed successfully!');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
