import { NodeIO } from "@gltf-transform/core";
import {
  ALL_EXTENSIONS,
  EXTMeshoptCompression,
} from "@gltf-transform/extensions";
import { MeshoptEncoder, MeshoptDecoder } from "meshoptimizer";
import { readdir, readFile, writeFile, mkdir } from "node:fs/promises";
import assert from "node:assert/strict";
import { isDeepStrictEqual } from "node:util";
function geometry(doc) {
  const indices = new Set(
    doc
      .getRoot()
      .listMeshes()
      .flatMap((m) => m.listPrimitives().map((p) => p.getIndices())),
  );
  return doc
    .getRoot()
    .listAccessors()
    .map((a) => {
      const values = Array.from(a.getArray());
      if (indices.has(a))
        for (let i = 0; i < values.length; i += 3) {
          const tri = values.slice(i, i + 3),
            offset = tri.indexOf(Math.min(...tri));
          for (let j = 0; j < 3; j++) values[i + j] = tri[(j + offset) % 3];
        }
      return values;
    });
}

await Promise.all([MeshoptEncoder.ready, MeshoptDecoder.ready]);
const io = new NodeIO()
  .registerExtensions(ALL_EXTENSIONS)
  .registerDependencies({
    "meshopt.encoder": MeshoptEncoder,
    "meshopt.decoder": MeshoptDecoder,
  });
const models = new URL("../public/models/", import.meta.url);
const backup = process.env.MODEL_BACKUP_DIR;
if (!backup) throw new Error("Set MODEL_BACKUP_DIR before optimizing assets.");
await mkdir(backup, { recursive: true });
const report = [];
for (const name of await readdir(models)) {
  if (!name.endsWith(".glb")) continue;
  const url = new URL(name, models),
    source = await readFile(url);
  const doc = await io.readBinary(source);
  if (
    doc
      .getRoot()
      .listExtensionsUsed()
      .some((ext) => ext.extensionName === "EXT_meshopt_compression")
  )
    continue;
  const before = await io.writeJSON(doc);
  const arrays = geometry(doc);
  // QUANTIZE selects the lossless encoder path; no quantize/reorder transform
  // is run. Every original accessor float and material is checked after decoding.
  doc
    .createExtension(EXTMeshoptCompression)
    .setRequired(true)
    .setEncoderOptions({
      method: EXTMeshoptCompression.EncoderMethod.QUANTIZE,
    });
  const compressed = await io.writeBinary(doc);
  const decoded = await io.readBinary(compressed),
    after = await io.writeJSON(decoded);
  assert.deepEqual(
    after.json.materials,
    before.json.materials,
    `${name}: materials changed`,
  );
  assert.ok(
    isDeepStrictEqual(geometry(decoded), arrays),
    `${name}: geometry changed`,
  );
  await writeFile(
    new URL(name, "file:///" + backup.replaceAll("\\", "/") + "/"),
    source,
  );
  await writeFile(url, compressed);
  report.push({
    name,
    before: source.length,
    after: compressed.length,
    materialsIdentical: true,
    geometryIdentical: true,
  });
}
await writeFile(
  new URL("compression.json", "file:///" + backup.replaceAll("\\", "/") + "/"),
  JSON.stringify(report, null, 2),
);
console.log(JSON.stringify(report, null, 2));
