import type { KalkaFile } from '@kalka/core/io/formats/kalka'

import type { StorageDocumentBinding } from '@/app/integrations/storage/types'

/** What a document saves as: a `.fig` file, a `.kalka` file, or a Kalka folder. */
export type DocumentFileFormat = 'fig' | 'kalka' | 'kalka-folder'

/** A saved document: one file's bytes, or the files of a Kalka folder. */
export type DocumentPayload = Uint8Array | { kind: 'folder'; files: readonly KalkaFile[] }

/** The format a chosen file name saves as. */
export function fileFormatForName(name: string): DocumentFileFormat {
  return name.toLowerCase().endsWith('.kalka') ? 'kalka' : 'fig'
}

export type DocumentSourceIdentity = Readonly<{
  handle: FileSystemFileHandle | null
  path: string | null
}>

export type DocumentSourceAccess = {
  getFileHandle: () => FileSystemFileHandle | null
  setFileHandle: (handle: FileSystemFileHandle | null) => void
  getFilePath: () => string | null
  setFilePath: (path: string | null) => void
  getDownloadName: () => string | null
  setDownloadName: (name: string | null) => void
  getStorageBinding: () => StorageDocumentBinding | null
  setStorageBinding: (binding: StorageDocumentBinding | null) => void
  setSourceIdentity: (identity: DocumentSourceIdentity) => void
  getSavedVersion: () => number
  setSavedVersion: (version: number) => void
  setLastWriteTime: (time: number) => void
}

export type ViewportSize = { width: number; height: number }
