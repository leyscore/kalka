import * as v from 'valibot'
import { shallowRef } from 'vue'

export type FolderFileKind = 'html' | 'text' | 'image' | 'binary'

export interface FolderFile {
  path: string
  name: string
  kind: FolderFileKind
  bytes: Uint8Array
  /**
   * A page as Kalka exports it: classes instead of repeated inline styles and none of the
   * editor's `data-kalka-*` attributes. The saved file keeps those to open again as it was.
   */
  clean?: string
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

const ProjectPages = v.object({
  pages: v.array(v.object({ id: v.string(), file: v.string() }))
})

/** The page a file of the folder holds, from the folder's `project.json`; null when it holds none. */
export function pageOfFile(project: string, path: string): string | null {
  const parsed = v.safeParse(v.pipe(v.string(), v.parseJson(), ProjectPages), project)
  if (!parsed.success) return null
  return parsed.output.pages.find((page) => page.file === path)?.id ?? null
}
