import fs from 'node:fs';

function inspect(filePath) {
  const buf = fs.readFileSync(filePath);
  const jsonLen = buf.readUInt32LE(12);
  const gltf = JSON.parse(buf.subarray(20, 20 + jsonLen).toString('utf8'));
  console.log(`\n========================================`);
  console.log(`FILE: ${filePath}`);
  console.log(`========================================`);
  console.log(`MATERIALS (${gltf.materials?.length || 0}):`);
  gltf.materials?.forEach((m, i) => {
    const pbr = m.pbrMetallicRoughness || {};
    const hex = pbr.baseColorFactor
      ? '#' + pbr.baseColorFactor.slice(0, 3).map(x => Math.round(x * 255).toString(16).padStart(2, '0')).join('')
      : 'NO_BASE_COLOR';
    const em = m.emissiveFactor
      ? '#' + m.emissiveFactor.map(x => Math.round(x * 255).toString(16).padStart(2, '0')).join('')
      : '#000000';
    console.log(`  [${i}] "${m.name}": color=${hex}, emissive=${em}, metal=${pbr.metallicFactor ?? 'def'}, rough=${pbr.roughnessFactor ?? 'def'}`);
  });

  console.log(`MESHES & NODES:`);
  gltf.nodes?.forEach((node, ni) => {
    if (node.mesh !== undefined) {
      const mesh = gltf.meshes[node.mesh];
      const matIndices = mesh.primitives?.map(p => p.material !== undefined ? `[${p.material}] "${gltf.materials[p.material]?.name}"` : 'NONE').join(', ');
      console.log(`  Node "${node.name}" (mesh: "${mesh.name}") -> materials: ${matIndices}`);
    } else {
      console.log(`  Node "${node.name}" (group/empty)`);
    }
  });
}

inspect('GLBs/badge-enamel.glb');
inspect('GLBs/badge-neon.glb');
inspect('GLBs/badge-jewelled.glb');
