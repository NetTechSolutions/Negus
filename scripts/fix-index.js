import { readFileSync, writeFileSync } from 'fs'

const path = new URL('../index.html', import.meta.url).pathname.replace(/^\//, '')

let content = readFileSync(path, 'utf8')

const fixes = [
  ['Â©', '©'],
  ['â', '–'],
  ['â', '—'],
  ['â', '‘'],
  ['â', '’'],
  ['â', '“'],
  ['â', '”'],
  ['âº', '›'],
  ['Â ', ' '],
]

let changed = false
for (const [bad, good] of fixes) {
  if (content.includes(bad)) {
    content = content.split(bad).join(good)
    changed = true
    console.log(`Fixed: ${JSON.stringify(bad)} -> ${JSON.stringify(good)}`)
  }
}

if (changed) {
  writeFileSync(path, content, 'utf8')
  console.log('index.html updated')
} else {
  console.log('index.html already clean')
}
