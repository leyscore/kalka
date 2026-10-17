import { existsSync, readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'

const HOST_ENTRY = join('electron', 'dist', 'render-host.js')

/** The render host the desktop app builds, found from this file up to the repository. */
export function hostEntry(): string | null {
  const configured = process.env.KALKA_RENDER_HOST
  if (configured) return existsSync(configured) ? configured : null
  let dir = import.meta.dirname
  for (let depth = 0; depth < 8; depth++) {
    const candidate = join(dir, HOST_ENTRY)
    if (existsSync(candidate)) return candidate
    dir = dirname(dir)
  }
  return null
}

/**
 * Electron's executable, from the `electron` package of the desktop app the render host belongs
 * to: its `path.txt` names the executable inside its `dist` folder.
 */
export function electronExecutable(entry: string): string | null {
  const electronPackage = join(dirname(entry), '..', 'node_modules', 'electron')
  try {
    const relative = readFileSync(join(electronPackage, 'path.txt'), 'utf8').trim()
    const path = join(electronPackage, 'dist', relative)
    return existsSync(path) ? path : null
  } catch {
    return null
  }
}
