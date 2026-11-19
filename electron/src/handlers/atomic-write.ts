import { chmod, open, realpath, rename, rm, stat } from 'node:fs/promises'
import { basename, dirname, join } from 'node:path'

let writes = 0

/**
 * Writes a file so that it is never seen half written: the bytes go to a hidden file beside it,
 * flushed to disk, which is then renamed over it. A crash, a full disk or a failed write leaves
 * the file as it was. A symbolic link stays a link, its target replaced, and the file keeps its
 * permissions.
 */
export async function writeFileAtomically(path: string, data: Uint8Array): Promise<void> {
  const target = await realpath(path).catch(() => path)
  const mode = await stat(target).then(
    (stats) => stats.mode & 0o777,
    () => null
  )
  const temporary = join(
    dirname(target),
    `.${basename(target)}.${process.pid}-${++writes}.kalka-write`
  )
  try {
    const handle = await open(temporary, 'wx', mode ?? 0o666)
    try {
      await handle.writeFile(data)
      await handle.sync()
    } finally {
      await handle.close()
    }
    if (mode !== null) await chmod(temporary, mode)
    await rename(temporary, target)
  } catch (error) {
    await rm(temporary, { force: true })
    throw error
  }
}
