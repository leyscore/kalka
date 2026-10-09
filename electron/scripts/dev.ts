/**
 * Runs the desktop app in development: starts the Vite dev server unless one already answers,
 * waits for it, builds the main process, then opens Electron. Closing Electron stops the server
 * this script started.
 */
import { spawn, type ChildProcess } from 'node:child_process'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const URL = process.env.KALKA_DEV_URL ?? 'http://localhost:1420'
const electronDir = join(dirname(fileURLToPath(import.meta.url)), '..')
const root = join(electronDir, '..')

async function answers(): Promise<boolean> {
  try {
    return (await fetch(URL)).ok
  } catch {
    return false
  }
}

function run(command: string, args: string[], cwd: string, env = process.env): ChildProcess {
  return spawn(command, args, { cwd, env, stdio: 'inherit' })
}

let server: ChildProcess | null = null
if (!(await answers())) {
  console.log(`[kalka] Starting the dev server on ${URL}…`)
  server = run('bun', ['run', 'dev'], root)
  const deadline = Date.now() + 120_000
  while (!(await answers())) {
    if (server.exitCode !== null) {
      console.error('[kalka] The dev server exited before it was ready.')
      process.exit(1)
    }
    if (Date.now() > deadline) {
      console.error('[kalka] The dev server did not answer within two minutes.')
      server.kill()
      process.exit(1)
    }
    await new Promise((resolve) => setTimeout(resolve, 300))
  }
}

const build = run('bun', ['run', 'build'], electronDir)
await new Promise((resolve) => build.once('exit', resolve))
if (build.exitCode !== 0) {
  server?.kill()
  process.exit(build.exitCode ?? 1)
}

const electron = run('bunx', ['electron', '.'], electronDir, { ...process.env, KALKA_DEV_URL: URL })
const stop = () => {
  electron.kill()
  server?.kill()
}
process.on('SIGINT', stop)
process.on('SIGTERM', stop)
electron.once('exit', (code) => {
  server?.kill()
  process.exit(code ?? 0)
})
