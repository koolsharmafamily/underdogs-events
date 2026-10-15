// Every scroll key the canvas or a view reads must be registered by a page
// (useSceneProgress), or the effect it drives silently never runs.
//   npm run check:scenes
import fs from 'node:fs';
import path from 'node:path';

// Keys read but knowingly unregistered, with the reason. Keep this empty.
const PENDING = {
  H4: 'Home "This season" scene: copy in site.ts, section rebuilt in Pass 3',
};

const files = [];
(function walk(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p);
    else if (/\.(tsx?|mjs)$/.test(e.name)) files.push(p);
  }
})('src');

const read = new Map();
const registered = new Set();
for (const file of files) {
  const src = fs.readFileSync(file, 'utf8');
  for (const m of src.matchAll(/(?:progress|dampedProgress|linearProgress)(?:\[["'](\w+)["']\]|\.([A-Z]\w*))/g)) {
    const key = m[1] ?? m[2];
    if (!read.has(key)) read.set(key, new Set());
    read.get(key).add(file);
  }
  for (const m of src.matchAll(/useSceneProgress\(\s*["'](\w+)["']/g)) registered.add(m[1]);
}

let failed = false;
for (const [key, where] of [...read].sort()) {
  if (registered.has(key)) continue;
  if (PENDING[key]) {
    console.log(`… ${key} pending: ${PENDING[key]}`);
    continue;
  }
  failed = true;
  console.log(`✗ ${key} is read in ${[...where].join(', ')} but no page registers it`);
}
console.log(`${registered.size} keys registered, ${read.size} read.`);
if (failed) process.exit(1);
