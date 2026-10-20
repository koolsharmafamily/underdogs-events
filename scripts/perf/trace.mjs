// Performance trace harness for the Underdogs site (perf/no-jank).
//
//   node scripts/perf/trace.mjs <label> [desktop|mobile] [baseUrl]
//
// Records, per scenario: frame-time stats (rAF deltas), Long Animation Frames
// (>50 ms) with script attribution, WebGL program links and texture uploads
// (instrumented on the context), blocking WebGL calls, layout shifts, and JS heap.
// Writes scripts/perf/results/<label>-<profile>.json and prints a summary table.
import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";

const label = process.argv[2] ?? "run";
const profile = process.argv[3] ?? "desktop";
const BASE = process.argv[4] ?? "http://localhost:3007";
const isMobile = profile === "mobile";
const outDir = path.resolve("scripts/perf/results");
fs.mkdirSync(outDir, { recursive: true });

const INIT = () => {
  const now = () => performance.now();
  const P = (window.__perf = {
    frames: [],
    loaf: [],
    shifts: [],
    links: [],
    uploads: [],
    slowGl: [],
    marks: [],
  });
  const loop = () => {
    P.frames.push(now());
    requestAnimationFrame(loop);
  };
  requestAnimationFrame(loop);
  try {
    new PerformanceObserver((list) => {
      for (const e of list.getEntries()) {
        if (e.duration < 50) continue;
        P.loaf.push({
          t: e.startTime,
          dur: e.duration,
          blocking: e.blockingDuration,
          render: e.renderStart ? e.startTime + e.duration - e.renderStart : 0,
          styleLayout: e.styleAndLayoutStart ? e.startTime + e.duration - e.styleAndLayoutStart : 0,
          scripts: e.scripts
            .map((s) => ({
              dur: Math.round(s.duration),
              invoker: s.invoker,
              fn: s.sourceFunctionName,
              src: (s.sourceURL || "").split("/").pop() + ":" + s.sourceCharPosition,
              forced: Math.round(s.forcedStyleAndLayoutDuration),
            }))
            .sort((a, b) => b.dur - a.dur)
            .slice(0, 4),
        });
      }
    }).observe({ type: "long-animation-frame", buffered: true });
  } catch {}
  try {
    new PerformanceObserver((list) => {
      for (const e of list.getEntries())
        if (!e.hadRecentInput) P.shifts.push({ t: e.startTime, value: e.value });
    }).observe({ type: "layout-shift", buffered: true });
  } catch {}

  const wrap = (proto, name, onCall) => {
    const orig = proto[name];
    if (!orig) return;
    proto[name] = function (...args) {
      const t = now();
      const r = orig.apply(this, args);
      const d = now() - t;
      onCall?.(t, d, args, r);
      if (d > 2) P.slowGl.push({ name, t, dur: d });
      return r;
    };
  };
  for (const proto of [WebGL2RenderingContext.prototype, WebGLRenderingContext.prototype]) {
    wrap(proto, "linkProgram", (t) => P.links.push(t));
    for (const n of ["texImage2D", "texSubImage2D", "compressedTexImage2D", "texImage3D", "texStorage2D"])
      wrap(proto, n, (t, d, args) => {
        // Ignore 1x1 placeholders and render-target allocations (null pixels).
        const last = args[args.length - 1];
        if (n === "texStorage2D") return;
        if (last == null && n !== "texSubImage2D") return;
        P.uploads.push({ t, d, n, w: args[0] && last && (last.width || last.videoWidth || args[3]) });
      });
    for (const n of ["getProgramParameter", "getShaderParameter", "bufferData", "generateMipmap", "readPixels", "getError"])
      wrap(proto, n);
  }
  window.__mark = (name) => P.marks.push({ name, t: now() });
};

const browser = await chromium.launch({
  headless: true,
  args: ["--use-angle=d3d11", "--enable-gpu", "--ignore-gpu-blocklist", "--enable-precise-memory-info"],
});
const context = await browser.newContext(
  isMobile
    ? {
        viewport: { width: 390, height: 844 },
        deviceScaleFactor: 3,
        isMobile: true,
        hasTouch: true,
        userAgent:
          "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1",
      }
    : { viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 },
);
await context.addInitScript(INIT);
const page = await context.newPage();
const cdp = await context.newCDPSession(page);
if (isMobile) await cdp.send("Emulation.setCPUThrottlingRate", { rate: 4 });
page.on("pageerror", (e) => console.log("[pageerror]", e.message));

