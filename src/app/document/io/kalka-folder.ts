import { zipKalkaFiles, type KalkaFile } from '@kalka/core/io/formats/kalka'

/** Folders a Kalka document owns and rewrites on every save; files in them that are no longer saved go. */
const OWNED_FOLDERS = ['pages', 'assets/images']

function join(folder: string, path: string): string {
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

async function listFiles(folder: string, prefix = ''): Promise<string[]> {
  const { readDir } = await import('@tauri-apps/plugin-fs')
  const paths: string[] = []
  for (const entry of await readDir(join(folder, prefix))) {
    // Git's own files, and anything hidden, are not the document's.
    if (entry.name.startsWith('.')) continue
    const path = prefix ? `${prefix}/${entry.name}` : entry.name
    if (entry.isDirectory) paths.push(...(await listFiles(folder, path)))
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
  for (const path of await listFiles(folder))
    files.push({ path, content: await readFile(join(folder, path)) })
  const archive = zipKalkaFiles(files, { level: 0 })
  return new File([archive.slice().buffer], `${folderName(folder)}.kalka`, {
    type: 'application/zip'
  })
}

/**
 * Saves a document into its folder: every file it writes, then the pages and images an earlier
 * save left that this one no longer has. Other files in the folder, such as a README or `.git`,
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
  for (const path of folders) if (path) await mkdir(join(folder, path), { recursive: true })
  for (const file of files) await writeFile(join(folder, file.path), file.content)
  for (const owned of OWNED_FOLDERS) {
    if (!(await exists(join(folder, owned)))) continue
    for (const path of await listFiles(folder, owned))
      if (!written.has(path)) await remove(join(folder, path))
  }
}

/** Asks for a folder to open or save a Kalka document in. */
export async function chooseKalkaFolder(title: string): Promise<string | null> {
  const { open } = await import('@tauri-apps/plugin-dialog')
  const picked = await open({ title, directory: true })
  return typeof picked === 'string' ? picked : null
}
