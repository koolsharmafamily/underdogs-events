import sharp from 'sharp'
import path from 'node:path'
import fs from 'node:fs/promises'

const root = process.cwd()
const outDir = path.join(root, 'public', 'media')

async function run() {
  await fs.mkdir(outDir, { recursive: true })

  const redRoomSrc = path.join(root, 'brand-source', 'Halloween Post.png')
  const diwaliSrc = path.join(root, 'brand-source', 'Diwali Post.png')

  await sharp(redRoomSrc)
    .webp({ quality: 86, effort: 6 })
    .toFile(path.join(outDir, 'red-room-poster.webp'))

  await sharp(diwaliSrc)
    .webp({ quality: 86, effort: 6 })
    .toFile(path.join(outDir, 'diwali-teaser.webp'))

  const rrStat = await fs.stat(path.join(outDir, 'red-room-poster.webp'))
  const dwStat = await fs.stat(path.join(outDir, 'diwali-teaser.webp'))
  console.log(`red-room-poster.webp: ${(rrStat.size / 1024).toFixed(1)} KB`)
  console.log(`diwali-teaser.webp: ${(dwStat.size / 1024).toFixed(1)} KB`)
}

run().catch((err) => {
  console.error(err)
  process.exit(1)
})
