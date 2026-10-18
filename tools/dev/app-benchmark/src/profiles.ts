/** How a run treats the machine: as it is, or slowed down to look like an old one. */
export interface BenchProfile {
  name: string
  description: string
  /** `Emulation.setCPUThrottlingRate` applied to the editor's renderer. */
  cpuThrottle: number
  /** Chromium switches the app starts with. */
  switches: string[]
}

/**
 * A 1–2 GB machine keeps about half of its memory for the OS and a browser; caps V8's old space
 * so a leak or a large heap fails here before it swaps there.
 */
const OLD_MACHINE_SWITCHES = ['--disable-gpu', '--js-flags=--max-old-space-size=512']

export const PROFILES: Record<string, BenchProfile> = {
  modern: {
    name: 'modern',
    description: 'No throttling, hardware GPU',
    cpuThrottle: 1,
    switches: []
  },
  'old-4x': {
    name: 'old-4x',
    description: 'CPU ×4 slower, GPU disabled, renderer V8 old space capped at 512 MB',
    cpuThrottle: 4,
    switches: OLD_MACHINE_SWITCHES
  },
  'old-6x': {
    name: 'old-6x',
    description: 'CPU ×6 slower, GPU disabled, renderer V8 old space capped at 512 MB',
    cpuThrottle: 6,
    switches: OLD_MACHINE_SWITCHES
  }
}

export function profileNamed(name: string): BenchProfile {
  const profile = PROFILES[name]
  if (!profile) throw new Error(`Unknown profile ${name}; use ${Object.keys(PROFILES).join(', ')}`)
  return profile
}
