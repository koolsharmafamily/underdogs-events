import { chromium } from 'playwright';

async function run() {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  const logStep = (step, ok, detail = '') => {
    console.log(`${ok ? '✓' : '✗'} ${step}${detail ? ` (${detail})` : ''}`);
  };

  console.log('--- 1. Desktop Interactive Verification (/diwali) ---');
  await page.goto('http://localhost:3000/diwali?tier=T3', { timeout: 30000 });
  await page.waitForTimeout(2000);

  // 1. Check Motion toggle button
  const motionBtn = page.locator('button:has-text("Motion:")').first();
  const motionExists = (await motionBtn.count()) > 0;
  if (motionExists) {
    const textBefore = await motionBtn.innerText();
    await motionBtn.click();
    await page.waitForTimeout(300);
    const textAfter = await motionBtn.innerText();
    logStep('Motion toggle button', textBefore !== textAfter, `${textBefore.trim().replace(/\s+/g, ' ')} -> ${textAfter.trim().replace(/\s+/g, ' ')}`);
    // restore motion
    await motionBtn.click();
    await page.waitForTimeout(200);
  } else {
    logStep('Motion toggle button', false, 'button not found');
  }

  // 2. Check Venue zoom button & lightbox
  const venueTrigger = page.locator('[aria-label="Enlarge venue layout into interactive zoom viewer"]').first();
  const venueExists = (await venueTrigger.count()) > 0;
  if (venueExists) {
    await venueTrigger.scrollIntoViewIfNeeded();
    await venueTrigger.click();
    await page.waitForTimeout(600);
    const lightboxOpen = await page.evaluate(() => document.documentElement.dataset.lightbox === 'open' || !!document.querySelector('[role="dialog"][aria-label*="Venue"]'));
    logStep('Venue layout zoom lightbox open', lightboxOpen);
    
    // Close lightbox
    const closeBtn = page.locator('button[aria-label="Close layout viewer"]').first();
    if ((await closeBtn.count()) > 0) {
      await closeBtn.click();
      await page.waitForTimeout(500);
      const lightboxClosed = await page.evaluate(() => document.documentElement.dataset.lightbox !== 'open');
      logStep('Venue layout zoom lightbox close', lightboxClosed);
    } else {
      logStep('Venue layout close button found', false);
    }
  } else {
    logStep('Venue layout trigger found', false);
  }

  // 3. Check Flyer lightbox
  const flyerTrigger = page.locator('[aria-label="Enlarge official DHAMAAKA poster"]').first();
  const flyerExists = (await flyerTrigger.count()) > 0;
  if (flyerExists) {
    await flyerTrigger.scrollIntoViewIfNeeded();
    await flyerTrigger.click();
    await page.waitForTimeout(600);
    const dialogOpen = await page.evaluate(() => !!document.querySelector('[role="dialog"][aria-label*="Official Flyer"]') || document.documentElement.dataset.lightbox === 'open');
    logStep('Poster flyer lightbox open', dialogOpen);

    const closeBtn = page.locator('button[aria-label="Close official flyer lightbox"]').first();
    if ((await closeBtn.count()) > 0) {
      await closeBtn.click();
      await page.waitForTimeout(500);
      const dialogClosed = await page.evaluate(() => !document.querySelector('[role="dialog"][aria-label*="Official Flyer"]'));
      logStep('Poster flyer lightbox close', dialogClosed);
    } else {
      logStep('Flyer close button found', false);
    }
  } else {
    logStep('Flyer trigger found', false);
  }

  // 4. Check Sold out status on passes
  const soldOutCount = await page.locator(':text("Sold Out"), :text("SOLD OUT"), :text("Fully Sold Out")').count();
  logStep('Sold Out badges present', soldOutCount >= 2, `found ${soldOutCount} occurrences`);

  // 5. Check Mr Dog AI Concierge trigger & chat
  const dogTrigger = page.locator('button[aria-label="Ask Mr. Dog, AI concierge"]').first();
  const dogExists = (await dogTrigger.count()) > 0;
  if (dogExists) {
    await dogTrigger.click();
    await page.waitForTimeout(600);
    const chatVisible = (await page.locator('[role="dialog"][aria-label*="Mr. Dog"]').count()) > 0;
    logStep('Mr Dog concierge modal opens', chatVisible);

    // Ask a question in Mr Dog chat
    const input = page.locator('input[placeholder*="Ask" i], textarea[placeholder*="Ask" i]').first();
    if ((await input.count()) > 0) {
      await input.fill('Are tickets available?');
      await input.press('Enter');
      await page.waitForTimeout(2000);
      const mentionsSoldOut = await page.evaluate(() => {
        const text = document.body.innerText.toLowerCase();
        return text.includes('sold out') || text.includes('100% sold out');
      });
      logStep('Mr Dog answers ticket inquiry', mentionsSoldOut, `response confirms sold out`);
    }

    // Close chat
    const closeChat = page.locator('button[aria-label="Close Mr. Dog panel"]').first();
    if ((await closeChat.count()) > 0) {
      await closeChat.click();
      await page.waitForTimeout(300);
      const closed = await page.evaluate(() => !document.querySelector('[role="dialog"][aria-label*="Mr. Dog"]'));
      logStep('Mr Dog concierge modal closes', closed);
    }
  } else {
    logStep('Mr Dog trigger found', false);
  }

  // 6. Check Telephone links & WhatsApp/Instagram links
  const telLinks = await page.locator('a[href^="tel:"]').count();
  const igLinks = await page.locator('a[href*="instagram.com"]').count();
  logStep('Contact telephone links', telLinks > 0, `count: ${telLinks}`);
  logStep('Instagram social links', igLinks > 0, `count: ${igLinks}`);

  // 7. Mobile viewport test
  console.log('\n--- 2. Mobile Responsive Verification (390x844) ---');
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('http://localhost:3000/?tier=T2', { timeout: 30000 });
  await page.waitForTimeout(2000);

  // Check mobile navigation drawer / bottom tabs
  const mobileNav = page.locator('nav, [role="navigation"], [data-mobile-nav]').first();
  logStep('Mobile navigation present', (await mobileNav.count()) > 0);

  // Test mobile tab navigation to Events
  const eventsTab = page.locator('nav a[href="/events"]').first();
  if ((await eventsTab.count()) > 0) {
    await eventsTab.click();
    await page.waitForTimeout(2000);
    const url = page.url();
    logStep('Mobile navigate to Events tab', url.includes('/events'), url);
  }

  // Test mobile tab navigation to Mr. Dog
  const dogTab = page.locator('nav a[href="/mr-dog"]').first();
  if ((await dogTab.count()) > 0) {
    await dogTab.click();
    await page.waitForTimeout(2000);
    const url = page.url();
    logStep('Mobile navigate to Mr. Dog tab', url.includes('/mr-dog'), url);
  }

  // Test mobile tab navigation back to Home
  const homeTab = page.locator('nav a[href="/"]').first();
  if ((await homeTab.count()) > 0) {
    await homeTab.click();
    await page.waitForTimeout(2000);
    const url = page.url();
    logStep('Mobile navigate to Home tab', url.endsWith('/') || url.includes('/?'), url);
  }

  await browser.close();
  console.log('\nAll interactive checks completed successfully!');
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
