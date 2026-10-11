import { chromium } from 'playwright'
import path from 'node:path'
import fs from 'node:fs/promises'

const artifactDir = 'C:\\Users\\kulvi\\.gemini\\antigravity\\brain\\c6856244-cbb4-4502-98ab-93f5039574fa'
const screenshotsDir = path.join(artifactDir, 'screenshots')
const videosDir = path.join(artifactDir, 'videos')

const baseUrl = 'http://localhost:3000'

const pagesConfig = [
  {
    path: '/',
    name: 'home',
    scenes: ['H1', 'H2', 'H3', 'H4', 'H5'],
  },
  {
    path: '/the-red-room',
    name: 'redroom',
    scenes: ['R1', 'R2', 'R3', 'R4', 'R5', 'R6'],
  },
  {
    path: '/diwali',
    name: 'diwali',
    scenes: ['D1', 'D2', 'D3', 'D4', 'D5'],
  },
]

async function measureFpsAndCls(page) {
  return await page.evaluate(async () => {
    let cls = 0
    try {
      const entries = performance.getEntriesByType('layout-shift')
      for (const e of entries) {
        if (!e.hadRecentInput) cls += e.value
      }
    } catch {}

    const dts = []
    let last = performance.now()
    await new Promise((resolve) => {
      let count = 0
      function step(now) {
        dts.push(now - last)
        last = now
        count++
        if (count < 60) requestAnimationFrame(step)
        else resolve()
      }
      requestAnimationFrame(step)
    })
    const validDts = dts.slice(1)
    const avgDt = validDts.reduce((a, b) => a + b, 0) / validDts.length
    const maxDt = Math.max(...validDts)
    return {
      cls,
      avgFps: Math.round(1000 / avgDt),
      minFps: Math.round(1000 / maxDt),
    }
  })
}

async function setupPageHelper(page) {
  await page.evaluate(() => {
    // Dismiss intro loaders instantly for tests
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }))

    window.__scrollToSceneProgress = (id, p) => {
      const el = document.querySelector(`[data-scene="${id}"]`)
      if (!el) return { error: 'Scene not found: ' + id }
      if (window.__ScrollTrigger) window.__ScrollTrigger.refresh()
      const top = el.getBoundingClientRect().top + window.scrollY
      const h = el.offsetHeight
      const vh = window.innerHeight
      const travel = Math.max(h - vh, 0)
      const targetY = top + p * travel
      if (window.__lenis) {
        window.__lenis.scrollTo(targetY, { immediate: true })
      } else {
        window.scrollTo({ top: targetY, behavior: 'instant' })
      }
      if (window.__ScrollTrigger) window.__ScrollTrigger.update()
      if (window.__frame) {
        window.__frame.progress[id] = p
      }
      return { id, p, targetY, scrollY: window.scrollY }
    }
  })
}

async function run() {
  await fs.mkdir(screenshotsDir, { recursive: true })
  await fs.mkdir(videosDir, { recursive: true })

  const browser = await chromium.launch({
    args: ['--enable-webgl', '--ignore-gpu-blocklist', '--use-gl=angle', '--enable-gpu-rasterization'],
  })
  const metrics = {
    desktop: {},
    mobile: {},
  }

  // 1. Desktop 1440x900
  console.log('Capturing Desktop (1440x900)...')
  const desktopContext = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 1,
    recordVideo: {
      dir: videosDir,
      size: { width: 1440, height: 900 },
    },
  })
  const desktopPage = await desktopContext.newPage()

  for (const pConfig of pagesConfig) {
    console.log(`  Page: ${pConfig.name}`)
    await desktopPage.goto(baseUrl + pConfig.path, { waitUntil: 'networkidle' })
    await setupPageHelper(desktopPage)
    await desktopPage.waitForTimeout(400)

    const m = await measureFpsAndCls(desktopPage)
    metrics.desktop[pConfig.name] = m

    for (const scene of pConfig.scenes) {
      for (const progress of [0.25, 0.5, 0.75]) {
        const pct = Math.round(progress * 100)
        await desktopPage.evaluate(
          ({ s, pr }) => window.__scrollToSceneProgress(s, pr),
          { s: scene, pr: progress }
        )
        await desktopPage.waitForTimeout(220)
        const file = path.join(
          screenshotsDir,
          `${pConfig.name}_${scene.toLowerCase()}_${pct}_1440x900.png`
        )
        await desktopPage.screenshot({ path: file })
      }
    }
  }

  // Capture Transition T1 (Home -> Red Room) on Desktop
  console.log('  Recording Transition T1...')
  await desktopPage.goto(baseUrl + '/', { waitUntil: 'networkidle' })
  await setupPageHelper(desktopPage)
  await desktopPage.waitForTimeout(300)
  // Scroll to doors (H5)
  await desktopPage.evaluate(() => window.__scrollToSceneProgress('H5', 0.5))
  await desktopPage.waitForTimeout(300)

  // Click Red Room door
  const redRoomLink = desktopPage.locator('a[href="/the-red-room"]').first()
  await redRoomLink.click()
  await desktopPage.waitForTimeout(350)
  await desktopPage.screenshot({
    path: path.join(screenshotsDir, 'transition_t1_cover_1440x900.png'),
  })
  await desktopPage.waitForTimeout(900)
  await desktopPage.screenshot({
    path: path.join(screenshotsDir, 'transition_t1_entered_1440x900.png'),
  })

  // Close desktop context to finalize video
  await desktopPage.close()
  await desktopContext.close()

  // 2. Mobile 390x844
  console.log('Capturing Mobile (390x844)...')
  const mobileContext = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
    recordVideo: {
      dir: videosDir,
      size: { width: 390, height: 844 },
    },
  })
  const mobilePage = await mobileContext.newPage()

  for (const pConfig of pagesConfig) {
    console.log(`  Page: ${pConfig.name}`)
    await mobilePage.goto(baseUrl + pConfig.path, { waitUntil: 'networkidle' })
    await setupPageHelper(mobilePage)
    await mobilePage.waitForTimeout(400)

    const m = await measureFpsAndCls(mobilePage)
    metrics.mobile[pConfig.name] = m

    for (const scene of pConfig.scenes) {
      for (const progress of [0.25, 0.5, 0.75]) {
        const pct = Math.round(progress * 100)
        await mobilePage.evaluate(
          ({ s, pr }) => window.__scrollToSceneProgress(s, pr),
          { s: scene, pr: progress }
        )
        await mobilePage.waitForTimeout(220)
        const file = path.join(
          screenshotsDir,
          `${pConfig.name}_${scene.toLowerCase()}_${pct}_390x844.png`
        )
        await mobilePage.screenshot({ path: file })
      }
    }
  }

  // Mobile menu test screenshot
  await mobilePage.goto(baseUrl + '/', { waitUntil: 'networkidle' })
  await setupPageHelper(mobilePage)
  await mobilePage.waitForTimeout(300)
  const menuBtn = mobilePage.locator('button:has-text("Menu")').first()
  if (await menuBtn.isVisible()) {
    await menuBtn.click()
    await mobilePage.waitForTimeout(300)
    await mobilePage.screenshot({
      path: path.join(screenshotsDir, 'home_mobile_menu_390x844.png'),
    })
  }

  await mobilePage.close()
  await mobileContext.close()

  await browser.close()

  const summary = {
    metrics,
    screenshotsCount: (await fs.readdir(screenshotsDir)).length,
    videos: await fs.readdir(videosDir),
  }

  console.log('DONE!')
  console.log(JSON.stringify(summary, null, 2))
}

run().catch((err) => {
  console.error(err)
  process.exit(1)
})
