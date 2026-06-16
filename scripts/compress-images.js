// Image optimisation script.
// Run: npm run compress
// Resizes images to max 1920px wide/tall (maintains aspect ratio) and
// compresses in-place. Resize alone typically cuts phone-photo file sizes
// by 60-80% before compression even runs.
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
    // Resize to max 1920px in either dimension — phone photos can be 4000px+
    // which is far larger than any screen needs. withoutEnlargement prevents
    // upscaling images that are already small.
    const resized = sharp(input).resize({
      width: 1920, height: 1920,
      fit: 'inside', withoutEnlargement: true
    })
    const buf   = isJpg
      ? await resized.jpeg({ quality: 75, mozjpeg: true }).toBuffer()
      : await resized.png({ compressionLevel: 9, palette: true }).toBuffer()

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
