// Smoke suite against a running build (npm run build && npm start, then):
//   BASE=http://localhost:3000 npm run smoke
// CHROMIUM_PATH overrides the browser. Software GL (SwiftShader) is fine: the
// checks are counts, not frame rates.
//
// Checks:
//  1. Every route loads; no console errors or warnings; no request leaves the site.
//  2. Shader programs and GPU textures stay flat across repeated route changes,
//     once every world has been warmed (no compiles, no leaks).
//  3. Draw calls per frame stay within budget (desktop 120, DHAMAAKA 30).
//  4. During a transition the cover always shows the badge (an aperture), never a solid frame.
import { chromium } from 'playwright';

const BASE = process.env.BASE || 'http://localhost:3000';
const TIER = process.env.TIER || 'T3';
const results = [];
const check = (name, ok, detail = '') => {
  results.push({ name, ok, detail });
  console.log(`${ok ? '✓' : '✗'} ${name}${detail ? `  (${detail})` : ''}`);
};

const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH || undefined,
  args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'],
});
const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
// Count draw calls per frame from the renderer the app exposes.
await context.addInitScript(() => {
  window.__calls = [];
  const tick = () => {
    const r = window.__threeRenderer;
    if (r && !r.__wrapped) {
      r.__wrapped = true;
      const render = r.render.bind(r);
      // A frame ends with the render to the screen (the composer's last pass,
      // or the scene itself on the direct path); offscreen passes add to it.
      let acc = 0;
      r.render = (s, c) => {
        const toScreen = r.getRenderTarget() === null;
        render(s, c);
        acc += r.info.render.calls;
        if (toScreen) { window.__calls.push(acc); acc = 0; if (window.__calls.length > 600) window.__calls.shift(); }
      };
    }
    if (!r?.__wrapped) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
});
const page = await context.newPage();
const origin = new URL(BASE).origin;
const logs = [];
const external = new Set();
page.on('console', (m) => {
  if (['error', 'warning'].includes(m.type()) && !m.text().includes('KHR_parallel_shader_compile')) logs.push(`${m.type()}: ${m.text().slice(0, 200)}`);
});
page.on('pageerror', (e) => logs.push(`pageerror: ${e.message.slice(0, 200)}`));
page.on('request', (r) => {
  const u = r.url();
  if (!u.startsWith(origin) && !u.startsWith('data:') && !u.startsWith('blob:')) external.add(u);
});

const ready = (timeout = 180000) =>
  page.waitForFunction(() => {
    const s = window.__store?.getState();
    return s && s.phase === 'complete' && (!s.sceneRoute || s.renderedWorlds[s.world]) && window.__frame?.transition.phase === 'idle';
  }, null, { timeout, polling: 250 });
const gpu = () => page.evaluate(() => {
  const r = window.__threeRenderer;
  return r ? { programs: r.info.programs.length, textures: r.info.memory.textures, geometries: r.info.memory.geometries } : null;
});

// 1. Routes
for (const route of ['/', '/the-red-room', '/diwali', '/events', '/no-such-door']) {
  logs.length = 0;
  const res = await page.goto(`${BASE}${route}?tier=${TIER}`, { timeout: 180000 });
  await ready().catch(() => {});
  await page.waitForTimeout(1500);
  const expected = route === '/no-such-door' ? 404 : 200;
  check(`${route} responds ${expected}`, res?.status() === expected, String(res?.status()));
  // The 404 page's own document response is expected.
  const unexpected = logs.filter((l) => !(expected === 404 && l.includes('status of 404')));
  check(`${route} logs nothing`, unexpected.length === 0, unexpected.slice(0, 3).join(' | '));
  if (route === '/diwali' || route === '/' || route === '/the-red-room') {
    await page.waitForTimeout(1000);
    const calls = await page.evaluate(() => Math.max(0, ...window.__calls.slice(-30)));
    const budget = route === '/diwali' ? 30 : 120;
    check(`${route} draw calls ≤ ${budget}`, calls <= budget, `peak ${calls}`);
  }
}
check('no request leaves the site', external.size === 0, [...external].slice(0, 3).join(' '));

// 2 + 4. Route changes: warm, then measure.
await page.goto(`${BASE}/?tier=${TIER}`, { timeout: 180000 });
await ready();
// Let the idle warm-up mount and compile the other worlds.
await page.waitForFunction(() => {
  const s = window.__store.getState();
  return s.residentWorlds.home && s.residentWorlds.redroom && s.residentWorlds.diwali;
}, null, { timeout: 180000 }).catch(() => {});
await page.waitForTimeout(8000);

const nav = async (href) => {
  await page.evaluate(() => {
    window.__solid = 0;
    const stage = document.querySelector('[data-transition-veil]')?.parentElement;
    const watch = () => {
      const phase = window.__frame?.transition.phase;
      if (phase === 'covered' && stage && (stage.style.maskImage || 'none') === 'none') window.__solid++;
      if (phase !== 'idle' || window.__solid === 0) requestAnimationFrame(watch);
    };
    requestAnimationFrame(watch);
  });
  await page.locator(`header a[href="${href}"]:visible`).first().click({ timeout: 60000 });
  await page.waitForFunction((h) => location.pathname === h, href, { timeout: 60000 });
  await ready();
  await page.waitForTimeout(1500);
  return page.evaluate(() => window.__solid);
};

const loop = ['/the-red-room', '/diwali', '/'];
await nav(loop[0]); await nav(loop[1]); await nav(loop[2]);
const before = await gpu();
let solid = 0;
for (let i = 0; i < 2; i++) for (const href of loop) solid += await nav(href);
const after = await gpu();
check('shader programs constant across 6 route changes', after.programs === before.programs, `${before.programs} → ${after.programs}`);
check('GPU textures constant across 6 route changes', after.textures === before.textures, `${before.textures} → ${after.textures}`);
check('geometries constant across 6 route changes', after.geometries === before.geometries, `${before.geometries} → ${after.geometries}`);
check('every covered frame keeps the badge aperture', solid === 0, `${solid} solid frames`);

await browser.close();
const failed = results.filter((r) => !r.ok);
console.log(`\n${results.length - failed.length}/${results.length} passed`);
process.exit(failed.length ? 1 : 0);
