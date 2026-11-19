import { KALKA_PROJECT_FILE, zipKalkaFiles, type KalkaFile } from '@kalka/core/io/formats/kalka'

/** Folders a Kalka document owns and rewrites on every save; files in them that are no longer saved go. */
const OWNED_FOLDERS = ['pages', 'assets/images']

/** A path inside a folder, with the separators the folder's own path uses. */
export function joinFolderPath(folder: string, path: string): string {
  const separator = folder.includes('\\') && !folder.includes('/') ? '\\' : '/'
  return [folder.replace(/[\\/]+$/, ''), ...path.split('/')].join(separator)
}

export function folderName(path: string): string {
  return (
    path
      .replace(/[\\/]+$/, '')
      .split(/[\\/]/)
      .pop() || 'Untitled'
  )
}

/** Whether a Kalka document's path is its folder rather than a `.kalka` file. */
export function isKalkaFolderPath(path: string | null): boolean {
  return !!path && !path.toLowerCase().endsWith('.kalka')
}

/**
 * Whether a document may be saved into a folder as a Kalka folder: an empty one, or a Kalka
 * folder already. Saving rewrites `pages/` and `assets/images/` and removes what it did not
 * write there, so a folder holding other files, such as a website project, is refused. Hidden
 * files, such as `.git`, do not count.
 */
export async function canHoldKalkaFolder(folder: string): Promise<boolean> {
  const { exists, readDir } = await import('@tauri-apps/plugin-fs')
  if (!(await exists(folder))) return true
  const names = (await readDir(folder))
    .map((entry) => entry.name)
    .filter((name) => !name.startsWith('.'))
  return names.length === 0 || names.includes(KALKA_PROJECT_FILE)
}

/** Every file of a folder, as paths relative to it with `/` between their parts. */
export async function listFolderFiles(folder: string, prefix = ''): Promise<string[]> {
  const { readDir } = await import('@tauri-apps/plugin-fs')
  const paths: string[] = []
  for (const entry of await readDir(joinFolderPath(folder, prefix))) {
    // Git's own files, and anything hidden, are not the document's.
    if (entry.name.startsWith('.')) continue
    const path = prefix ? `${prefix}/${entry.name}` : entry.name
    if (entry.isDirectory) paths.push(...(await listFolderFiles(folder, path)))
    else if (entry.isFile) paths.push(path)
  }
  return paths
}

/**
 * A Kalka folder as one `.kalka` file, so it opens through the same path as a `.kalka` file
 * does. The files are stored, not compressed: the archive never leaves memory.
 */
export async function readKalkaFolderAsFile(folder: string): Promise<File> {
  const { readFile } = await import('@tauri-apps/plugin-fs')
  const files: KalkaFile[] = []
  for (const path of await listFolderFiles(folder))
    files.push({ path, content: await readFile(joinFolderPath(folder, path)) })
  const archive = zipKalkaFiles(files, { level: 0 })
  return new File([archive.slice().buffer], `${folderName(folder)}.kalka`, {
    type: 'application/zip'
  })
}

/**
 * Saves a document into its folder: every file it writes, then the pages and images an earlier
 * save left that this one no longer has, and the instructions folder when there is none yet. Other files in the folder, such as a README or `.git`,
 * stay as they are.
 */
export async function writeKalkaFolderFiles(
  folder: string,
  files: readonly KalkaFile[]
): Promise<void> {
  const { exists, mkdir, remove, writeFile } = await import('@tauri-apps/plugin-fs')
  const written = new Set(files.map((file) => file.path))
  const folders = new Set(files.map((file) => file.path.split('/').slice(0, -1).join('/')))
  await mkdir(folder, { recursive: true })
  for (const path of folders)
    if (path) await mkdir(joinFolderPath(folder, path), { recursive: true })
  for (const file of files) await writeFile(joinFolderPath(folder, file.path), file.content)
  for (const owned of OWNED_FOLDERS) {
    if (!(await exists(joinFolderPath(folder, owned)))) continue
    for (const path of await listFolderFiles(folder, owned))
      if (!written.has(path)) await remove(joinFolderPath(folder, path))
  }
  // A folder starts with instructions for its agents; later saves leave them to the person.
  const { startInstructions } = await import('@/app/document/instructions/starter')
  await startInstructions(folder)
}

/** Asks for a folder to open or save a Kalka document in. */
export async function chooseKalkaFolder(title: string): Promise<string | null> {
  const { open } = await import('@tauri-apps/plugin-dialog')
  const picked = await open({ title, directory: true })
  return typeof picked === 'string' ? picked : null
}
