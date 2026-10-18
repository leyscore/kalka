import { cp, mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

import {
  closeApp,
  launchApp,
  waitForHome,
  waitForMount,
  type AppSession,
  type AppTarget
} from '../launch'
import type { BenchProfile } from '../profiles'

export interface BenchContext {
  target: AppTarget
  profile: BenchProfile
  /** The built renderer, for sizing what the page loads. */
  dist: string
  /**
   * A profile primed once so no first-run screen shows; every launch starts from a copy, so no
   * launch restores the tabs or caches of the one before.
   */
  primedProfile: string
  /** Idle time before a memory sample, so startup work and GC settle. */
  settleMs: number
  log: (message: string) => void
}

/** Preferences a primed profile starts with: English, every first-run offer already seen. */
const PRIMED_STORAGE = {
  'kalka-locale': 'en',
  'kalka:preferences:v1': JSON.stringify({
    version: 1,
    onboarding: { aiSetup: 'done', welcome: 'done', tour: 'done' }
  })
}

/** Creates a profile directory and runs the app once in it to store the primed preferences. */
export async function primeProfile(target: AppTarget, profile: BenchProfile): Promise<string> {
  const userDataDir = await mkdtemp(join(tmpdir(), 'kalka-bench-'))
  const session = await launchApp(target, { ...profile, cpuThrottle: 1 }, userDataDir)
  try {
    await waitForMount(session.page)
    await session.page.evaluate((entries) => {
      // oxlint-disable-next-line kalka/no-direct-storage-access -- Seeds the app's own preferences before it reads them.
      for (const [key, value] of Object.entries(entries)) localStorage.setItem(key, value)
    }, PRIMED_STORAGE)
    await session.page.reload()
    await waitForMount(session.page)
    await waitForHome(session.page)
  } finally {
    await closeApp(session)
  }
  return userDataDir
}

export async function disposeProfile(userDataDir: string): Promise<void> {
  await rm(userDataDir, { recursive: true, force: true })
}

/** Runs `body` with the app started in the context's profile, and always closes it. */
export async function withApp<T>(
  context: BenchContext,
  body: (session: AppSession) => Promise<T>,
  extraArgs: string[] = []
): Promise<T> {
  const userDataDir = await mkdtemp(join(tmpdir(), 'kalka-bench-run-'))
  await cp(context.primedProfile, userDataDir, { recursive: true })
  const session = await launchApp(context.target, context.profile, userDataDir, extraArgs)
  try {
    return await body(session)
  } finally {
    await closeApp(session)
    await disposeProfile(userDataDir)
  }
}
