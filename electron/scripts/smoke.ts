/**
 * Starts the packaged app from `electron-builder --dir` and checks that the editor comes up:
 * the window opens, the desktop bridge is there, and the app mounts. On Linux CI it runs under
 * `xvfb-run`. Writes `release/smoke.png` for the job's artifacts.
 */
import { existsSync, mkdtempSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

import { _electron as electron } from '@playwright/test'

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
const app = await electron.launch({
  executablePath: executable(),
  // CI runners have no GPU and run as root on Linux.
  args: process.platform === 'linux' ? [profile, '--no-sandbox', '--disable-gpu'] : [profile],
  timeout: TIMEOUT_MS
})
try {
  const page = await app.firstWindow({ timeout: TIMEOUT_MS })
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
  const version = await app.evaluate(({ app: electronApp }) => electronApp.getVersion())
  console.log(`Kalka ${version} started on ${process.platform}`)
} finally {
  await app.close()
}