const sleep = (ms) => page.waitForTimeout(ms);
const pnow = () => page.evaluate(() => performance.now());
const idle = async (extra = 1200) => {
  await page.waitForFunction(
    () => {
      const s = window.__store?.getState?.();
      const f = window.__frame;
      return s && s.phase === "complete" && !s.isTransitioning && (!f || f.transition.phase === "idle");
    },
    null,
    { timeout: 20000 },
  ).catch(() => console.log("  (idle wait timed out)"));
  await sleep(extra);
};
const clickHref = async (href) => {
  const ok = await page.evaluate((href) => {
    const els = [...document.querySelectorAll(`a[href="${href}"]`)];
    const vis = els.find((el) => {
      const r = el.getBoundingClientRect();
      const cs = getComputedStyle(el);
      return r.width > 0 && r.height > 0 && cs.visibility !== "hidden" && r.bottom > 0 && r.top < innerHeight;
    }) ?? els[0];
    if (!vis) return false;
    vis.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true, button: 0, view: window }));
    return true;
  }, href);
  if (!ok) console.log("  no link for", href);
};
const heap = async () => {
  await cdp.send("HeapProfiler.collectGarbage").catch(() => {});
  return page.evaluate(() => ({
    heapMB: +(performance.memory?.usedJSHeapSize / 1048576).toFixed(1),
    programs: window.__threeRenderer?.info.programs?.length ?? null,
    textures: window.__threeRenderer?.info.memory.textures ?? null,
    geometries: window.__threeRenderer?.info.memory.geometries ?? null,
  }));
};

const results = [];
let loaderEnd = null;
async function scenario(name, fn, { extra } = {}) {
  const t0 = await pnow();
  await fn();
  await idle(extra);
  const t1 = await pnow();
  const P = await page.evaluate(([t0, t1]) => {
    const P = window.__perf;
    const inW = (t) => t >= t0 && t <= t1;
    return {
      frames: P.frames.filter(inW),
      loaf: P.loaf.filter((e) => inW(e.t)),
      shifts: P.shifts.filter((e) => inW(e.t)),
      links: P.links.filter(inW).length,
      uploads: P.uploads.filter((u) => inW(u.t)),
      slowGl: P.slowGl.filter((e) => inW(e.t)),
    };
  }, [t0, t1]);
  const d = [];
  for (let i = 1; i < P.frames.length; i++) d.push(P.frames[i] - P.frames[i - 1]);
  const sorted = [...d].sort((a, b) => a - b);
  const q = (p) => (sorted.length ? sorted[Math.min(sorted.length - 1, Math.floor(p * sorted.length))] : 0);
  // A "dropped run" = 2+ consecutive frames over 1.5x the 60 Hz budget.
  let runs = 0, cur = 0;
  for (const x of d) { if (x > 25) { cur++; if (cur === 2) runs++; } else cur = 0; }
  const r = {
    name,
    ms: Math.round(t1 - t0),
    frames: d.length,
    p50: +q(0.5).toFixed(1),
    p95: +q(0.95).toFixed(1),
    p99: +q(0.99).toFixed(1),
    max: +(sorted[sorted.length - 1] ?? 0).toFixed(1),
    over33: d.filter((x) => x > 33.4).length,
    over50: d.filter((x) => x > 50).length,
    droppedRuns: runs,
    loaf50: P.loaf.length,
    worstLoaf: P.loaf.sort((a, b) => b.dur - a.dur).slice(0, 3),
    cls: +P.shifts.reduce((s, e) => s + e.value, 0).toFixed(4),
    programLinks: P.links,
    textureUploads: P.uploads.length,
    bigUploads: P.uploads.filter((u) => u.d > 4).map((u) => `${u.n}:${u.w}:${u.d.toFixed(0)}ms`).slice(0, 6),
    slowGl: Object.entries(
      P.slowGl.reduce((acc, e) => ((acc[e.name] = (acc[e.name] ?? 0) + e.dur), acc), {}),
    ).map(([k, v]) => `${k}:${v.toFixed(0)}ms`),
    afterLoader: loaderEnd != null,
  };
  results.push(r);
  console.log(
    `${name.padEnd(28)} p50 ${String(r.p50).padStart(5)} p95 ${String(r.p95).padStart(5)} max ${String(r.max).padStart(6)} >33:${r.over33} runs:${r.droppedRuns} LoAF>50:${r.loaf50} links:${r.programLinks} uploads:${r.textureUploads} cls:${r.cls}`,
  );
  for (const l of r.worstLoaf)
    console.log(
      `     LoAF ${l.dur.toFixed(0)}ms (layout ${l.styleLayout.toFixed(0)}) ${l.scripts.map((s) => `${s.invoker}|${s.fn}|${s.src}=${s.dur}${s.forced ? `(forced ${s.forced})` : ""}`).join("  ")}`,
    );
  if (r.slowGl.length) console.log(`     slowGL ${r.slowGl.join(" ")} ${r.bigUploads.join(" ")}`);
  return r;
}

