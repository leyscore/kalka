import { unzipSync, zipSync, type Zippable } from 'fflate'

import type { SceneGraph } from '@open-pencil/scene-graph'

import { PROJECT_FILE } from './constants'
import { readKalkaFolder, writeKalkaFolder, type KalkaFile } from './folder'

/** A fixed date for every entry, so zipping the same folder twice gives the same bytes. */
const ENTRY_DATE = new Date(Date.UTC(2026, 0, 1))

/** Folder files as a `.kalka` archive: the same folder, zipped, to send as one file. */
export function zipKalkaFiles(
  files: readonly KalkaFile[],
  { level = 6 }: { level?: 0 | 6 } = {}
): Uint8Array {
  const entries: Zippable = {}
  for (const file of files) entries[file.path] = [file.content, { mtime: ENTRY_DATE }]
  return zipSync(entries, { level })
}

/**
 * The files of a `.kalka` archive by path. An archive made by zipping the folder itself keeps
 * it as one top-level directory; its files are read relative to it.
 */
export function unzipKalkaFiles(data: Uint8Array): Map<string, Uint8Array> {
  const entries = Object.entries(unzipSync(data)).filter(([path]) => !path.endsWith('/'))
  const project = entries.find(
    ([path]) => path === PROJECT_FILE || path.endsWith(`/${PROJECT_FILE}`)
  )
  if (!project) throw new Error('Not a Kalka file: project.json is missing')
  const prefix = project[0].slice(0, -PROJECT_FILE.length)
  return new Map(
    entries
      .filter(([path]) => path.startsWith(prefix))
      .map(([path, bytes]) => [path.slice(prefix.length), bytes])
  )
}

export async function writeKalkaArchive(graph: SceneGraph): Promise<Uint8Array> {
  return zipKalkaFiles(await writeKalkaFolder(graph))
}

export function readKalkaArchive(data: Uint8Array): SceneGraph {
  return readKalkaFolder(unzipKalkaFiles(data))
}
