import { execFile } from 'node:child_process'
import { mkdir, writeFile } from 'node:fs/promises'
import { homedir } from 'node:os'
import { basename, join } from 'node:path'
import { promisify } from 'node:util'

/** A font file the editor asks to install: its name and bytes. */
export interface InstalledFontFile {
  name: string
  data: Uint8Array | number[]
}

/** Names a font file may be installed under: no folders, a font extension. */
const FONT_FILE = /^[\p{L}\p{N}][\p{L}\p{N}._ -]{0,150}\.(?:ttf|otf)$/iu
/** Fonts larger than this are not fonts a person installs one by one. */
const MAX_FONT_BYTES = 32 * 1024 * 1024
/** TrueType and OpenType files start with one of these. */
const SIGNATURES = ['\u0000\u0001\u0000\u0000', 'OTTO', 'true']

/** Where a person's own fonts go, which needs no administrator: per user, on every system. */
export function userFontFolder(
  platform: NodeJS.Platform = process.platform,
  home = homedir(),
  env: NodeJS.ProcessEnv = process.env
): string {
  if (platform === 'darwin') return join(home, 'Library', 'Fonts')
  if (platform === 'win32')
    return join(env.LOCALAPPDATA ?? join(home, 'AppData', 'Local'), 'Microsoft', 'Windows', 'Fonts')
  return join(env.XDG_DATA_HOME ?? join(home, '.local', 'share'), 'fonts', 'kalka')
}

function bytesOf(file: InstalledFontFile): Uint8Array {
  return file.data instanceof Uint8Array ? file.data : Uint8Array.from(file.data)
}

/** Whether a file is one this installs: a TrueType or OpenType font under a plain name. */
export function isInstallableFont(file: InstalledFontFile): boolean {
  const data = bytesOf(file)
  return (
    FONT_FILE.test(file.name) &&
    basename(file.name) === file.name &&
    data.byteLength > 12 &&
    data.byteLength <= MAX_FONT_BYTES &&
    SIGNATURES.includes(String.fromCharCode(...data.subarray(0, 4)))
  )
}

const run = promisify(execFile)

/** Windows lists a user's fonts in the registry; a file in the folder alone is not loaded. */
async function registerOnWindows(path: string, name: string): Promise<void> {
  await run('reg', [
    'add',
    'HKCU\\Software\\Microsoft\\Windows NT\\CurrentVersion\\Fonts',
    '/v',
    `${name.replace(/\.[^.]+$/, '')} (TrueType)`,
    '/t',
    'REG_SZ',
    '/d',
    path,
    '/f'
  ])
}

/**
 * Installs fonts for the person signed in, where other apps find them. Files that are not
 * TrueType or OpenType fonts are refused, all of them before any is written.
 */
export async function installFonts({
  files
}: {
  files: readonly InstalledFontFile[]
}): Promise<{ installed: string[] }> {
  const refused = files.filter((file) => !isInstallableFont(file)).map((file) => file.name)
  if (refused.length > 0) throw new Error(`Not a font to install: ${refused.join(', ')}`)
  const folder = userFontFolder()
  await mkdir(folder, { recursive: true })
  const installed: string[] = []
  for (const file of files) {
    const path = join(folder, file.name)
    await writeFile(path, bytesOf(file))
    if (process.platform === 'win32') await registerOnWindows(path, file.name)
    installed.push(path)
  }
  return { installed }
}
