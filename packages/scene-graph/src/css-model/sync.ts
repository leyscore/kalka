import type { CSSDeclarations, SceneNode } from '../types'
import { MAPPED_CSS_PROPERTIES, writeLayerStyle } from './table'

/**
 * Every field the table writes CSS from: a change to one of them changes the layer's CSS.
 * `packages/scene-graph/tests/css-model/sync.test.ts` checks it against what the table reads.
 */
export const STYLE_FIELDS: ReadonlySet<string> = new Set<keyof SceneNode>([
  'type',
  'x',
  'y',
  'width',
  'height',
  'rotation',
  'childIds',
  'minWidth',
  'maxWidth',
  'minHeight',
  'maxHeight',
  'fills',
  'strokes',
  'strokeWeight',
  'strokeAlign',
  'strokesIncludedInLayout',
  'dashPattern',
  'independentStrokeWeights',
  'borderTopWeight',
  'borderRightWeight',
  'borderBottomWeight',
  'borderLeftWeight',
  'effects',
  'opacity',
  'blendMode',
  'shader',
  'cornerRadius',
  'independentCorners',
  'topLeftRadius',
  'topRightRadius',
  'bottomRightRadius',
  'bottomLeftRadius',
  'clipsContent',
  'layoutMode',
  'layoutDirection',
  'layoutWrap',
  'layoutPositioning',
  'layoutGrow',
  'layoutAlignSelf',
  'primaryAxisAlign',
  'counterAxisAlign',
  'primaryAxisSizing',
  'counterAxisSizing',
  'itemSpacing',
  'counterAxisSpacing',
  'paddingTop',
  'paddingRight',
  'paddingBottom',
  'paddingLeft',
  'gridTemplateColumns',
  'gridTemplateRows',
  'gridColumnGap',
  'gridRowGap',
  'gridPosition',
  'text',
  'textDirection',
  'fontFamily',
  'fontSize',
  'fontWeight',
  'italic',
  'lineHeight',
  'letterSpacing',
  'textAlignHorizontal',
  'textDecoration',
  'textCase',
  'textAutoResize',
  'textTruncation',
  'maxLines'
])

/** Parent fields a child's CSS reads: whether and how the parent lays its children out. */
export const PARENT_STYLE_FIELDS: ReadonlySet<string> = new Set<keyof SceneNode>([
  'type',
  'layoutMode'
])

/** A change touches the layer's CSS when it sets a field the table writes from. */
export function changesStyle(keys: Iterable<string>): boolean {
  for (const key of keys) if (STYLE_FIELDS.has(key)) return true
  return false
}

/** Declarations of a layer's CSS that its fields cannot hold, such as `cursor` or `transition`. */
export function extraDeclarations(node: SceneNode): CSSDeclarations {
  const extra: CSSDeclarations = {}
  for (const [property, value] of Object.entries(node.style))
    if (!MAPPED_CSS_PROPERTIES.has(property)) extra[property] = value
  return extra
}

/**
 * The layer's CSS from its fields and its parent, literal values in export order, followed by
 * the declarations of its current CSS that the fields cannot hold.
 */
export function layerStyle(node: SceneNode, parent: SceneNode | undefined): CSSDeclarations {
  return {
    ...writeLayerStyle(node, { parent, css: (_field, literal) => literal }),
    ...extraDeclarations(node)
  }
}
