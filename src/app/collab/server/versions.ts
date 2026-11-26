import type { EditorStore } from '@/app/editor/active-store'

import { withServerSession } from './account'
import { serverAPI, type ServerVersion } from './api'
import { saveServerFile } from './documents'

/**
 * The version history of a server file, as Figma keeps one for every file: the server keeps a
 * version every half hour the file is saved, versions named by hand, and the version before a
 * restore. A restore becomes the file and waits, as a merge does, for every open window to apply
 * it, so everyone in the file sees it as one change.
 */

export function listServerVersions(roomId: string): Promise<ServerVersion[]> {
  return withServerSession((url, token) => serverAPI.versions(url, token, roomId))
}

/** Saves what is on screen, then names it as a version. */
export async function saveServerVersion(
  roomId: string,
  store: EditorStore,
  label: string
): Promise<ServerVersion> {
  await saveServerFile(roomId, store)
  return withServerSession((url, token) => serverAPI.saveVersion(url, token, roomId, label))
}

/** A version's file, read as a document to look at. */
export async function readServerVersion(roomId: string, version: ServerVersion) {
  const bytes = await withServerSession((url, token) =>
    serverAPI.versionFile(url, token, roomId, version.id)
  )
  if (!bytes) throw new Error('This version is no longer on the server.')
  const { readKalkaArchive } = await import('@kalka/core/io/formats/kalka')
  return readKalkaArchive(bytes)
}

/** Saves what is on screen, which the server keeps under `before`, then restores the version. */
export async function restoreServerVersion(
  roomId: string,
  store: EditorStore,
  version: ServerVersion,
  before: string
): Promise<void> {
  await saveServerFile(roomId, store)
  await withServerSession((url, token) =>
    serverAPI.restoreVersion(url, token, roomId, version.id, before)
  )
}
