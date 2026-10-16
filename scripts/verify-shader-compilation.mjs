import { chromium } from "playwright";

async function run() {
  const browser = await chromium.launch({
    headless: true,
    args: ["--enable-webgl", "--use-gl=angle", "--use-angle=swiftshader"],
  });

  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.addInitScript(() => {
    sessionStorage.setItem("underdogs-loader-seen", "1");
  });

  await page.goto("http://localhost:3000/", { waitUntil: "networkidle" });
  await page.waitForTimeout(2000);

  const programsBefore = await page.evaluate(() => {
    const canvas = document.querySelector("canvas");
    if (!canvas) return null;
    const r3f = canvas.__r3f;
    const renderer = r3f ? r3f.root.getState().gl : null;
    return renderer && renderer.info && renderer.info.programs ? renderer.info.programs.length : null;
  });

  // Scroll into H5
  await page.evaluate(() => {
    const h5 = document.querySelector('section[data-scene="H5"]');
    if (h5) h5.scrollIntoView({ behavior: "instant" });
  });
  await page.waitForTimeout(1500);

  const programsAfter = await page.evaluate(() => {
    const canvas = document.querySelector("canvas");
    if (!canvas) return null;
    const r3f = canvas.__r3f;
    const renderer = r3f ? r3f.root.getState().gl : null;
    return renderer && renderer.info && renderer.info.programs ? renderer.info.programs.length : null;
  });

  console.log("Programs before H5 scroll:", programsBefore);
  console.log("Programs after H5 scroll:", programsAfter);
  console.log("Post-load compiled shader count:", (programsAfter ?? 0) - (programsBefore ?? 0));

  await browser.close();
}

run().catch(console.error);
