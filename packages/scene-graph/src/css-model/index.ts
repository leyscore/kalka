/**
 * The single mapping between layer fields and CSS. Export writes a layer's declarations by
 * running each family's `write` in table order; import, the canvas's style edits and the
 * projection's own round trip read them back through the same families.
 */
import type { SceneNode } from '../types'
import { blendMode, clipsContent, cornerRadii, effects, opacity, textShadow } from './appearance'
import { container, direction, layoutChild, textDirection } from './layout'
import { fills, image, shaderFallback, textFills } from './paint'
import { expandBorderShorthands } from './paint-from-css'
import { position } from './position'
import { contentSizing, size, sizeConstraints } from './size'
import { stroke } from './stroke'
import { font, textAlign, textDecoration, textWrap } from './text'
import type { CSSDeclarations, PropertyFamily, ReadContext, WriteContext } from './types'

export type { CSSDeclarations, FieldCSS, PropertyFamily, ReadContext, WriteContext } from './types'
export { hugs } from './size'
export { firstCSSNumber, laysOutChildren, px } from './types'
export * from './to-css'
export * from './from-css'
export * from './gradient'
export * from './grid'
export * from './paint-from-css'

/** Frames, shapes and every other layer that draws a box. */
export const BOX_PROPERTIES: readonly PropertyFamily[] = [
  size,
  position,
  sizeConstraints,
  fills,
  image,
  shaderFallback,
  stroke,
  effects,
  opacity,
  blendMode,
  cornerRadii,
  clipsContent,
  layoutChild,
  direction,
  container,
  contentSizing
]

export const TEXT_PROPERTIES: readonly PropertyFamily[] = [
  size,
  position,
  layoutChild,
  textDirection,
  textFills,
  font,
  textAlign,
  opacity,
  blendMode,
  textShadow,
  textDecoration,
  textWrap,
  contentSizing
]

export function propertiesFor(node: Pick<SceneNode, 'type'>): readonly PropertyFamily[] {
  return node.type === 'TEXT' ? TEXT_PROPERTIES : BOX_PROPERTIES
}

/** Every CSS property the table carries into layer fields; anything else a layer cannot keep. */
export const MAPPED_CSS_PROPERTIES: ReadonlySet<string> = new Set(
  [...BOX_PROPERTIES, ...TEXT_PROPERTIES].flatMap((family) => family.properties)
)

export function writeLayerStyle(node: SceneNode, context: WriteContext): CSSDeclarations {
  const style: CSSDeclarations = {}
  for (const family of propertiesFor(node)) family.write?.(style, node, context)
  return style
}

export function readLayerStyle(
  node: SceneNode,
  declared: CSSDeclarations,
  context: ReadContext
): void {
  const style = node.type === 'TEXT' ? declared : expandBorderShorthands(declared)
  for (const family of propertiesFor(node)) family.read?.(style, node, context)
}
