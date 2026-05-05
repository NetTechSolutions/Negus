import { readFileSync, writeFileSync } from 'fs'

const files = ['index.html', 'about.html', 'contact.html', 'projects.html']

// Map of double-encoded UTF-8 sequences back to correct characters
const fixes = [
  ['Â©', '©'],   // Â© → ©
  ['â€“', '—'], // â€" → —  (em dash)
  ['â€º', '›'], // â€º → ›  (single right angle quotation)
  ['â€™', '’'], // â€™ → '  (right single quote)
  ['Â ', ' '],   // Â  → &nbsp; equivalent non-breaking space
]

for (const file of files) {
  let content = readFileSync(file, 'utf8')
  let changed = false
  for (const [bad, good] of fixes) {
    if (content.includes(bad)) {
      content = content.split(bad).join(good)
      changed = true
    }
  }
  if (changed) {
    writeFileSync(file, content, 'utf8')
    console.log(`Fixed: ${file}`)
  } else {
    console.log(`Clean: ${file}`)
  }
}