const scrollPage = async () => {
  const h = await page.evaluate(() => document.documentElement.scrollHeight - innerHeight);
  for (let y = 0; y < h + 400; y += isMobile ? 220 : 260) {
    await page.mouse.wheel(0, isMobile ? 220 : 260);
    await sleep(60);
  }
  await sleep(800);
};
const toTop = async () => {
  await page.evaluate(() => { window.__lenis?.scrollTo(0, { immediate: true }); window.scrollTo(0, 0); });
  await sleep(400);
};

// ---- scenarios ----
const memory = [];
await scenario("loader -> home", async () => {
  await page.goto(BASE + "/", { waitUntil: "domcontentloaded" });
});
loaderEnd = await pnow();
memory.push({ at: "after loader", ...(await heap()) });
await scenario("scroll home", scrollPage, { extra: 600 });
await toTop();

const cycle = async (round) => {
  await scenario(`home -> redroom${round}`, () => clickHref("/the-red-room"));
  await scenario(`redroom -> diwali${round}`, () => clickHref("/diwali"), { extra: 4500 });
  await scenario(`diwali -> redroom${round}`, () => clickHref("/the-red-room"));
  await scenario(`redroom -> home${round}`, () => clickHref("/"));
  await toTop();
  await scenario(`home -> diwali${round}`, () => clickHref("/diwali"), { extra: 2500 });
  await scenario(`diwali -> home${round}`, () => clickHref("/"));
  await scenario(`back${round}`, () => page.goBack({ waitUntil: "commit" }));
  await scenario(`forward${round}`, () => page.goForward({ waitUntil: "commit" }));
  await scenario(`home -> events${round}`, () => clickHref("/events"));
  await scenario(`events -> redroom${round}`, () => clickHref("/the-red-room"));
  await scenario(`redroom -> events${round}`, () => clickHref("/events"));
  await scenario(`events -> diwali${round}`, () => clickHref("/diwali"), { extra: 2500 });
  await scenario(`diwali -> home(b)${round}`, () => clickHref("/"));
  await toTop();
};
await cycle("");
memory.push({ at: "after round 1", ...(await heap()) });

if (isMobile) {
  await scenario("tab home -> mr-dog", () => clickHref("/mr-dog"));
  await scenario("mr-dog typing", async () => {
    await page.click("textarea");
    await page.keyboard.type("when is the red room party", { delay: 40 });
  }, { extra: 400 });
  await scenario("tab mr-dog -> events", () => clickHref("/events"));
  await scenario("tab events -> home", () => clickHref("/"));
} else {
  await scenario("mr-dog open + typing", async () => {
    await page.evaluate(() => [...document.querySelectorAll("button")].find((b) => /Ask Mr\. Dog/i.test(b.textContent))?.click());
    await sleep(500);
    const ta = await page.$("textarea");
    if (ta) { await ta.click(); await page.keyboard.type("when is the red room party", { delay: 40 }); }
  }, { extra: 400 });
  await scenario("mr-dog close", () => page.keyboard.press("Escape"), { extra: 600 });
}

await cycle(" #2");
await cycle(" #3");
memory.push({ at: "after round 3", ...(await heap()) });
console.log("memory", JSON.stringify(memory));

fs.writeFileSync(path.join(outDir, `${label}-${profile}.json`), JSON.stringify({ label, profile, results, memory }, null, 1));
await browser.close();
