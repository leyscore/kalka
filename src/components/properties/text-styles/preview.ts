import type { CSSProperties } from 'vue'

import { spacingPercent, type SceneNode } from '@kalka/scene-graph'

/** The largest a style's name is drawn in a list, so a display style keeps its row. */
const PREVIEW_MAX_SIZE = 16
const PREVIEW_MIN_SIZE = 11

/** How a style's name is drawn in a list: in its own face, at a size the row can hold. */
export function textStylePreviewStyle(definition: SceneNode | null): CSSProperties {
  if (!definition) return {}
  return {
    fontFamily: `"${definition.fontFamily}", sans-serif`,
    fontWeight: definition.fontWeight,
    fontStyle: definition.italic ? 'italic' : 'normal',
    fontSize: `${Math.min(PREVIEW_MAX_SIZE, Math.max(PREVIEW_MIN_SIZE, definition.fontSize))}px`
  }
}

/** Size over line height, as Figma sums a text style up: `48/56`, `16/Auto`. */
export function textStyleSummary(definition: SceneNode | null, autoLabel: string): string {
  if (!definition) return ''
  const size = Math.round(definition.fontSize * 100) / 100
  if (definition.lineHeight == null) return `${size}/${autoLabel}`
  const lineHeight =
    definition.lineHeightUnit === 'PERCENT'
      ? `${spacingPercent(definition.lineHeight, definition.fontSize)}%`
      : String(Math.round(definition.lineHeight * 100) / 100)
  return `${size}/${lineHeight}`
}
