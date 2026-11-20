import { readFigFile } from '@kalka/core/io/formats/fig'

import { readKalkaFolderAsFile } from '@/app/document/io/kalka-folder'
import type { DocumentFileFormat } from '@/app/document/io/types'
import { isTauri } from '@/app/tauri/env'

export type ReloadSourceOptions = {
  documentName: string
  /** The format the document is saved in, which is also how it is read back. */
  format: DocumentFileFormat
  filePath: string | null
  fileHandle: FileSystemFileHandle | null
  signal?: AbortSignal
}

async function readSourceFile({
  documentName,
  format,
  filePath,
  fileHandle
}: ReloadSourceOptions): Promise<File | null> {
  if (filePath && isTauri()) {
    if (format === 'kalka-folder') return readKalkaFolderAsFile(filePath)
    const { readFile: tauriRead } = await import('@tauri-apps/plugin-fs')
    const bytes = await tauriRead(filePath)
    return new File([new Blob([bytes])], `${documentName}.${format}`)
  }
  return fileHandle ? fileHandle.getFile() : null
}

export async function readReloadSource(options: ReloadSourceOptions) {
  const { signal } = options
  signal?.throwIfAborted()
  const file = await readSourceFile(options)
  signal?.throwIfAborted()
  if (!file) return null
  if (options.format === 'fig') return readFigFile(file, { populate: 'first-page', signal })
  const { readKalkaArchive } = await import('@kalka/core/io/formats/kalka')
  return readKalkaArchive(new Uint8Array(await file.arrayBuffer()))
}
