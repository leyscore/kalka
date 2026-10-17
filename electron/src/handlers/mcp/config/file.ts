import { chmod, copyFile, mkdir, readFile, rename, stat, writeFile } from 'node:fs/promises'
import { dirname } from 'node:path'

import { parseConfig, serversAt, setServer, type ConfigSyntax, type ServerEdit } from './edit'

/** Suffix of the copy kept beside a client's file before Kalka changes it. */
export const BACKUP_SUFFIX = '.kalka-backup'

/** The file's text, or null when there is no file yet. */
export async function readText(path: string): Promise<string | null> {
  try {
    return await readFile(path, 'utf8')
  } catch {
    return null
  }
}

/**
 * Stores a server entry in a client's file. An unchanged entry writes nothing; otherwise the
 * previous file is copied beside it, and the new text replaces it in one rename with the same
 * permissions, since some clients keep tokens in the same file.
 */
export async function writeServer(
  file: string,
  edit: ServerEdit
): Promise<'written' | 'unchanged'> {
  const existing = await readText(file)
  const next = setServer(existing ?? '', edit)
  if (existing !== null && next === existing) return 'unchanged'
  await mkdir(dirname(file), { recursive: true })
  const mode = existing === null ? null : (await stat(file)).mode & 0o777
  if (existing !== null) await copyFile(file, `${file}${BACKUP_SUFFIX}`)
  const temporary = `${file}.kalka-${process.pid}`
  await writeFile(temporary, next, 'utf8')
  if (mode !== null) await chmod(temporary, mode)
  await rename(temporary, file)
  return 'written'
}

/** Whether the file lists a server called `name`; a missing or unreadable file lists none. */
export async function hasServer(
  file: string,
  syntax: ConfigSyntax,
  path: readonly string[],
  name: string
): Promise<boolean> {
  const text = await readText(file)
  if (!text) return false
  try {
    return name in serversAt(parseConfig(syntax, text), path)
  } catch {
    return false
  }
}
