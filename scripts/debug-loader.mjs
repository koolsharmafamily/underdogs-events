import { chromium } from 'playwright';

async function main() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', err => console.log('PAGE ERROR:', err));
  await page.goto('http://localhost:3000');
  for (let i = 0; i < 5; i++) {
    await page.waitForTimeout(1000);
    const info = await page.evaluate(() => {
      const statusEl = document.querySelector('[role="status"]')?.textContent;
      const progressText = document.querySelector('.tabular-nums')?.textContent;
      const loaderVisible = !!document.querySelector('.tabular-nums');
      return { statusEl, progressText, loaderVisible };
    });
    console.log(`[${i}s] Info:`, info);
  }
  await browser.close();
}

main().catch(console.error);
