/**
 * Runs the desktop app in development: starts the Vite dev server unless one already answers,
 * waits for it, builds the main process, then opens Electron. A change under `src/` rebuilds the
 * main process and reopens Electron, since the page reloads on its own and must not talk to an
 * older main process. Closing Electron stops the server this script started.
 */
import { spawn, type ChildProcess } from 'node:child_process'
import { watch } from 'node:fs'
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

async function build(): Promise<boolean> {
  const child = run('bun', ['run', 'build'], electronDir)
  await new Promise((resolve) => child.once('exit', resolve))
  return child.exitCode === 0
}

if (!(await build())) {
  server?.kill()
  process.exit(1)
}

let electron: ChildProcess
let restarting = false

function open(): void {
  electron = run('bunx', ['electron', '.'], electronDir, { ...process.env, KALKA_DEV_URL: URL })
  electron.once('exit', (code) => {
    if (restarting) return
    server?.kill()
    process.exit(code ?? 0)
  })
}

let pending: ReturnType<typeof setTimeout> | undefined
watch(join(electronDir, 'src'), { recursive: true }, () => {
  clearTimeout(pending)
  pending = setTimeout(async () => {
    console.log('[kalka] The main process changed; rebuilding and reopening Electron…')
    if (!(await build())) return
    restarting = true
    electron.once('exit', () => {
      restarting = false
      open()
    })
    electron.kill()
  }, 200)
})

open()
const stop = () => {
  electron.kill()
  server?.kill()
}
process.on('SIGINT', stop)
process.on('SIGTERM', stop)
