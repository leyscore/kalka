import { frameLabelPlacement, labelScreenMatrix, type RenderOverlays } from '@kalka/core/canvas'
import {
  COMPONENT_COLOR,
  DROP_HIGHLIGHT_ALPHA,
  DROP_HIGHLIGHT_STROKE,
  HANDLE_HALF_SIZE,
  LAYOUT_INDICATOR_STROKE,
  MARQUEE_FILL_ALPHA,
  PARENT_OUTLINE_ALPHA,
  PARENT_OUTLINE_DASH,
  ROTATION_HANDLE_DISTANCE,
  SECTION_HOVER_STROKE_WIDTH,
  SELECTION_COLOR,
  SELECTION_DASH_ALPHA,
  SIZE_FONT_SIZE,
  SIZE_PILL_HEIGHT,
  SIZE_PILL_PADDING_X,
  SIZE_PILL_PADDING_Y,
  SIZE_PILL_RADIUS,
  SIZE_PILL_TEXT_OFFSET_Y,
  SLOT_COLOR,
  SNAP_COLOR
} from '@kalka/core/constants'
import {
  createSceneGeometry,
  rotationHandleLayout,
  selectionPath,
  viewportMatrix,
  type ViewportTransform
} from '@kalka/core/geometry'
import { slotPropertyId, type SceneGraph, type SceneNode } from '@kalka/scene-graph'
import { computeBounds } from '@kalka/scene-graph/geometry'
import Matrix from '@kalka/scene-graph/matrix'
import type { Color } from '@kalka/scene-graph/primitives'

import {
  css,
  type MeasureText,
  type OverlayShape,
  type Paint
} from '#vue/canvas/svg-overlay/shapes'

import { textPathSelectionShapes } from './text-path'

export interface OverlayContext {
  graph: SceneGraph
  view: ViewportTransform
  overlays: RenderOverlays
  selectedIds: ReadonlySet<string>
  measureText: MeasureText
  /** The pane's size in screen pixels, for overlays laid out against its edges. */
  viewportSize?: { width: number; height: number }
  /** The page's color, which canvas labels contrast with. */
  pageColor?: Color
}

const WHITE = css({ r: 1, g: 1, b: 1, a: 1 })

function isComponentType(type: string): boolean {
  return type === 'COMPONENT' || type === 'COMPONENT_SET' || type === 'INSTANCE'
}

/** A component, instance or set, or a layer inside one; content placed in a slot is not. */
function isInComponent(node: SceneNode, graph: SceneGraph): boolean {
  const owner = graph.closest(
    node.id,
    (layer) => isComponentType(layer.type) || slotPropertyId(layer) !== undefined
  )
  return owner !== undefined && !slotPropertyId(owner)
}

/** Pink for slots, purple for components and what they hold, blue otherwise, as in Figma. */
export function outlineColor(node: SceneNode, graph: SceneGraph): Color {
  if (slotPropertyId(node)) return SLOT_COLOR
  return isInComponent(node, graph) ? COMPONENT_COLOR : SELECTION_COLOR
}

function hasRadius(node: SceneNode): boolean {
  return (
    node.cornerRadius > 0 ||
    (node.independentCorners &&
      (node.topLeftRadius > 0 ||
        node.topRightRadius > 0 ||
        node.bottomRightRadius > 0 ||
        node.bottomLeftRadius > 0))
  )
}

function roundedRectPath(node: SceneNode): string {
  const { width: w, height: h } = node
  const limit = Math.min(w, h) / 2
  const corner = (value: number) => Math.min(Math.max(0, value), limit)
  const [tl, tr, br, bl] = node.independentCorners
    ? [node.topLeftRadius, node.topRightRadius, node.bottomRightRadius, node.bottomLeftRadius].map(
        corner
      )
    : Array.from({ length: 4 }, () => corner(node.cornerRadius))
  return [
    `M${tl} 0H${w - tr}`,
    tr ? `A${tr} ${tr} 0 0 1 ${w} ${tr}` : '',
    `V${h - br}`,
    br ? `A${br} ${br} 0 0 1 ${w - br} ${h}` : '',
    `H${bl}`,
    bl ? `A${bl} ${bl} 0 0 1 0 ${h - bl}` : '',
    `V${tl}`,
    tl ? `A${tl} ${tl} 0 0 1 ${tl} 0` : '',
    'Z'
  ].join('')
}

