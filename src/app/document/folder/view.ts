import { shallowRef } from 'vue'

export type FolderFileKind = 'html' | 'text' | 'image' | 'binary'

export interface FolderFile {
  path: string
  name: string
  kind: FolderFileKind
  bytes: Uint8Array
}

const IMAGE_TYPES: Record<string, string> = {
  avif: 'image/avif',
  gif: 'image/gif',
  jpeg: 'image/jpeg',
  jpg: 'image/jpeg',
  png: 'image/png',
  svg: 'image/svg+xml',
  webp: 'image/webp'
}
const TEXT_EXTENSIONS = new Set(['css', 'js', 'json', 'md', 'mjs', 'ts', 'txt', 'yaml', 'yml'])

function extension(name: string): string {
  return name.includes('.') ? (name.split('.').pop() ?? '').toLowerCase() : ''
}

/** How a file of the folder is shown: as code, as a picture, or only named. */
export function fileKind(name: string): FolderFileKind {
  const ext = extension(name)
  if (ext === 'html' || ext === 'htm') return 'html'
  if (ext in IMAGE_TYPES) return 'image'
  return TEXT_EXTENSIONS.has(ext) ? 'text' : 'binary'
}

/** The media type a picture of the folder is drawn with. */
export function imageType(name: string): string {
  return IMAGE_TYPES[extension(name)] ?? 'application/octet-stream'
}

/** The file open over the canvas, chosen in the folder panel; null when none is. */
export const openFolderFile = shallowRef<FolderFile | null>(null)
