import fs from 'node:fs';import path from 'node:path';import {createHash} from 'node:crypto';
const hash=b=>createHash('sha256').update(b).digest('hex').slice(0,12);const manifest={};
function walk(dir){return fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.name==='v'?[]:e.isDirectory()?walk(path.join(dir,e.name)):[path.join(dir,e.name)]);}
for(const folder of ['models','media'])for(const file of walk('public/'+folder)){const body=fs.readFileSync(file),rel=path.relative('public/'+folder,file).replaceAll('\\','/');const url='/'+folder+'/v/'+hash(body)+'/'+rel;manifest['/'+folder+'/'+rel]=url;const dest='public'+url;fs.mkdirSync(path.dirname(dest),{recursive:true});if(!fs.existsSync(dest))fs.writeFileSync(dest,body);}
fs.mkdirSync('src/generated',{recursive:true});fs.writeFileSync('src/generated/asset-manifest.json',JSON.stringify(manifest,null,2)+'\n');
const revision=hash(Buffer.concat([...walk('src'),...walk('app')].filter(f=>/\.(tsx?|css|json)$/.test(f)).sort().map(f=>fs.readFileSync(f))));
fs.writeFileSync('public/sw.js','const RELEASE = '+JSON.stringify(revision)+';\n'+fs.readFileSync('scripts/service-worker.js','utf8'));
console.log('Versioned '+Object.keys(manifest).length+' assets; worker '+revision);
