// Builds the extension and zips it for the Chrome Web Store:
// extension/release/kalka-snapshot-<version>.zip, with manifest.json at the zip's root.
import { mkdir, rm } from 'node:fs/promises'
import { join } from 'node:path'

import manifest from '../manifest.json'

const root = join(import.meta.dir, '..')
const dist = join(root, 'dist')
const release = join(root, 'release')
const zip = join(release, `kalka-snapshot-${manifest.version}.zip`)

const build = Bun.spawnSync(['bun', join(import.meta.dir, 'build.ts')], {
  stdio: ['ignore', 'inherit', 'inherit']
})
if (build.exitCode !== 0) process.exit(build.exitCode)

await mkdir(release, { recursive: true })
await rm(zip, { force: true })
// `-X` leaves out file attributes the store does not need, so the zip is the same on every run.
const pack = Bun.spawnSync(['zip', '-r', '-X', zip, '.'], {
  cwd: dist,
  stdio: ['ignore', 'ignore', 'inherit']
})
if (pack.exitCode !== 0) process.exit(pack.exitCode)
console.log(`Kalka Snapshot ${manifest.version} packed into ${zip}`)
