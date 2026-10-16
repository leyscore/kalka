import { parseCSSNumber } from '../css'
import type { CSSDeclarations, SceneNode } from '../types'
import { pickStyle } from './from-css'

export type { CSSDeclarations }

/** A field's CSS: its token reference where one is faithful, otherwise the literal value. */
export type FieldCSS = (field: string, literal: string) => string

export interface WriteContext {
  /** The layer's parent, whose layout decides how the child is sized and placed. */
  parent: SceneNode | undefined
  css: FieldCSS
}

export interface ReadContext {
  /** The box a browser laid the element out in, when it was measured; gradients scale to it. */
  box?: { width: number; height: number }
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
  /** Every layer field it writes CSS from, or reads CSS into; a change to one rewrites it. */
  fields: readonly (keyof SceneNode)[]
  /** Whether its CSS depends on how the parent lays out its children. */
  dependsOnParent?: true
  write?(style: CSSDeclarations, node: SceneNode, context: WriteContext): void
  read?(style: CSSDeclarations, node: SceneNode, context: ReadContext): void
}

export const px = (value: number) => `${value}px`

export function firstCSSNumber(style: CSSDeclarations, ...properties: string[]): number | null {
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
