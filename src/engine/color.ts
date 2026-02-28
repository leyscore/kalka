import { parse, formatHex, converter } from 'culori'

import type { Color } from '../types'

const toRgb = converter('rgb')

export function parseColor(input: string): Color {
  const parsed = parse(input)
  if (!parsed) return { r: 0, g: 0, b: 0, a: 1 }
  const rgb = toRgb(parsed)
  return {
    r: rgb?.r ?? 0,
    g: rgb?.g ?? 0,
    b: rgb?.b ?? 0,
    a: parsed.alpha ?? 1
  }
}

export function colorToHex(color: Color): string {
  return (formatHex({ mode: 'rgb', r: color.r, g: color.g, b: color.b }) ?? '#000000').toUpperCase()
}

export function colorToHexRaw(color: Color): string {
  return colorToHex(color).slice(1)
}

export function colorToFill(color: string | Color) {
  const rgba = typeof color === 'string' ? parseColor(color) : color
  return {
    type: 'SOLID' as const,
    color: { r: rgba.r, g: rgba.g, b: rgba.b, a: rgba.a },
    opacity: rgba.a,
    visible: true
  }
}
