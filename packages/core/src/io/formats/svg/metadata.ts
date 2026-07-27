import type { Rect, Size } from '@open-pencil/scene-graph/primitives'

function attributeValue(svg: string, attribute: string): string | null {
  const match = svg.match(new RegExp(`\\b${attribute}\\s*=\\s*(["'])(.*?)\\1`, 'i'))
  return match?.[2] ?? null
}

export function parseSVGViewBox(svg: string): Rect | null {
  const value = attributeValue(svg, 'viewBox')
  if (!value) return null
  const values = value
    .trim()
    .split(/[\s,]+/)
    .map(Number)
  if (values.length !== 4 || values.some((entry) => !Number.isFinite(entry))) return null
  const [x = 0, y = 0, width = 0, height = 0] = values
  if (width <= 0 || height <= 0) return null
  return { x, y, width, height }
}

function parseSVGDimension(svg: string, attribute: string): number | null {
  const value = attributeValue(svg, attribute)
  if (!value) return null
  const parsed = Number.parseFloat(value)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null
}

export function parseSVGSize(svg: string, fallback: Size = { width: 24, height: 24 }): Size {
  const viewBox = parseSVGViewBox(svg)
  const width = parseSVGDimension(svg, 'width')
  const height = parseSVGDimension(svg, 'height')
  if (width && height) return { width, height }
  if (viewBox) return { width: viewBox.width, height: viewBox.height }
  return fallback
}
