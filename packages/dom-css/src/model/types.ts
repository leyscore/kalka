import type { SceneGraph, SceneNode } from '@kalka/scene-graph'
import { parseCSSNumber } from '@kalka/scene-graph/css'

import { pickStyle } from '../import/css-values'
import type { DesignElement, DesignStyleDeclaration } from '../types'

/** A field's CSS: its token reference where one is faithful, otherwise the literal value. */
export type FieldCSS = (field: string, literal: string) => string

/** The image hash an `<img src>` names in the graph, for sources that are not data URLs. */
export type ImageSourceResolver = (source: string) => string | null

export interface WriteContext {
  /** The layer's parent, whose layout decides how the child is sized and placed. */
  parent: SceneNode | undefined
  css: FieldCSS
}

export interface ReadContext {
  graph: SceneGraph
  /** The element the CSS is on, when there is one: an `<img>` carries its image in `src`. */
  element?: DesignElement
  resolveImage?: ImageSourceResolver
  /**
   * Set when the CSS is what the projection wrote, so what it leaves out means something: an
   * unset size hugs or fills, and `position: absolute` is a free position in its parent.
   */
  projected?: { parent: SceneNode | undefined }
}

/**
 * One family of layer fields and the CSS properties that carry them, both ways. Families run in
 * table order, which is the order export writes declarations and import reads them.
 */
export interface PropertyFamily {
  name: string
  /** Every CSS property the family writes or reads. */
  properties: readonly string[]
  write?(style: DesignStyleDeclaration, node: SceneNode, context: WriteContext): void
  read?(style: DesignStyleDeclaration, node: SceneNode, context: ReadContext): void
}

export const px = (value: number) => `${value}px`

export function firstCSSNumber(
  style: DesignStyleDeclaration,
  ...properties: string[]
): number | null {
  for (const property of properties) {
    const parsed = parseCSSNumber(pickStyle(style, property))
    if (parsed !== null) return parsed
  }
  return null
}

/** Whether a parent places its children itself: auto layout or grid, not free positions. */
export function laysOutChildren(parent: SceneNode | undefined): parent is SceneNode {
  return parent !== undefined && parent.type !== 'CANVAS' && parent.layoutMode !== 'NONE'
}
