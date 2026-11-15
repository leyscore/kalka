import type { GitChangeKind } from '@/app/document/versions/git'

export interface FolderRow {
  /** The path relative to the document's folder, with `/` between its parts. */
  path: string
  name: string
  depth: number
  kind: 'folder' | 'file'
  /** A file's own change; a folder takes one when anything inside it changed. */
  change: GitChangeKind | null
}

interface Branch {
  folders: Map<string, Branch>
  files: string[]
}

function grow(paths: readonly string[]): Branch {
  const root: Branch = { folders: new Map(), files: [] }
  for (const path of paths) {
    const parts = path.split('/')
    const file = parts.pop()
    if (!file) continue
    let branch = root
    for (const part of parts) {
      let next = branch.folders.get(part)
      if (!next) {
        next = { folders: new Map(), files: [] }
        branch.folders.set(part, next)
      }
      branch = next
    }
    branch.files.push(file)
  }
  return root
}

/**
 * A folder's files as the rows of a tree, folders before files and each in name order. Folders
 * in `collapsed` keep their row and hide what is inside.
 */
export function folderRows(
  paths: readonly string[],
  changes: ReadonlyMap<string, GitChangeKind>,
  collapsed: ReadonlySet<string>
): FolderRow[] {
  const changedFolders = new Set<string>()
  for (const path of changes.keys()) {
    const parts = path.split('/')
    for (let end = 1; end < parts.length; end++) changedFolders.add(parts.slice(0, end).join('/'))
  }

  const rows: FolderRow[] = []
  function walk(branch: Branch, prefix: string, depth: number): void {
    const folders = [...branch.folders.keys()].sort((a, b) => a.localeCompare(b))
    for (const name of folders) {
      const path = prefix ? `${prefix}/${name}` : name
      const change = changedFolders.has(path) ? 'modified' : null
      rows.push({ path, name, depth, kind: 'folder', change })
      const inside = branch.folders.get(name)
      if (inside && !collapsed.has(path)) walk(inside, path, depth + 1)
    }
    for (const name of [...branch.files].sort((a, b) => a.localeCompare(b))) {
      const path = prefix ? `${prefix}/${name}` : name
      rows.push({ path, name, depth, kind: 'file', change: changes.get(path) ?? null })
    }
  }
  walk(grow(paths), '', 0)
  return rows
}

/** The changes Git reports for a repository, keyed by path relative to the document's folder. */
export function folderChanges(
  files: readonly { path: string; status: string }[],
  root: string,
  folder: string,
  kindOf: (status: string) => GitChangeKind
): Map<string, GitChangeKind> {
  const normalize = (path: string) => path.replaceAll('\\', '/').replace(/\/+$/, '')
  const base = normalize(root)
  const own = normalize(folder)
  const changes = new Map<string, GitChangeKind>()
  if (own !== base && !own.startsWith(`${base}/`)) return changes
  const prefix = own === base ? '' : `${own.slice(base.length + 1)}/`
  for (const file of files) {
    if (!file.path.startsWith(prefix)) continue
    changes.set(file.path.slice(prefix.length).replace(/\/+$/, ''), kindOf(file.status))
  }
  return changes
}
