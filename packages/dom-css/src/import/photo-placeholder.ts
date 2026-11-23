// The stand-in an `<img data-photo="…">` with no picture shows: a dashed frame in the page's ink
// with a person or a landscape in the middle and the description under it, so it reads at once
// as a photograph still to come. It is drawn at the size the layer measured, so nothing crops it.
import type { Color } from '@kalka/scene-graph'
import { colorToHex } from '@kalka/scene-graph/color'

/** The size a placeholder takes when the element was not measured. */
const FALLBACK_SIZE = { width: 400, height: 300 }
const MIN_FONT_SIZE = 10
const MAX_FONT_SIZE = 18
/** An average glyph width over the font size, for wrapping without a font to measure with. */
const GLYPH_WIDTH = 0.56
const LINE_HEIGHT = 1.35
const FONT_STACK = 'system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif'

/** Words that put a person in the picture, in English and French. */
const PERSON =
  /(?<!\p{L})(person|people|portrait|man|men|woman|women|girl|boy|child|children|kid|kids|family|couple|team|founder|face|headshot|customer|client|staff|chef|doctor|nurse|artisan|baker|barber|student|teacher|athlete|smiling|personne|gens|homme|femme|fille|gar[çc]on|enfant|famille|[ée]quipe|fondat\p{L}*|visage|sourire|souriant)s?(?!\p{L})/iu

export type PhotoSubject = 'person' | 'scene'

export function photoSubject(description: string): PhotoSubject {
  return PERSON.test(description) ? 'person' : 'scene'
}

function escapeXML(text: string): string {
  return text
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
}

/** The description broken into lines that fit `width` at `fontSize`; words longer than a line are cut into pieces. */
export function wrapCaption(text: string, width: number, fontSize: number): string[] {
  const perLine = Math.max(1, Math.floor(width / (fontSize * GLYPH_WIDTH)))
  const lines: string[] = []
  let line = ''
  for (const word of text.split(/\s+/).filter((part) => part.length > 0)) {
    for (let start = 0; start < word.length; start += perLine) {
      const piece = word.slice(start, start + perLine)
      const candidate = line ? `${line} ${piece}` : piece
      if (candidate.length <= perLine) line = candidate
      else {
        lines.push(line)
        line = piece
      }
    }
  }
  if (line) lines.push(line)
  return lines
}

interface CaptionLayout {
  fontSize: number
  lines: string[]
}

/** The largest type size at which the whole description fits the room left under the icon. */
export function layoutCaption(text: string, width: number, height: number): CaptionLayout | null {
  const start = Math.round(Math.min(MAX_FONT_SIZE, Math.max(MIN_FONT_SIZE, width / 20)))
  for (let fontSize = start; fontSize >= MIN_FONT_SIZE; fontSize--) {
    const lines = wrapCaption(text, width, fontSize)
    if (lines.length * fontSize * LINE_HEIGHT <= height) return { fontSize, lines }
  }
  return null
}

function icon(subject: PhotoSubject, cx: number, cy: number, size: number, ink: string): string {
  const s = size / 24
  const stroke = `fill="none" stroke="${ink}" stroke-opacity="0.55" stroke-width="${(1.6 * s).toFixed(2)}" stroke-linecap="round" stroke-linejoin="round"`
  const x = (value: number) => (cx + (value - 12) * s).toFixed(1)
  const y = (value: number) => (cy + (value - 12) * s).toFixed(1)
  if (subject === 'person') {
    return [
      `<circle cx="${x(12)}" cy="${y(8)}" r="${(4 * s).toFixed(1)}" ${stroke}/>`,
      `<path d="M${x(5)} ${y(21)}v-1.5a6 6 0 0 1 6-6h2a6 6 0 0 1 6 6V${y(21)}" ${stroke}/>`
    ].join('')
  }
  return [
    `<rect x="${x(3)}" y="${y(4)}" width="${(18 * s).toFixed(1)}" height="${(16 * s).toFixed(1)}" rx="${(2.5 * s).toFixed(1)}" ${stroke}/>`,
    `<circle cx="${x(15.5)}" cy="${y(9)}" r="${(1.6 * s).toFixed(1)}" ${stroke}/>`,
    `<path d="M${x(3)} ${y(17)}l5-5.5 4.5 4.5 2.5-2.5 6 5" ${stroke}/>`
  ].join('')
}

export interface PhotoPlaceholderOptions {
  description: string
  width?: number
  height?: number
  /** The page's text color; the frame and its marks are drawn in it, faded. */
  ink?: Color | null
}

/** The placeholder as SVG markup, sized to the layer so the caption is never cropped. */
export function photoPlaceholderSVG({
  description,
  width = FALLBACK_SIZE.width,
  height = FALLBACK_SIZE.height,
  ink
}: PhotoPlaceholderOptions): string {
  const w = Math.max(1, Math.round(width))
  const h = Math.max(1, Math.round(height))
  const color = ink ? colorToHex({ ...ink, a: 1 }) : '#808080'
  const pad = Math.max(8, Math.min(w, h) * 0.08)
  const iconSize = Math.max(16, Math.min(48, Math.min(w, h) * 0.22))
  const gap = iconSize * 0.4
  const text = description.replaceAll(/\s+/g, ' ').trim()
  const caption = text ? layoutCaption(text, w - 2 * pad, h - 2 * pad - iconSize - gap) : null
  const captionHeight = caption ? caption.lines.length * caption.fontSize * LINE_HEIGHT : 0
  const blockHeight = iconSize + (caption ? gap + captionHeight : 0)
  const top = (h - blockHeight) / 2
  const parts = [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">`,
    `<rect width="${w}" height="${h}" fill="${color}" fill-opacity="0.07"/>`,
    `<rect x="0.75" y="0.75" width="${w - 1.5}" height="${h - 1.5}" fill="none" stroke="${color}" stroke-opacity="0.35" stroke-width="1.5" stroke-dasharray="6 5"/>`,
    icon(photoSubject(text), w / 2, top + iconSize / 2, iconSize, color)
  ]
  if (caption) {
    const lineHeight = caption.fontSize * LINE_HEIGHT
    const firstBaseline = top + iconSize + gap + caption.fontSize
    parts.push(
      `<text text-anchor="middle" font-family="${FONT_STACK}" font-size="${caption.fontSize}" fill="${color}" fill-opacity="0.7">`,
      ...caption.lines.map(
        (line, index) =>
          `<tspan x="${(w / 2).toFixed(1)}" y="${(firstBaseline + index * lineHeight).toFixed(1)}">${escapeXML(line)}</tspan>`
      ),
      '</text>'
    )
  }
  parts.push('</svg>')
  return parts.join('')
}
