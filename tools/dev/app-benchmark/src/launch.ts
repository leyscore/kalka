import { execFile } from 'node:child_process'
import { existsSync } from 'node:fs'
import { join } from 'node:path'
import { promisify } from 'node:util'

import {
  _electron as electron,
  type CDPSession,
  type ElectronApplication,
  type Page
} from '@playwright/test'

import { descendants, parsePs } from './processes'
import type { BenchProfile } from './profiles'
import { pause } from './stats'

const run = promisify(execFile)
const TIMEOUT_MS = 120_000
/** The active editor's canvas; tabs in the background keep theirs hidden. */
export const CANVAS = '[data-test-id="canvas-element"]:visible'
const CLOSE_TIMEOUT_MS = 10_000

/** Which build runs: the packaged app, or the workspace build Electron loads from `dist`. */
export interface AppTarget {
  /** The packaged app's binary; null runs `electron/` on the workspace build. */
  executablePath: string | null
  electronDir: string
}

export function resolveTarget(root: string, packaged: string | null): AppTarget {
  const electronDir = join(root, 'electron')
  if (packaged) {
    if (!existsSync(packaged)) throw new Error(`No app at ${packaged}`)
    return { executablePath: packaged, electronDir }
  }
  for (const file of ['dist/main.js', 'dist/preload.cjs', 'dist/mcp/index.js'])
    if (!existsSync(join(electronDir, file)))
      throw new Error(`electron/${file} is missing; run \`bun run --cwd electron build\``)
  if (!existsSync(join(root, 'dist', 'index.html')))
    throw new Error('dist/index.html is missing; run `bun run build`')
  return { executablePath: null, electronDir }
}

export interface AppSession {
  app: ElectronApplication
  page: Page
  cdp: CDPSession
  /** `performance.now()` in this process when the launch started. */
  launchedAt: number
  /** Milliseconds from launch to the first window. */
  firstWindowMs: number
}

/** Starts the app with `profile`'s switches and throttles its renderer as soon as it has one. */
export async function launchApp(
  target: AppTarget,
  profile: BenchProfile,
  userDataDir: string,
  extraArgs: string[] = []
): Promise<AppSession> {
  const args = [
    ...(target.executablePath ? [] : ['.']),
    `--user-data-dir=${userDataDir}`,
    '--lang=en-US',
    ...profile.switches,
    ...extraArgs
  ]
  // The workspace build, never a dev server a developer left in the environment.
  const env = Object.fromEntries(
    Object.entries(process.env).flatMap(([key, value]) =>
      value === undefined || key === 'KALKA_DEV_URL' ? [] : [[key, value]]
    )
  )
  const launchedAt = performance.now()
  const app = await electron.launch({
    ...(target.executablePath
      ? { executablePath: target.executablePath }
      : { cwd: target.electronDir }),
    args,
    env,
    timeout: TIMEOUT_MS
  })
  const page = await app.firstWindow({ timeout: TIMEOUT_MS })
  const firstWindowMs = performance.now() - launchedAt
  const cdp = await page.context().newCDPSession(page)
  if (profile.cpuThrottle > 1)
    await cdp.send('Emulation.setCPUThrottlingRate', { rate: profile.cpuThrottle })
  await cdp.send('Performance.enable')
  return { app, page, cdp, launchedAt, firstWindowMs }
}

/** Whether `pid` is a live process: signal 0 checks without sending anything. */
function isRunning(pid: number): boolean {
  try {
    process.kill(pid, 0)
    return true
  } catch (error) {
    return !(error instanceof Error && 'code' in error && error.code === 'ESRCH')
  }
}

/** Closes the app and kills what it started that outlives it, such as the MCP server. */
export async function closeApp(session: AppSession): Promise<void> {
  const root = session.app.process().pid
  let started: number[] = []
  if (root !== undefined) {
    const { stdout } = await run('ps', ['-A', '-o', 'pid=,ppid=,rss=,command='], {
      maxBuffer: 16 * 1024 * 1024
    })
    started = descendants(parsePs(stdout), root).map((row) => row.pid)
  }
  // A document with edits asks before closing; the bench never answers, so it stops waiting.
  await Promise.race([session.app.close().catch(() => undefined), pause(CLOSE_TIMEOUT_MS)])
  for (const pid of started) {
    // A process that already exited cannot be killed, which is the outcome wanted.
    if (isRunning(pid)) process.kill(pid, 'SIGKILL')
  }
}

/** Waits until the first page mounted the app. */
export async function waitForMount(page: Page): Promise<void> {
  await page.waitForFunction(
    () => (document.getElementById('app')?.childElementCount ?? 0) > 0,
    undefined,
    {
      timeout: TIMEOUT_MS
    }
  )
}

/** The home screen has rendered: New design is there, under the boot splash if it still shows. */
export async function waitForHomeRendered(page: Page): Promise<void> {
  await page
    .getByRole('button', { name: /^New design/ })
    .first()
    .waitFor({ timeout: TIMEOUT_MS })
}

/** The boot splash, which fades once the first screen is painted, is gone. */
export async function waitForSplashGone(page: Page): Promise<void> {
  await page.locator('#boot-splash').waitFor({ state: 'detached', timeout: TIMEOUT_MS })
}

/** The home screen can be used: rendered, and the splash no longer covers it. */
export async function waitForHome(page: Page): Promise<void> {
  await waitForHomeRendered(page)
  await waitForSplashGone(page)
}

/** An editor tab can be used: its canvas exists and nothing is loading. */
export async function waitForEditor(page: Page): Promise<void> {
  await page.locator(CANVAS).waitFor({ timeout: TIMEOUT_MS })
  await page.getByTestId('canvas-loading').waitFor({ state: 'hidden', timeout: TIMEOUT_MS })
}

/**
 * The canvas shows the document: every artboard iframe has loaded its document and fonts, and two
 * frames have passed with nothing left to apply.
 */
export async function waitForSettledCanvas(page: Page, minimumArtboards = 0): Promise<void> {
  await page.waitForFunction(
    async (minimum) => {
      const frames = [
        ...document.querySelectorAll<HTMLIFrameElement>('iframe[data-kalka-artboard]')
      ]
      if (frames.length < minimum) return false
      for (const frame of frames) {
        const doc = frame.contentDocument
        if (doc?.readyState !== 'complete' || !doc.querySelector('meta[http-equiv]')) return false
        if (doc.fonts.status !== 'loaded') return false
      }
      await new Promise(requestAnimationFrame)
      await new Promise(requestAnimationFrame)
      return true
    },
    minimumArtboards,
    { timeout: TIMEOUT_MS, polling: 100 }
  )
}

/** Opens a document the way the Finder hands one over, in the running app. */
export async function openInApp(session: AppSession, path: string): Promise<void> {
  await session.app.evaluate(({ app }, file) => {
    app.emit('open-file', { preventDefault: () => undefined }, file)
  }, path)
}

export async function idle(page: Page, ms: number): Promise<void> {
  await page.waitForTimeout(ms)
}

/** The editor window's renderer and the GPU process, whose threads a trace breakdown reads. */
export async function traceProcesses(
  session: AppSession
): Promise<{ renderer: number; gpu: number | null }> {
  return session.app.evaluate(({ app, BrowserWindow }) => {
    const window = BrowserWindow.getAllWindows().find((candidate) => candidate.isVisible())
    const gpu = app.getAppMetrics().find((metric) => metric.type === 'GPU')
    return { renderer: window?.webContents.getOSProcessId() ?? -1, gpu: gpu?.pid ?? null }
  })
}