/** The outline of a layer's shape in its own coordinates, as the Skia overlay strokes it. */
export function nodeShape(node: SceneNode, paint: Paint): OverlayShape {
  const { width: w, height: h } = node
  if (node.type === 'ELLIPSE')
    return { type: 'ellipse', cx: w / 2, cy: h / 2, rx: w / 2, ry: h / 2, ...paint }
  if (node.type === 'LINE') return { type: 'line', x1: 0, y1: 0, x2: w, y2: h, ...paint }
  if (hasRadius(node)) return { type: 'path', d: roundedRectPath(node), ...paint }
  return { type: 'rect', x: 0, y: 0, width: w, height: h, ...paint }
}

function inNode(context: OverlayContext, node: SceneNode, children: OverlayShape[]): OverlayShape {
  const geometry = createSceneGeometry(context.graph, context.overlays.rotationPreview)
  return { type: 'group', matrix: geometry.screenMatrix(node, context.view), children }
}

function outlineNode(
  context: OverlayContext,
  id: string | null | undefined,
  paint: Paint
): OverlayShape[] {
  const node = id ? context.graph.getNode(id) : undefined
  if (!node) return []
  return [
    inNode(context, node, [
      { type: 'rect', x: 0, y: 0, width: node.width, height: node.height, ...paint }
    ])
  ]
}

export function hoverLayer(
  context: OverlayContext,
  hoveredNodeId: string | null | undefined
): OverlayShape[] {
  const node = hoveredNodeId ? context.graph.getNode(hoveredNodeId) : undefined
  if (!node) return []
  const paint: Paint = {
    stroke: css(outlineColor(node, context.graph)),
    strokeWidth: node.type === 'SECTION' ? SECTION_HOVER_STROKE_WIDTH : 1
  }
  return [inNode(context, node, [nodeShape(node, paint)])]
}

export function enteredContainerLayer(context: OverlayContext): OverlayShape[] {
  return outlineNode(context, context.overlays.enteredContainerId, {
    stroke: css(SELECTION_COLOR, SELECTION_DASH_ALPHA),
    strokeWidth: 1,
    dash: [4, 4]
  })
}

export function dropTargetLayer(context: OverlayContext): OverlayShape[] {
  return outlineNode(context, context.overlays.dropTargetId, {
    stroke: css(SELECTION_COLOR, DROP_HIGHLIGHT_ALPHA),
    strokeWidth: DROP_HIGHLIGHT_STROKE
  })
}

// ------------------------------------------------------------------ selection

/** A handle: a white square with the selection's outline, a fixed size on screen. */
function handle(x: number, y: number, half: number, stroke: string): OverlayShape {
  return {
    type: 'rect',
    x: x - half,
    y: y - half,
    width: half * 2,
    height: half * 2,
    fill: WHITE,
    stroke,
    strokeWidth: 1
  }
}

function sizePill(
  context: OverlayContext,
  text: string,
  x: number,
  y: number,
  color: Color
): OverlayShape[] {
  const width = context.measureText(text, SIZE_FONT_SIZE) + SIZE_PILL_PADDING_X * 2
  const left = x - width / 2
  const top = y + SIZE_PILL_PADDING_Y
  return [
    {
      type: 'rect',
      x: left,
      y: top,
      width,
      height: SIZE_PILL_HEIGHT,
      rx: SIZE_PILL_RADIUS,
      fill: css(color)
    },
    {
      type: 'text',
      x: left + SIZE_PILL_PADDING_X,
      y: top + SIZE_PILL_TEXT_OFFSET_Y,
      text,
      fill: WHITE,
      fontSize: SIZE_FONT_SIZE
    }
  ]
}

