/**
 * Starts the packaged app from `electron-builder --dir` and checks that the editor comes up:
 * the window opens, the desktop bridge is there, and the app mounts. On Linux CI it runs under
 * `xvfb-run`. Writes `release/smoke.png` for the job's artifacts.
 *
 * The packaged app refuses `--inspect` (an Electron fuse, `scripts/after-pack.cjs`), which
 * Playwright's Electron launcher needs, so the check starts it itself and attaches over the
 * Chrome DevTools port instead.
 */
import { spawn } from 'node:child_process'
import { existsSync, mkdtempSync, readFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

import { chromium } from '@playwright/test'

/** What the check reads in the editor's window. */
interface EditorPage {
  kalkaNative?: unknown
  document: { getElementById(id: string): { childElementCount: number } | null }
}

const RELEASE = join(import.meta.dirname, '..', 'release')
const TIMEOUT_MS = 60_000

function executable(): string {
  const candidates =
    process.platform === 'darwin'
      ? ['mac-arm64', 'mac', 'mac-universal'].map((dir) =>
          join(RELEASE, dir, 'Kalka.app', 'Contents', 'MacOS', 'Kalka')
        )
      : process.platform === 'win32'
        ? [join(RELEASE, 'win-unpacked', 'Kalka.exe')]
        : [join(RELEASE, 'linux-unpacked', 'kalka')]
  const found = candidates.find((path) => existsSync(path))
  if (!found) throw new Error(`No packaged app in ${RELEASE}; run package:dir first`)
  return found
}

// Its own profile, so an installed Kalka's single-instance lock and settings stay out of it.
const profile = `--user-data-dir=${mkdtempSync(join(tmpdir(), 'kalka-smoke-'))}`
// CI runners have no GPU and run as root on Linux.
const extra = process.platform === 'linux' ? ['--no-sandbox', '--disable-gpu'] : []
const child = spawn(executable(), [profile, '--remote-debugging-port=0', ...extra], {
  stdio: ['ignore', 'ignore', 'pipe']
})

/** The DevTools address Chromium prints once it listens. */
const endpoint = await new Promise<string>((resolve, reject) => {
  let output = ''
  const timer = setTimeout(() => reject(new Error(`No DevTools port after ${TIMEOUT_MS} ms:\n${output}`)), TIMEOUT_MS)
  child.stderr.on('data', (chunk: Buffer) => {
    output += chunk.toString()
    const found = /DevTools listening on (ws:\/\/\S+)/.exec(output)?.[1]
    if (found) {
      clearTimeout(timer)
      resolve(found)
    }
  })
  child.once('exit', (code) => reject(new Error(`Kalka exited with ${code}:\n${output}`)))
})

const browser = await chromium.connectOverCDP(endpoint, { timeout: TIMEOUT_MS })
try {
  const deadline = Date.now() + TIMEOUT_MS
  const editor = async () => {
    for (;;) {
      const page = browser.contexts().flatMap((context) => context.pages())[0]
      if (page) return page
      if (Date.now() > deadline) throw new Error('No window opened')
      await new Promise((resolve) => {
        setTimeout(resolve, 250)
      })
    }
  }
  const page = await editor()
  await page.waitForFunction(
    () => {
      // This script is typed for Node; the check runs in the page.
      const page = globalThis as unknown as EditorPage
      return (
        page.kalkaNative !== undefined &&
        (page.document.getElementById('app')?.childElementCount ?? 0) > 0
      )
    },
    undefined,
    { timeout: TIMEOUT_MS }
  )
  await page.screenshot({ path: join(RELEASE, 'smoke.png') })
  const manifest: unknown = JSON.parse(readFileSync(join(import.meta.dirname, '..', 'package.json'), 'utf8'))
  const version = typeof manifest === 'object' && manifest && 'version' in manifest ? String(manifest.version) : '?'
  console.log(`Kalka ${version} started on ${process.platform}`)
} finally {
  await browser.close().catch(() => undefined)
  child.kill()
}
