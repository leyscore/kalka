// Builds the unpacked extension into extension/dist: the service worker, the popup and the
// inspector, which the popup or the shortcut injects into the page only when asked.
import { cp, mkdir, rm } from 'node:fs/promises'
import { join } from 'node:path'

const root = join(import.meta.dir, '..')
const dist = join(root, 'dist')

await rm(dist, { recursive: true, force: true })
await mkdir(dist, { recursive: true })

// The service worker and the popup are modules; the inspector is a classic script, the only
// kind `chrome.scripting.executeScript` can inject.
const builds = [
  { entrypoints: ['src/background.ts', 'src/popup.ts'], format: 'esm' as const },
  { entrypoints: ['src/content/main.ts'], format: 'iife' as const }
]
for (const build of builds) {
  const result = await Bun.build({
    entrypoints: build.entrypoints.map((entry) => join(root, entry)),
    outdir: dist,
    target: 'browser',
    format: build.format,
    naming: '[name].js',
    minify: true
  })
  if (!result.success) {
    for (const log of result.logs) console.error(log)
    process.exit(1)
  }
}

await cp(join(root, 'manifest.json'), join(dist, 'manifest.json'))
await cp(join(root, 'src/popup.html'), join(dist, 'popup.html'))
await cp(join(root, 'src/popup.css'), join(dist, 'popup.css'))
await cp(join(root, 'icons'), join(dist, 'icons'), { recursive: true })
console.log(`Kalka Snapshot built into ${dist}`)