function singleSelection(context: OverlayContext, node: SceneNode): OverlayShape[] {
  const color = outlineColor(node, context.graph)
  const stroke = css(color)
  const geometry = createSceneGeometry(
    context.graph,
    context.overlays.rotationPreview ?? { nodeId: node.id, angle: node.rotation }
  )
  const { zoom } = context.view
  const half = HANDLE_HALF_SIZE / zoom
  // Text set on a path is framed by the box its lettering fits, under its curve and band.
  const textPath = selectionPath(node)
  const box = textPath?.box ?? { x: 0, y: 0, width: node.width, height: node.height }
  const [x1, y1, x2, y2] = [box.x, box.y, box.x + box.width, box.y + box.height]
  const midX = (x1 + x2) / 2
  const midY = (y1 + y2) / 2
  const stalk = rotationHandleLayout(node, geometry, zoom, box)
  const handleAt = (x: number, y: number) => handle(x, y, half, stroke)
  const outline: OverlayShape = textPath
    ? {
        ...box,
        type: 'rect',
        stroke: css(color, SELECTION_DASH_ALPHA),
        strokeWidth: 1,
        dash: [4, 4]
      }
    : { ...box, type: 'rect', stroke, strokeWidth: 1 }
  const placed: OverlayShape = {
    type: 'group',
    matrix: Matrix.multiply(viewportMatrix(context.view), geometry.worldMatrix(node)),
    children: [
      ...(textPath
        ? textPathSelectionShapes(node, textPath, { color, handle: handleAt, half })
        : []),
      outline,
      {
        type: 'line',
        x1: stalk.edge.x,
        y1: stalk.edge.y,
        x2: stalk.handle.x,
        y2: stalk.handle.y,
        stroke,
        strokeWidth: 1
      },
      ...[
        [x1, y1],
        [x2, y1],
        [x1, y2],
        [x2, y2],
        [stalk.handle.x, stalk.handle.y],
        [midX, y1],
        [midX, y2],
        [x1, midY],
        [x2, midY]
      ].map(([x, y]) => handleAt(x, y))
    ]
  }
  const label = frameLabelPlacement(node, context.graph, context.overlays.rotationPreview, {
    x: 0.5,
    y: 1
  })
  const pill: OverlayShape = {
    type: 'group',
    matrix: labelScreenMatrix(label, context.view),
    children: sizePill(
      context,
      `${Math.round(node.width)} × ${Math.round(node.height)}`,
      0,
      0,
      color
    )
  }
  return [placed, pill]
}

function multiSelection(context: OverlayContext, nodes: SceneNode[]): OverlayShape[] {
  const geometry = createSceneGeometry(context.graph, context.overlays.rotationPreview)
  const outlines = nodes.map((node) =>
    inNode(context, node, [
      {
        type: 'rect',
        x: 0,
        y: 0,
        width: node.width,
        height: node.height,
        stroke: css(outlineColor(node, context.graph)),
        strokeWidth: 1
      }
    ])
  )
  const bounds = computeBounds(nodes.map(geometry.bounds))
  const [minX, minY, maxX, maxY] = Matrix.mapPoints(viewportMatrix(context.view), [
    bounds.x,
    bounds.y,
    bounds.x + bounds.width,
    bounds.y + bounds.height
  ])
  const stroke = css(SELECTION_COLOR)
  const midX = (minX + maxX) / 2
  const midY = (minY + maxY) / 2
  const rotationY = minY - ROTATION_HANDLE_DISTANCE
  const allComponents = nodes.every((node) => isInComponent(node, context.graph))
  return [
    ...outlines,
    {
      type: 'rect',
      x: minX,
      y: minY,
      width: maxX - minX,
      height: maxY - minY,
      stroke: css(SELECTION_COLOR, SELECTION_DASH_ALPHA),
      strokeWidth: 1
    },
    { type: 'line', x1: midX, y1: minY, x2: midX, y2: rotationY, stroke, strokeWidth: 1 },
    ...[
      [minX, minY],
      [maxX, minY],
      [minX, maxY],
      [maxX, maxY],
      [midX, rotationY],
      [midX, minY],
      [midX, maxY],
      [minX, midY],
      [maxX, midY]
    ].map(([x, y]) => handle(x, y, HANDLE_HALF_SIZE, stroke)),
    ...sizePill(
      context,
      `${Math.round(bounds.width)} × ${Math.round(bounds.height)}`,
      midX,
      maxY,
      allComponents ? COMPONENT_COLOR : SELECTION_COLOR
    )
  ]
}

