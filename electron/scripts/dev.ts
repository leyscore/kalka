/**
 * Runs the desktop app in development: starts the Vite dev server unless one already answers,
 * waits for it, builds the main process, then opens Electron. A change under `src/` rebuilds the
 * main process and reopens Electron, since the page reloads on its own and must not talk to an
 * older main process. Closing Electron stops the server this script started.
 */
import { execFileSync, spawn, type ChildProcess } from 'node:child_process'
import { cpSync, existsSync, rmSync, watch } from 'node:fs'
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

/**
 * macOS names the Dock icon after the bundle that runs, so development launches a copy of
 * Electron's bundle renamed Kalka, with Kalka's icon. Rebuilt when Electron's version changes.
 */
function electronBinary(): string {
  const stock = execFileSync('bun', ['-e', "import p from 'electron'; process.stdout.write(p)"], {
    cwd: electronDir,
    encoding: 'utf8'
  })
  if (process.platform !== 'darwin') return stock
  const source = stock.slice(0, stock.indexOf('/Contents/MacOS/'))
  const version = source.match(/electron@([^/]+)/)?.[1] ?? 'unknown'
  const bundle = join(electronDir, '.dev', version, 'Kalka.app')
  if (!existsSync(bundle)) {
    rmSync(join(electronDir, '.dev'), { recursive: true, force: true })
    cpSync(source, bundle, { recursive: true, verbatimSymlinks: true })
    const plist = join(bundle, 'Contents', 'Info.plist')
    for (const key of ['CFBundleName', 'CFBundleDisplayName'])
      execFileSync('plutil', ['-replace', key, '-string', 'Kalka', plist])
    cpSync(
      join(electronDir, 'build', 'icon.icns'),
      join(bundle, 'Contents', 'Resources', 'electron.icns')
    )
    // Editing the bundle breaks its seal; an ad hoc signature lets macOS run it again.
    execFileSync('codesign', ['--force', '--deep', '--sign', '-', bundle])
  }
  return join(bundle, 'Contents', 'MacOS', 'Electron')
}

const binary = electronBinary()
let electron: ChildProcess
let restarting = false

function open(): void {
  electron = run(binary, ['.'], electronDir, { ...process.env, KALKA_DEV_URL: URL })
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
