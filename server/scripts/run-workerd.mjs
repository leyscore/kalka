// Runs the bundled server with the local workerd binary, as the Docker image does:
//   npm run workerd     (data in ./data, port 8787 unless KALKA_PORT)
import { spawn } from 'node:child_process'
import { mkdirSync } from 'node:fs'
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('..', import.meta.url))
process.env.KALKA_DATA_DIR ??= `${root}data`
mkdirSync(process.env.KALKA_DATA_DIR, { recursive: true })
await import('./workerd-config.mjs')
const workerd = createRequire(import.meta.url).resolve('workerd/bin/workerd')
spawn(workerd, ['serve', 'dist/config.capnp', '--experimental'], { cwd: root, stdio: 'inherit' })
  .on('exit', (code) => process.exit(code ?? 0))