/** Dashed outlines of the frames holding the selection, as context. */
function parentOutlines(context: OverlayContext): OverlayShape[] {
  const { graph, selectedIds } = context
  const drawn = new Set<string>()
  const shapes: OverlayShape[] = []
  for (const id of selectedIds) {
    const node = graph.getNode(id)
    const parent = node?.parentId ? graph.getNode(node.parentId) : undefined
    if (!parent || parent.type === 'CANVAS' || drawn.has(parent.id) || selectedIds.has(parent.id))
      continue
    if (slotPropertyId(parent)) continue
    const grandparent = parent.parentId ? graph.getNode(parent.parentId) : undefined
    if (!grandparent || grandparent.type === 'CANVAS') continue
    drawn.add(parent.id)
    shapes.push(
      inNode(context, parent, [
        {
          type: 'rect',
          x: 0,
          y: 0,
          width: parent.width,
          height: parent.height,
          stroke: css(SELECTION_COLOR, PARENT_OUTLINE_ALPHA),
          strokeWidth: 1,
          dash: [PARENT_OUTLINE_DASH, PARENT_OUTLINE_DASH]
        }
      ])
    )
  }
  return shapes
}

export function selectionLayer(context: OverlayContext): OverlayShape[] {
  const { graph, selectedIds, overlays } = context
  if (selectedIds.size === 0) return []
  const editId = overlays.nodeEditState?.nodeId ?? null
  const shapes = parentOutlines(context)
  const nodes = [...selectedIds]
    .filter((id) => id !== editId)
    .map((id) => graph.getNode(id))
    .filter((node): node is SceneNode => node !== undefined)
  if (nodes.length === 0) return shapes
  if (selectedIds.size === 1) {
    // Text being edited shows its caret instead.
    if (overlays.editingTextId === nodes[0].id && nodes[0].textPathData === null) return shapes
    return [...shapes, ...singleSelection(context, nodes[0])]
  }
  return [...shapes, ...multiSelection(context, nodes)]
}

// ------------------------------------------------------------------ feedback

export function marqueeLayer(context: OverlayContext): OverlayShape[] {
  const marquee = context.overlays.marquee
  if (!marquee || marquee.width <= 0 || marquee.height <= 0) return []
  const { panX, panY, zoom } = context.view
  return [
    {
      type: 'rect',
      x: marquee.x * zoom + panX,
      y: marquee.y * zoom + panY,
      width: marquee.width * zoom,
      height: marquee.height * zoom,
      fill: css(SELECTION_COLOR, MARQUEE_FILL_ALPHA),
      stroke: css(SELECTION_COLOR),
      strokeWidth: 1
    }
  ]
}

export function snapGuidesLayer(context: OverlayContext): OverlayShape[] {
  const { panX, panY, zoom } = context.view
  const stroke = css(SNAP_COLOR, 1)
  return (context.overlays.snapGuides ?? []).map((guide) =>
    guide.axis === 'x'
      ? {
          type: 'line',
          x1: guide.position * zoom + panX,
          y1: guide.from * zoom + panY,
          x2: guide.position * zoom + panX,
          y2: guide.to * zoom + panY,
          stroke,
          strokeWidth: 1
        }
      : {
          type: 'line',
          x1: guide.from * zoom + panX,
          y1: guide.position * zoom + panY,
          x2: guide.to * zoom + panX,
          y2: guide.position * zoom + panY,
          stroke,
          strokeWidth: 1
        }
  )
}

export function insertIndicatorLayer(context: OverlayContext): OverlayShape[] {
  const indicator = context.overlays.layoutInsertIndicator
  if (!indicator) return []
  const { panX, panY, zoom } = context.view
  const x = indicator.x * zoom + panX
  const y = indicator.y * zoom + panY
  const length = indicator.length * zoom
  const paint = { stroke: css(SELECTION_COLOR), strokeWidth: LAYOUT_INDICATOR_STROKE }
  return [
    indicator.direction === 'HORIZONTAL'
      ? { type: 'line', x1: x, y1: y, x2: x + length, y2: y, ...paint }
      : { type: 'line', x1: x, y1: y, x2: x, y2: y + length, ...paint }
  ]
}
