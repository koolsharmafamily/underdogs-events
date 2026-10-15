const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');
const sharp = require('sharp');

const OUT_DIR = path.resolve('C:/Users/kulvi/.gemini/antigravity/brain/c6856244-cbb4-4502-98ab-93f5039574fa/screenshots');
if (!fs.existsSync(OUT_DIR)) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
}

async function run() {
  const browser = await chromium.launch({
    headless: true,
    args: ['--enable-webgl', '--use-gl=angle', '--use-angle=default'],
  });

  console.log('1. Capturing Desktop (1440x900)...');
  const desktopContext = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 2,
  });

  // D0 Clap (desktop)
  const d0Page = await desktopContext.newPage();
  await d0Page.addInitScript(() => {
    sessionStorage.setItem('underdogs-loader-seen', '1');
    sessionStorage.removeItem('underdogs-dhamaaka-clapper-seen');
  });
  await d0Page.goto('http://localhost:3000/diwali', { waitUntil: 'domcontentloaded' });
  await d0Page.waitForTimeout(550); // Clapper snap & flash moment
  await d0Page.screenshot({ path: path.join(OUT_DIR, 'dhamaaka_desktop_d0_clap.png') });
  console.log('Saved dhamaaka_desktop_d0_clap.png');
  await d0Page.close();

  // D1 Hero, D3 Invite, D4 Sponsors, D5 Poster (desktop)
  const mainDesktopPage = await desktopContext.newPage();
  await mainDesktopPage.addInitScript(() => {
    sessionStorage.setItem('underdogs-loader-seen', '1');
  });
  await mainDesktopPage.goto('http://localhost:3000/diwali', { waitUntil: 'networkidle' });
  // Dismiss clapperboard opener if visible
  const clapperEl = mainDesktopPage.locator('[aria-label="Scene opener: Lights, camera, Dhamaaka"]');
  if (await clapperEl.count() > 0 && await clapperEl.isVisible()) {
    await clapperEl.click({ force: true });
    await mainDesktopPage.waitForTimeout(600);
  }
  await mainDesktopPage.waitForTimeout(1400); // Wait for title and 3D badge to settle

  await mainDesktopPage.screenshot({ path: path.join(OUT_DIR, 'dhamaaka_desktop_d1_hero.png') });
  console.log('Saved dhamaaka_desktop_d1_hero.png');

  // D3 Invite
  const inviteEl = mainDesktopPage.locator('#diwali-invitation');
  if (await inviteEl.count() > 0) {
    await inviteEl.scrollIntoViewIfNeeded();
    await mainDesktopPage.waitForTimeout(1000);
    await mainDesktopPage.screenshot({ path: path.join(OUT_DIR, 'dhamaaka_desktop_d3_invite.png') });
    console.log('Saved dhamaaka_desktop_d3_invite.png');
  }

  // D4 Sponsors
  const sponsorsEl = mainDesktopPage.locator('section[aria-label="Official Premiere Partners"]');
  if (await sponsorsEl.count() > 0) {
    await sponsorsEl.scrollIntoViewIfNeeded();
    await mainDesktopPage.waitForTimeout(800);
    await mainDesktopPage.screenshot({ path: path.join(OUT_DIR, 'dhamaaka_desktop_d4_sponsors.png') });
    console.log('Saved dhamaaka_desktop_d4_sponsors.png');
  }

  // D5 Poster
  const posterEl = mainDesktopPage.locator('section[aria-label="Now Showing — Official Premiere Poster"]');
  if (await posterEl.count() > 0) {
    await posterEl.scrollIntoViewIfNeeded();
    await mainDesktopPage.waitForTimeout(800);
    await mainDesktopPage.screenshot({ path: path.join(OUT_DIR, 'dhamaaka_desktop_d5_poster.png') });
    console.log('Saved dhamaaka_desktop_d5_poster.png');
  }
  await mainDesktopPage.close();

  console.log('2. Capturing Mobile (390x844)...');
  const mobileContext = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
  });

  // D0 Clap (mobile)
  const d0MobilePage = await mobileContext.newPage();
  await d0MobilePage.addInitScript(() => {
    sessionStorage.setItem('underdogs-loader-seen', '1');
    sessionStorage.removeItem('underdogs-dhamaaka-clapper-seen');
  });
  await d0MobilePage.goto('http://localhost:3000/diwali', { waitUntil: 'domcontentloaded' });
  await d0MobilePage.waitForTimeout(550);
  await d0MobilePage.screenshot({ path: path.join(OUT_DIR, 'dhamaaka_mobile_d0_clap.png') });
  console.log('Saved dhamaaka_mobile_d0_clap.png');
  await d0MobilePage.close();

  // D1 Hero, D3 Invite, D4 Sponsors, D5 Poster (mobile)
  const mainMobilePage = await mobileContext.newPage();
  await mainMobilePage.addInitScript(() => {
    sessionStorage.setItem('underdogs-loader-seen', '1');
  });
  await mainMobilePage.goto('http://localhost:3000/diwali', { waitUntil: 'networkidle' });
  const mobileClapper = mainMobilePage.locator('[aria-label="Scene opener: Lights, camera, Dhamaaka"]');
  if (await mobileClapper.count() > 0 && await mobileClapper.isVisible()) {
    await mobileClapper.click({ force: true });
    await mainMobilePage.waitForTimeout(600);
  }
  await mainMobilePage.waitForTimeout(1400);

  await mainMobilePage.screenshot({ path: path.join(OUT_DIR, 'dhamaaka_mobile_d1_hero.png') });
  console.log('Saved dhamaaka_mobile_d1_hero.png');

  // D3 Invite (mobile)
  const mobileInviteEl = mainMobilePage.locator('#diwali-invitation');
  if (await mobileInviteEl.count() > 0) {
    await mobileInviteEl.scrollIntoViewIfNeeded();
    await mainMobilePage.waitForTimeout(800);
    await mainMobilePage.screenshot({ path: path.join(OUT_DIR, 'dhamaaka_mobile_d3_invite.png') });
    console.log('Saved dhamaaka_mobile_d3_invite.png');
  }

  // D4 Sponsors (mobile)
  const mobileSponsorsEl = mainMobilePage.locator('section[aria-label="Official Premiere Partners"]');
  if (await mobileSponsorsEl.count() > 0) {
    await mobileSponsorsEl.scrollIntoViewIfNeeded();
    await mainMobilePage.waitForTimeout(800);
    await mainMobilePage.screenshot({ path: path.join(OUT_DIR, 'dhamaaka_mobile_d4_sponsors.png') });
    console.log('Saved dhamaaka_mobile_d4_sponsors.png');
  }

  // D5 Poster (mobile)
  const mobilePosterEl = mainMobilePage.locator('section[aria-label="Now Showing — Official Premiere Poster"]');
  if (await mobilePosterEl.count() > 0) {
    await mobilePosterEl.scrollIntoViewIfNeeded();
    await mainMobilePage.waitForTimeout(800);
    await mainMobilePage.screenshot({ path: path.join(OUT_DIR, 'dhamaaka_mobile_d5_poster.png') });
    console.log('Saved dhamaaka_mobile_d5_poster.png');
  }
  await mainMobilePage.close();

  // Mobile Events Card
  console.log('3. Capturing Mobile Events Card...');
  const eventsPage = await mobileContext.newPage();
  await eventsPage.addInitScript(() => {
    sessionStorage.setItem('underdogs-loader-seen', '1');
  });
  await eventsPage.goto('http://localhost:3000/events', { waitUntil: 'networkidle' });
  await eventsPage.waitForTimeout(800);
  await eventsPage.screenshot({ path: path.join(OUT_DIR, 'dhamaaka_mobile_events_card.png') });
  console.log('Saved dhamaaka_mobile_events_card.png');
  await eventsPage.close();

  await browser.close();

  // 4. Side-by-side comparison of D1 Hero and Flyer
  console.log('4. Generating side-by-side comparison with flyer...');
  const flyerPath = path.resolve('public/media/dhamaaka-flyer.png');
  const d1HeroPath = path.join(OUT_DIR, 'dhamaaka_desktop_d1_hero.png');

  if (fs.existsSync(flyerPath) && fs.existsSync(d1HeroPath)) {
    const targetHeight = 1080;
    const heroResized = await sharp(d1HeroPath)
      .resize({ height: targetHeight })
      .toBuffer();
    const heroMeta = await sharp(heroResized).metadata();

    const flyerResized = await sharp(flyerPath)
      .resize({ height: targetHeight })
      .toBuffer();
    const flyerMeta = await sharp(flyerResized).metadata();

    const totalWidth = heroMeta.width + flyerMeta.width + 40;

    await sharp({
      create: {
        width: totalWidth,
        height: targetHeight + 120,
        channels: 4,
        background: { r: 10, g: 6, b: 6, alpha: 1 },
      },
    })
      .composite([
        { input: heroResized, top: 80, left: 20 },
        { input: flyerResized, top: 80, left: heroMeta.width + 30 },
      ])
      .png()
      .toFile(path.join(OUT_DIR, 'dhamaaka_d1_vs_flyer_comparison.png'));

    console.log('Saved dhamaaka_d1_vs_flyer_comparison.png');
  }

  console.log('All captures and deliverables generated successfully!');
}

run().catch((err) => {
  console.error('Error during capture:', err);
  process.exit(1);
});
