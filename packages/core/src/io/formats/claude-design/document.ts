import { fromUint8Array } from 'js-base64'

import type { ExpandedComponent } from './expand'
import type { ClaudeDesignBoard, ClaudeDesignProject } from './project'

/** A board ready for the HTML import: one standalone page and what it could not resolve. */
export interface ClaudeDesignBoardDocument {
  html: string
  /** `/_blob/` ids the page names that the export does not carry. */
  missingBlobs: string[]
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

/** A link's stylesheet from the project's own files, its path taken from the board's folder. */
function localStylesheet(project: ClaudeDesignProject, board: ClaudeDesignBoard, href: string) {
  if (/^[a-z][a-z0-9+.-]*:/i.test(href) || href.startsWith('//')) return undefined
  const folder = board.file.split('/').slice(0, -1)
  const parts = href.startsWith('/') ? [] : [...folder]
  for (const part of href.split(/[?#]/)[0]?.split('/') ?? []) {
    if (part === '..') parts.pop()
    else if (part && part !== '.') parts.push(part)
  }
  return project.texts.get(parts.join('/'))
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
  return { html: inlineBlobs(html, project, missing), missingBlobs: [...missing] }
}
