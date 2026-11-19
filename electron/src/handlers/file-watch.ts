import { existsSync, watch, type FSWatcher } from 'node:fs'
import { basename, dirname } from 'node:path'

export type FileChange = 'modify' | 'remove'

/**
 * Reports changes to a file, at most once per `delayMs`. It watches the file's folder for its
 * name rather than the file itself: git, many editors and Kalka's own saves replace a file by
 * renaming a new one over it, and a watch on the file would follow the replaced copy and stay
 * silent from then on. A change reads as a removal when the file is gone once it settles.
 */
export function watchFileChanges(
  path: string,
  delayMs: number,
  onChange: (change: FileChange) => void
): () => void {
  const name = basename(path)
  let timer: NodeJS.Timeout | null = null
  let watcher: FSWatcher | null = watch(dirname(path), (_kind, changed) => {
    // Some platforms do not say which entry changed; then it may be this one.
    if (changed !== null && changed.toString() !== name) return
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => {
      timer = null
      onChange(existsSync(path) ? 'modify' : 'remove')
    }, delayMs)
  })
  // A watched folder that goes away reports an error; nothing else of the app may fail with it.
  watcher.on('error', () => stop())

  function stop() {
    if (timer) clearTimeout(timer)
    timer = null
    watcher?.close()
    watcher = null
  }
  return stop
}
