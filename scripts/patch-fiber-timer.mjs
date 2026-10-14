import { readdir, readFile, writeFile } from "node:fs/promises";

// Fiber 9.8.1 still constructs the deprecated Clock. Keep its small clock API
// while measuring time with Timer. Remove this patch when Fiber adopts Timer.
const directory = new URL(
  "../node_modules/@react-three/fiber/dist/",
  import.meta.url,
);
let patched = 0;
for (const file of await readdir(directory)) {
  if (!file.endsWith(".js")) continue;
  const url = new URL(file, directory),
    source = await readFile(url, "utf8");
  const result = source.replace(
    /new (THREE(?:__namespace)?).Clock\(\)/g,
    (_, three) => {
      patched++;
      return `new (class FiberTimer {
      constructor() { this.timer = new ${three}.Timer(); this.elapsedTime = 0; this.oldTime = 0; this.running = false; this.autoStart = true; }
      start() { this.timer.reset(); this.elapsedTime = 0; this.running = true; }
      stop() { this.getDelta(); this.running = false; this.autoStart = false; }
      getDelta() { if (!this.running && this.autoStart) { this.start(); return 0; } if (!this.running) return 0; this.timer.update(); const delta = this.timer.getDelta(); this.elapsedTime += delta; return delta; }
      getElapsedTime() { this.getDelta(); return this.elapsedTime; }
    })()`;
    },
  );
  if (result !== source) await writeFile(url, result);
}
console.log(`Fiber Timer compatibility: ${patched} bundle(s) updated.`);
