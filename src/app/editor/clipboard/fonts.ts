import { toUint8Array } from 'js-base64'

import { fontManager } from '@kalka/core/text'
import { weightToStyle } from '@kalka/scene-graph'

/** A font a pasted page carried inside its HTML, as Kalka Snapshot writes it. */
export interface PastedFontFace {
  family: string
  /** The weights it draws, as `@font-face` gives them: one weight, or a variable range. */
  weights: [number, number]
  italic: boolean
  data: ArrayBuffer
}

const FACE_RULE = /@font-face\s*\{([^}]*)\}/g
const DATA_FONT = /url\(\s*["']?data:[^;,"')]*;base64,([A-Za-z0-9+/=]+)["']?\s*\)/

function descriptor(rule: string, name: string): string | undefined {
  return new RegExp(`(?:^|;)\\s*${name}\\s*:\\s*([^;]+)`, 'i').exec(rule)?.[1]?.trim()
}

function weightRange(value: string | undefined): [number, number] {
  if (!value || value === 'normal') return [400, 400]
  if (value === 'bold') return [700, 700]
  const [low = 400, high = low] = value.split(/\s+/).map(Number)
  return [low, high]
}

/**
 * Whether a face draws Latin letters. A site often splits a family into one file per script;
 * only the Latin one can stand for the whole family on the canvas.
 */
function coversLatin(range: string | undefined): boolean {
  if (!range) return true
  return range.split(',').some((part) => {
    const [low = '', high = low] = part.trim().replace(/^U\+/i, '').split('-')
    const start = Number.parseInt(low.replace(/\?/g, '0'), 16)
    const end = Number.parseInt(high.replace(/\?/g, 'F'), 16)
    return start <= 0x61 && end >= 0x7a
  })
}

/** The fonts carried as data in pasted HTML's `@font-face` rules. */
export function pastedFontFaces(html: string): PastedFontFace[] {
  const faces: PastedFontFace[] = []
  for (const [, rule = ''] of html.matchAll(FACE_RULE)) {
    const family = descriptor(rule, 'font-family')?.replace(/^["']|["']$/g, '')
    const data = DATA_FONT.exec(rule)?.[1]
    if (!family || !data || !coversLatin(descriptor(rule, 'unicode-range'))) continue
    const bytes = toUint8Array(data)
    const buffer = new ArrayBuffer(bytes.byteLength)
    new Uint8Array(buffer).set(bytes)
    faces.push({
      family,
      weights: weightRange(descriptor(rule, 'font-weight')),
      italic: /italic|oblique/i.test(descriptor(rule, 'font-style') ?? ''),
      data: buffer
    })
  }
  return faces
}

/**
 * Hands the fonts a pasted page carried to the canvas, at each standard weight they draw, so its
 * layers show in the page's typeface rather than a fallback. A family the document already has
 * keeps its own faces.
 */
export function registerPastedFonts(html: string): void {
  for (const face of pastedFontFaces(html)) {
    const [low, high] = face.weights
    for (let weight = 100; weight <= 900; weight += 100) {
      if (weight < low || weight > high) continue
      const style = weightToStyle(weight, face.italic)
      if (fontManager.isStyleLoaded(face.family, style)) continue
      fontManager.markLoaded(face.family, style, face.data)
    }
    // A variable font draws every weight in its range, not only the standard ones.
    if (low < high) {
      fontManager.addBrowserFace({
        family: face.family,
        weight: `${low} ${high}`,
        style: face.italic ? 'italic' : 'normal',
        data: face.data
      })
    }
  }
}
