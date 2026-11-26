import { colorToHex } from '../color'
import type { SceneGraph } from '../index'
import type { SceneNode } from '../types'
import { ANNOTATION_PROPERTIES, type AnnotationProperty } from './model'

const TEXT_PROPERTIES: ReadonlySet<AnnotationProperty> = new Set([
  'textStyleId',
  'textAlignHorizontal',
  'fontFamily',
  'fontSize',
  'fontWeight',
  'lineHeight',
  'letterSpacing',
  'fontStyle'
])
const LAYOUT_PROPERTIES: ReadonlySet<AnnotationProperty> = new Set([
  'itemSpacing',
  'padding',
  'layoutMode',
  'alignItems'
])
const GRID_PROPERTIES: ReadonlySet<AnnotationProperty> = new Set([
  'gridRowGap',
  'gridColumnGap',
  'gridRowCount',
  'gridColumnCount'
])
const GRID_CHILD_PROPERTIES: ReadonlySet<AnnotationProperty> = new Set([
  'gridRowAnchorIndex',
  'gridColumnAnchorIndex',
  'gridRowSpan',
  'gridColumnSpan'
])

/** The pinnable properties that mean something on this layer. */
export function annotationPropertiesFor(node: SceneNode): AnnotationProperty[] {
  return ANNOTATION_PROPERTIES.filter((name) => {
    if (TEXT_PROPERTIES.has(name)) return node.type === 'TEXT'
    if (LAYOUT_PROPERTIES.has(name))
      return node.layoutMode === 'HORIZONTAL' || node.layoutMode === 'VERTICAL'
    if (GRID_PROPERTIES.has(name)) return node.layoutMode === 'GRID'
    if (GRID_CHILD_PROPERTIES.has(name)) return node.gridPosition !== null
    if (name === 'mainComponent') return node.type === 'INSTANCE'
    return true
  })
}

const LAYOUT_DIRECTIONS: Record<SceneNode['layoutMode'], string> = {
  NONE: 'none',
  HORIZONTAL: 'row',
  VERTICAL: 'column',
  GRID: 'grid'
}

const ALIGNMENTS: Record<SceneNode['primaryAxisAlign'] | SceneNode['counterAxisAlign'], string> = {
  MIN: 'start',
  CENTER: 'center',
  MAX: 'end',
  SPACE_BETWEEN: 'space-between',
  STRETCH: 'stretch',
  BASELINE: 'baseline'
}

const px = (value: number) => `${Math.round(value * 100) / 100}px`

function paintsValue(paints: SceneNode['fills']): string {
  const visible = paints.filter((paint) => paint.visible)
  if (visible.length === 0) return NONE
  return visible
    .map((paint) =>
      paint.type === 'SOLID'
        ? colorToHex({ ...paint.color, a: paint.color.a * paint.opacity })
        : paint.type.toLowerCase().replace(/_/g, ' ')
    )
    .join(', ')
}

const NONE = '—'
const optionalPx = (value: number | null) => (value === null ? NONE : px(value))
const gridPlace = (
  node: SceneNode,
  read: (place: NonNullable<SceneNode['gridPosition']>) => string
) => (node.gridPosition ? read(node.gridPosition) : NONE)
const nameOf = (graph: SceneGraph, id: string | null) => (id && graph.getNode(id)?.name) || NONE

function effectsValue(node: SceneNode): string {
  const visible = node.effects.filter((effect) => effect.visible)
  if (visible.length === 0) return NONE
  return visible.map((effect) => effect.type.toLowerCase().replace(/_/g, ' ')).join(', ')
}

/** How each pinned property reads on a layer. */
const VALUES: Record<AnnotationProperty, (node: SceneNode, graph: SceneGraph) => string> = {
  fills: (node) => paintsValue(node.fills),
  strokes: (node) => paintsValue(node.strokes),
  width: (node) => px(node.width),
  height: (node) => px(node.height),
  minWidth: (node) => optionalPx(node.minWidth),
  minHeight: (node) => optionalPx(node.minHeight),
  maxWidth: (node) => optionalPx(node.maxWidth),
  maxHeight: (node) => optionalPx(node.maxHeight),
  strokeWeight: (node) => (node.strokes.length > 0 ? px(node.strokeWeight) : NONE),
  cornerRadius: (node) => px(node.cornerRadius),
  effects: effectsValue,
  textStyleId: (node, graph) => nameOf(graph, node.textStyleId),
  textAlignHorizontal: (node) => node.textAlignHorizontal.toLowerCase(),
  fontFamily: (node) => node.fontFamily,
  fontSize: (node) => px(node.fontSize),
  fontWeight: (node) => String(node.fontWeight),
  fontStyle: (node) => (node.italic ? 'italic' : 'normal'),
  lineHeight: (node) => (node.lineHeight === null ? 'auto' : px(node.lineHeight)),
  letterSpacing: (node) => px(node.letterSpacing),
  itemSpacing: (node) => px(node.itemSpacing),
  padding: (node) =>
    [node.paddingTop, node.paddingRight, node.paddingBottom, node.paddingLeft].map(px).join(' '),
  layoutMode: (node) => LAYOUT_DIRECTIONS[node.layoutMode],
  alignItems: (node) => `${ALIGNMENTS[node.primaryAxisAlign]} ${ALIGNMENTS[node.counterAxisAlign]}`,
  opacity: (node) => `${Math.round(node.opacity * 100)}%`,
  mainComponent: (node, graph) => nameOf(graph, node.componentId),
  gridRowGap: (node) => px(node.gridRowGap),
  gridColumnGap: (node) => px(node.gridColumnGap),
  gridRowCount: (node) => String(node.gridTemplateRows.length),
  gridColumnCount: (node) => String(node.gridTemplateColumns.length),
  gridRowAnchorIndex: (node) => gridPlace(node, (place) => String(place.row)),
  gridColumnAnchorIndex: (node) => gridPlace(node, (place) => String(place.column)),
  gridRowSpan: (node) => gridPlace(node, (place) => `span ${place.rowSpan}`),
  gridColumnSpan: (node) => gridPlace(node, (place) => `span ${place.columnSpan}`)
}

/**
 * A pinned property's current value on its layer, written as a developer reads it: CSS units and
 * colours, or the name of the component, style or layout.
 */
export function annotationPropertyValue(
  graph: SceneGraph,
  node: SceneNode,
  property: AnnotationProperty
): string {
  return VALUES[property](node, graph)
}
