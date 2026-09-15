import type { SceneNode } from '@open-pencil/scene-graph'
import type { Rect, Vector } from '@open-pencil/scene-graph/primitives'

import {
  COMPONENT_LABEL_FONT_SIZE,
  COMPONENT_LABEL_GAP,
  COMPONENT_LABEL_ICON_GAP,
  COMPONENT_LABEL_ICON_SIZE,
  LABEL_FONT_SIZE,
  LABEL_OFFSET_Y,
  SECTION_TITLE_FONT_SIZE,
  SECTION_TITLE_GAP,
  SECTION_TITLE_HEIGHT,
  SECTION_TITLE_PADDING_X
} from '#core/constants'

import type { LabelParagraphCache } from './paragraph-cache'

export type LabelKind = 'section' | 'component' | 'frame'
export type LabelTextMetrics = ReturnType<LabelParagraphCache['measure']>
export interface LabelLayout {
  kind: LabelKind
  bounds: Rect
  text: Vector
  icon: Rect | null
  fontSize: number
  maxTextWidth: number
}

export function hasFrameTitle(node: SceneNode, parent?: SceneNode | null): boolean {
  return node.type === 'FRAME' && (!parent || parent.type === 'CANVAS' || parent.type === 'SECTION')
}

/** Pixel-local geometry shared by drawing and hit-testing, including ellipsis and icon bounds. */
export function labelLayout(
  kind: LabelKind,
  screenWidth: number,
  inside = false,
  metrics?: LabelTextMetrics
): LabelLayout | null {
  if (screenWidth <= 0) return null
  const textWidth = metrics?.width ?? screenWidth
  if (kind === 'section') {
    const y = inside ? SECTION_TITLE_GAP : -SECTION_TITLE_HEIGHT - SECTION_TITLE_GAP
    return {
      kind,
      bounds: {
        x: 0,
        y,
        width: Math.min(textWidth + SECTION_TITLE_PADDING_X * 2, screenWidth),
        height: SECTION_TITLE_HEIGHT
      },
      text: {
        x: SECTION_TITLE_PADDING_X,
        y: y + (SECTION_TITLE_HEIGHT - (metrics?.height ?? SECTION_TITLE_FONT_SIZE)) / 2
      },
      icon: null,
      fontSize: SECTION_TITLE_FONT_SIZE,
      maxTextWidth: Math.max(1, screenWidth - SECTION_TITLE_PADDING_X * 2)
    }
  }
  const component = kind === 'component'
  const fontSize = component ? COMPONENT_LABEL_FONT_SIZE : LABEL_FONT_SIZE
  const textX = component ? COMPONENT_LABEL_ICON_SIZE + COMPONENT_LABEL_ICON_GAP : 0
  const maxTextWidth = screenWidth - textX
  if (maxTextWidth <= 0) return null
  const outsideY = component ? -COMPONENT_LABEL_GAP - fontSize : -LABEL_OFFSET_Y - fontSize
  const textY = component && inside ? COMPONENT_LABEL_GAP : outsideY
  const icon = component
    ? {
        x: 0,
        y: textY + fontSize * 0.25,
        width: COMPONENT_LABEL_ICON_SIZE,
        height: COMPONENT_LABEL_ICON_SIZE
      }
    : null
  return {
    kind,
    bounds: {
      x: 0,
      y: textY,
      width: Math.min(textX + textWidth, screenWidth),
      height: Math.max(metrics?.height ?? fontSize, icon ? icon.y + icon.height - textY : 0)
    },
    text: { x: textX, y: textY },
    icon,
    fontSize,
    maxTextWidth
  }
}
