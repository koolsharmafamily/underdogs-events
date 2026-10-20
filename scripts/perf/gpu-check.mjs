import { chromium } from "playwright";

for (const args of [
  ["--use-angle=d3d11", "--enable-gpu", "--ignore-gpu-blocklist", "--enable-unsafe-swiftshader=false"],
  ["--use-angle=swiftshader"],
]) {
  const browser = await chromium.launch({ headless: true, args });
  const page = await browser.newPage();
  const info = await page.evaluate(() => {
    const c = document.createElement("canvas");
    const gl = c.getContext("webgl2");
    if (!gl) return "no webgl2";
    const ext = gl.getExtension("WEBGL_debug_renderer_info");
    return {
      renderer: ext ? gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.RENDERER),
      parallel: !!gl.getExtension("KHR_parallel_shader_compile"),
      loaf: PerformanceObserver.supportedEntryTypes.includes("long-animation-frame"),
      ua: navigator.userAgent,
    };
  });
  console.log(args[0], JSON.stringify(info));
  await browser.close();
}
