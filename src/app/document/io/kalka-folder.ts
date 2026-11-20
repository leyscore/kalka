import * as v from 'valibot'

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
 * Where a save writes the folder's files before any of them replaces the last save's. It is
 * hidden, so listing, opening and git leave it out.
 */
const STAGING_FOLDER = '.kalka-save'
/**
 * Written once every file of a save is staged, listing them all: from then on the save is
 * finished, not dropped, and the list says which earlier pages and images it no longer has.
 */
const STAGING_MANIFEST = '.complete'

const StagedSave = v.object({ files: v.array(v.string()) })

/**
 * Saves a document into its folder without ever leaving it half saved. Every file goes into a
 * hidden staging folder first; once all are there, a manifest says so and each is moved into
 * place, then the pages and images an earlier save left that this one no longer has go, and the
 * instructions folder is added when there is none yet. A crash before the manifest leaves the
 * last save as it was; a crash after it is finished when the folder next opens. Other files in
 * the folder, such as a README or `.git`, stay as they are.
 */
export async function writeKalkaFolderFiles(
  folder: string,
  files: readonly KalkaFile[]
): Promise<void> {
  const { exists, mkdir, remove, writeFile } = await import('@tauri-apps/plugin-fs')
  const staging = joinFolderPath(folder, STAGING_FOLDER)
  await mkdir(folder, { recursive: true })
  if (await exists(staging)) await remove(staging, { recursive: true })
  const folders = new Set(files.map((file) => file.path.split('/').slice(0, -1).join('/')))
  await mkdir(staging, { recursive: true })
  for (const path of folders)
    if (path) await mkdir(joinFolderPath(staging, path), { recursive: true })
  for (const file of files) await writeFile(joinFolderPath(staging, file.path), file.content)
  const manifest = { files: files.map((file) => file.path) }
  await writeFile(
    joinFolderPath(staging, STAGING_MANIFEST),
    new TextEncoder().encode(JSON.stringify(manifest))
  )
  await moveStagedSave(folder, manifest.files)
  // A folder starts with instructions for its agents; later saves leave them to the person.
  const { startInstructions } = await import('@/app/document/instructions/starter')
  await startInstructions(folder)
}

/**
 * Finishes a save a crash interrupted, or drops it when it was not all written, so the folder
 * opens as one save rather than a mix of two. Call it before reading a folder to open it.
 */
export async function finishInterruptedFolderSave(folder: string): Promise<void> {
  const { exists, readFile, remove } = await import('@tauri-apps/plugin-fs')
  const staging = joinFolderPath(folder, STAGING_FOLDER)
  if (!(await exists(staging))) return
  const manifestPath = joinFolderPath(staging, STAGING_MANIFEST)
  const manifest = (await exists(manifestPath))
    ? v.safeParse(
        v.pipe(v.string(), v.parseJson(), StagedSave),
        new TextDecoder().decode(await readFile(manifestPath))
      )
    : null
  if (manifest?.success) await moveStagedSave(folder, manifest.output.files)
  else await remove(staging, { recursive: true })
}

/**
 * Moves a complete staged save into place, removes the pages and images it no longer has, then
 * the staging folder. A save resumed after a crash finds some files moved already.
 */
async function moveStagedSave(folder: string, files: readonly string[]): Promise<void> {
  const { exists, mkdir, remove, rename } = await import('@tauri-apps/plugin-fs')
  const staging = joinFolderPath(folder, STAGING_FOLDER)
  for (const path of files) {
    const from = joinFolderPath(staging, path)
    if (!(await exists(from))) continue
    const parent = path.split('/').slice(0, -1).join('/')
    if (parent) await mkdir(joinFolderPath(folder, parent), { recursive: true })
    await rename(from, joinFolderPath(folder, path))
  }
  const written = new Set(files)
  for (const owned of OWNED_FOLDERS) {
    if (!(await exists(joinFolderPath(folder, owned)))) continue
    for (const path of await listFolderFiles(folder, owned))
      if (!written.has(path)) await remove(joinFolderPath(folder, path))
  }
  await remove(staging, { recursive: true })
}

/** Asks for a folder to open or save a Kalka document in. */
/**
 * Asks where to save a document as a new Kalka folder, the way a Save dialog asks for a file:
 * the person names the folder, which the save then creates. Null when cancelled.
 */
export async function chooseNewKalkaFolder(title: string, name: string): Promise<string | null> {
  const { save } = await import('@tauri-apps/plugin-dialog')
  return save({ title, defaultPath: name })
}

export async function chooseKalkaFolder(title: string): Promise<string | null> {
  const { open } = await import('@tauri-apps/plugin-dialog')
  const picked = await open({ title, directory: true })
  return typeof picked === 'string' ? picked : null
}
