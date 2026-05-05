// One-time image compression script.
// Run: npm run compress
// Compresses all JPEGs/PNGs in src/assets/images to quality 78 in-place.
// Reads via Buffer to avoid Windows path issues with special characters.

import sharp from 'sharp'
import { readdirSync, statSync, readFileSync, writeFileSync } from 'fs'
import { join, extname } from 'path'
import { fileURLToPath } from 'url'
import { dirname } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..', 'src', 'assets', 'images')

function walk(dir) {
  return readdirSync(dir).flatMap(name => {
    const full = join(dir, name)
    return statSync(full).isDirectory() ? walk(full) : [full]
  })
}

const files = walk(ROOT).filter(f => /\.(jpe?g|png)$/i.test(f))

let totalBefore = 0
let totalAfter  = 0

for (const file of files) {
  const before  = statSync(file).size
  const isJpg   = /\.(jpe?g)$/i.test(file)
  const label   = file.replace(ROOT, '').replace(/^[\\/]/, '')
  totalBefore  += before

  try {
    // Read as Buffer — avoids Windows native path issues
    const input = readFileSync(file)
    const buf   = isJpg
      ? await sharp(input).jpeg({ quality: 78, mozjpeg: true }).toBuffer()
      : await sharp(input).png({ compressionLevel: 9, palette: true }).toBuffer()

    if (buf.length >= before) {
      console.log(`SKIP  ${label}  (already optimal at ${(before/1024).toFixed(0)}KB)`)
      totalAfter += before
      continue
    }

    writeFileSync(file, buf)
    totalAfter += buf.length

    const saved = Math.round((1 - buf.length / before) * 100)
    const kb    = n => (n / 1024).toFixed(0) + 'KB'
    console.log(`✓  ${label}  ${kb(before)} → ${kb(buf.length)}  (-${saved}%)`)
  } catch (e) {
    console.error(`ERR  ${label}: ${e.message}`)
    totalAfter += before
  }
}

const mb = n => (n / 1024 / 1024).toFixed(2) + ' MB'
console.log(`\nDone: ${mb(totalBefore)} → ${mb(totalAfter)}  (saved ${mb(totalBefore - totalAfter)})`)
