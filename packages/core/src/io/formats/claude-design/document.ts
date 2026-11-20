import { fromUint8Array } from 'js-base64'

import type { ExpandedComponent } from './expand'
import type { ClaudeDesignBoard, ClaudeDesignProject } from './project'

/** A board ready for the HTML import: one standalone page and what it could not resolve. */
export interface ClaudeDesignBoardDocument {
  html: string
  /** `/_blob/` ids the page names that the export does not carry. */
  missingBlobs: string[]
  /** Project files the page names by path that the export does not carry. */
  missingFiles: string[]
}

const BLOB_REFERENCE = /(?:\.{0,2}\/)*_blob\/([A-Za-z0-9_-]+)(?:\.[A-Za-z0-9]+)?/g

/** The media type of an uploaded file, read from its first bytes. */
export function blobMediaType(bytes: Uint8Array): string {
  const starts = (...signature: number[]) => signature.every((byte, index) => bytes[index] === byte)
  if (starts(0xff, 0xd8, 0xff)) return 'image/jpeg'
  if (starts(0x89, 0x50, 0x4e, 0x47)) return 'image/png'
  if (starts(0x47, 0x49, 0x46, 0x38)) return 'image/gif'
  if (starts(0x52, 0x49, 0x46, 0x46) && bytes[8] === 0x57 && bytes[9] === 0x45) return 'image/webp'
  if (starts(0x77, 0x4f, 0x46, 0x32)) return 'font/woff2'
  if (starts(0x77, 0x4f, 0x46, 0x46)) return 'font/woff'
  if (starts(0x00, 0x01, 0x00, 0x00) || starts(0x4f, 0x54, 0x54, 0x4f)) return 'font/ttf'
  const head = new TextDecoder().decode(bytes.subarray(0, 256)).trimStart()
  if (head.startsWith('<svg') || (head.startsWith('<?xml') && head.includes('<svg')))
    return 'image/svg+xml'
  return 'application/octet-stream'
}

/** Every `/_blob/<id>` the page names becomes a data URL of the uploaded file. */
function inlineBlobs(html: string, project: ClaudeDesignProject, missing: Set<string>): string {
  const urls = new Map<string, string>()
  return html.replace(BLOB_REFERENCE, (reference, id: string) => {
    const bytes = project.blobs.get(id)
    if (!bytes) {
      missing.add(id)
      return reference
    }
    let url = urls.get(id)
    if (!url) {
      url = `data:${blobMediaType(bytes)};base64,${fromUint8Array(bytes)}`
      urls.set(id, url)
    }
    return url
  })
}

function escapeText(text: string): string {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

/**
 * The path in the project a board's reference names, from the board's folder (or the project's,
 * for one starting with `/`); null for a URL, a data URL or a fragment.
 */
function projectPath(board: ClaudeDesignBoard, reference: string): string | null {
  const ref = reference.trim()
  if (!ref || ref.startsWith('#') || ref.startsWith('//') || /^[a-z][a-z0-9+.-]*:/i.test(ref))
    return null
  const folder = board.file.split('/').slice(0, -1)
  const parts = ref.startsWith('/') ? [] : [...folder]
  for (const part of ref.split(/[?#]/)[0]?.split('/') ?? []) {
    if (part === '..') parts.pop()
    else if (part && part !== '.') parts.push(part)
  }
  return parts.join('/') || null
}

/** A link's stylesheet from the project's own files, its path taken from the board's folder. */
function localStylesheet(project: ClaudeDesignProject, board: ClaudeDesignBoard, href: string) {
  const path = projectPath(board, href)
  return path === null ? undefined : project.texts.get(path)
}

const FILE_REFERENCE = /(\s(?:src|poster)=")([^"]*)(")|(url\(\s*(['"]?))([^'")]+)(\5\s*\))/g

/** Every image or font the page names by its path in the project becomes a data URL of it. */
function inlineProjectFiles(
  html: string,
  project: ClaudeDesignProject,
  board: ClaudeDesignBoard,
  missing: Set<string>
): string {
  const inline = (reference: string) => {
    const path = projectPath(board, reference.replace(/&amp;/g, '&'))
    if (path === null) return null
    const bytes = project.media.get(path)
    if (!bytes) {
      missing.add(path)
      return null
    }
    return `data:${mediaTypeOf(path, bytes)};base64,${fromUint8Array(bytes)}`
  }
  return html.replace(
    FILE_REFERENCE,
    (
      whole,
      attrStart?: string,
      attrValue?: string,
      attrEnd?: string,
      urlStart?: string,
      _quote?: string,
      urlValue?: string,
      urlEnd?: string
    ) => {
      if (attrStart !== undefined) {
        const url = inline(attrValue ?? '')
        return url ? `${attrStart}${url}${attrEnd ?? ''}` : whole
      }
      const url = inline(urlValue ?? '')
      return url ? `${urlStart ?? ''}${url}${urlEnd ?? ''}` : whole
    }
  )
}

const MEDIA_TYPES: Record<string, string> = {
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  gif: 'image/gif',
  webp: 'image/webp',
  avif: 'image/avif',
  svg: 'image/svg+xml',
  bmp: 'image/bmp',
  ico: 'image/x-icon',
  woff2: 'font/woff2',
  woff: 'font/woff',
  ttf: 'font/ttf',
  otf: 'font/otf'
}

/** A project file's media type: what its bytes say, else its extension. */
function mediaTypeOf(path: string, bytes: Uint8Array): string {
  const sniffed = blobMediaType(bytes)
  if (sniffed !== 'application/octet-stream') return sniffed
  return MEDIA_TYPES[path.split('.').pop()?.toLowerCase() ?? ''] ?? sniffed
}

/**
 * A board as a standalone page: its expanded markup, the stylesheets of every component it
 * draws (the project's own inlined, web fonts kept as links), and uploads as data URLs.
 */
export function claudeDesignBoardDocument(
  project: ClaudeDesignProject,
  board: ClaudeDesignBoard,
  expanded: ExpandedComponent
): ClaudeDesignBoardDocument {
  const component = project.components.get(board.component)
  const head: string[] = ['<meta charset="utf-8">', `<title>${escapeText(board.title)}</title>`]
  for (const href of expanded.links) {
    const local = localStylesheet(project, board, href)
    if (local !== undefined) head.push(`<style>${local}</style>`)
    else if (/^https:\/\//i.test(href))
      head.push(`<link rel="stylesheet" href="${href.replace(/"/g, '&quot;')}">`)
  }
  for (const style of expanded.styles) head.push(`<style>${style}</style>`)
  const lang = component?.lang ? ` lang="${component.lang.replace(/"/g, '&quot;')}"` : ''
  const html = `<!doctype html><html${lang}><head>${head.join('')}</head><body>${expanded.html}</body></html>`
  const missing = new Set<string>()
  const missingFiles = new Set<string>()
  return {
    html: inlineProjectFiles(inlineBlobs(html, project, missing), project, board, missingFiles),
    missingBlobs: [...missing],
    missingFiles: [...missingFiles]
  }
}
