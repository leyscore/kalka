import {
  CODE_FOCUS_FILL_ALPHA,
  COMPONENT_COLOR,
  COMPONENT_SET_BORDER_WIDTH,
  COMPONENT_SET_DASH,
  COMPONENT_SET_DASH_GAP,
  COMPONENT_SET_OUTLINE_RADIUS,
  LAYOUT_OUTLINE_DASH,
  LAYOUT_OUTLINE_GAP,
  SELECTION_COLOR,
  SLOT_COLOR,
  SLOT_EMPTY_FILL_ALPHA
} from '@kalka/core/constants'
import { createSceneGeometry } from '@kalka/core/geometry'
import {
  instanceSlotFrames,
  slotPropertyId,
  type SceneGraph,
  type SceneNode
} from '@kalka/scene-graph'

import {
  nodeShape,
  outlineColor,
  type OverlayContext
} from '#vue/canvas/svg-overlay/layers/selection'
import { css, type OverlayShape, type Paint } from '#vue/canvas/svg-overlay/shapes'

const SLOT_DASH = 4

/** Each node's shapes, placed where the node is on screen, in its own coordinates. */
function inNodes(
  context: OverlayContext,
  nodes: Iterable<SceneNode>,
  draw: (node: SceneNode) => OverlayShape[]
): OverlayShape[] {
  const geometry = createSceneGeometry(context.graph, context.overlays.rotationPreview)
  return [...nodes].map((node) => ({
    type: 'group',
    matrix: geometry.screenMatrix(node, context.view),
    children: draw(node)
  }))
}

function box(node: SceneNode, paint: Paint): OverlayShape {
  return { type: 'rect', x: 0, y: 0, width: node.width, height: node.height, ...paint }
}

// ------------------------------------------------------------------ component sets

/** Visible component sets on the page, wherever they are nested, as the label cache finds them. */
function componentSets(graph: SceneGraph, parentId: string, sets: SceneNode[] = []): SceneNode[] {
  const parent = graph.getNode(parentId)
  if (!parent) return sets
  for (const childId of parent.childIds) {
    const child = graph.getNode(childId)
    if (!child || !child.visible) continue
    if (child.type === 'COMPONENT_SET') sets.push(child)
    if (child.childIds.length > 0) componentSets(graph, child.id, sets)
  }
  return sets
}

/** The dashed editing border of each component set on `pageId` without a stroke of its own. */
export function componentSetBordersLayer(context: OverlayContext, pageId: string): OverlayShape[] {
  const sets = componentSets(context.graph, pageId).filter(
    (node) => !node.strokes.some((stroke) => stroke.visible)
  )
  const paint: Paint = {
    stroke: css(COMPONENT_COLOR),
    strokeWidth: COMPONENT_SET_BORDER_WIDTH,
    dash: [COMPONENT_SET_DASH, COMPONENT_SET_DASH_GAP]
  }
  // The corner radius is in the set's own units, so it scales with zoom as in Skia.
  return inNodes(context, sets, (node) => [
    {
      type: 'rect',
      x: 0,
      y: 0,
      width: node.width,
      height: node.height,
      rx: COMPONENT_SET_OUTLINE_RADIUS,
      ...paint
    }
  ])
}

// ------------------------------------------------------------------ code focus

function isComponentType(type: string): boolean {
  return type === 'COMPONENT' || type === 'COMPONENT_SET' || type === 'INSTANCE'
}

/** The layer the code panel points at: tinted and outlined, purple for components. */
export function codeFocusLayer(context: OverlayContext): OverlayShape[] {
  const id = context.overlays.codeFocusNodeId
  const node = id ? context.graph.getNode(id) : undefined
  if (!node) return []
  const color = isComponentType(node.type) ? COMPONENT_COLOR : SELECTION_COLOR
  return inNodes(context, [node], () => [
    nodeShape(node, { fill: css(color, CODE_FOCUS_FILL_ALPHA), stroke: css(color), strokeWidth: 1 })
  ])
}

// ------------------------------------------------------------------ slots

/**
 * Slots worth outlining for these nodes: every slot of a component or instance, and the slot
 * a layer sits in. Figma outlines them in pink so content can be placed without hunting.
 */
function focusedSlots(graph: SceneGraph, ids: Iterable<string>): Map<string, SceneNode> {
  const slots = new Map<string, SceneNode>()
  for (const id of ids) {
    const node = graph.getNode(id)
    if (!node) continue
    if (node.type === 'INSTANCE' || node.type === 'COMPONENT')
      for (const frame of instanceSlotFrames(graph, node)) slots.set(frame.id, frame)
    let ancestor = node.parentId ? graph.getNode(node.parentId) : undefined
    while (ancestor && ancestor.type !== 'CANVAS') {
      if (slotPropertyId(ancestor)) {
        slots.set(ancestor.id, ancestor)
        break
      }
      if (ancestor.type === 'INSTANCE' || ancestor.type === 'COMPONENT') break
      ancestor = ancestor.parentId ? graph.getNode(ancestor.parentId) : undefined
    }
  }
  return slots
}

/** Dashed pink outlines around the slots of the hovered and selected layers; empty slots tinted. */
export function slotOutlinesLayer(
  context: OverlayContext,
  hoveredNodeId: string | null | undefined
): OverlayShape[] {
  const { graph, selectedIds } = context
  const slots = focusedSlots(graph, hoveredNodeId ? [...selectedIds, hoveredNodeId] : selectedIds)
  for (const id of selectedIds) slots.delete(id)
  if (hoveredNodeId) slots.delete(hoveredNodeId)
  const stroke: Paint = { stroke: css(SLOT_COLOR), strokeWidth: 1, dash: [SLOT_DASH, SLOT_DASH] }
  const fill: Paint = { fill: css(SLOT_COLOR, SLOT_EMPTY_FILL_ALPHA) }
  return inNodes(context, slots.values(), (frame) =>
    frame.childIds.length === 0 ? [box(frame, fill), box(frame, stroke)] : [box(frame, stroke)]
  )
}

// ------------------------------------------------------------------ layout outlines

function isFlowLayout(node: SceneNode | undefined): node is SceneNode {
  return node?.layoutMode === 'HORIZONTAL' || node?.layoutMode === 'VERTICAL'
}

function layoutOutlines(
  context: OverlayContext,
  container: SceneNode,
  nodes: readonly SceneNode[]
): OverlayShape[] {
  const paint: Paint = {
    stroke: css(outlineColor(container, context.graph)),
    strokeWidth: 1,
    dash: [LAYOUT_OUTLINE_DASH, LAYOUT_OUTLINE_GAP]
  }
  return inNodes(context, nodes, (node) => [box(node, paint)])
}

/**
 * Dotted outlines that show how an auto layout frame arranges its children, as in Figma: around
 * the visible direct children of a hovered flow layout frame, and around the flow layout parent of
 * a single selected layer. Grid and plain frames show none, and none show while layers transform.
 */
export function layoutOutlinesLayer(
  context: OverlayContext,
  hoveredNodeId: string | null | undefined
): OverlayShape[] {
  const { graph, selectedIds, overlays } = context
  if (overlays.transforming || overlays.marquee) return []
  const shapes: OverlayShape[] = []

  if (selectedIds.size === 1) {
    const [selectedId] = selectedIds
    const parentId = graph.getNode(selectedId)?.parentId
    const parent = parentId ? graph.getNode(parentId) : undefined
    if (isFlowLayout(parent) && parent.id !== hoveredNodeId)
      shapes.push(...layoutOutlines(context, parent, [parent]))
  }

  const hovered = hoveredNodeId ? graph.getNode(hoveredNodeId) : undefined
  if (isFlowLayout(hovered) && !selectedIds.has(hovered.id) && selectedIds.size <= 1) {
    const children = hovered.childIds
      .map((id) => graph.getNode(id))
      .filter((child): child is SceneNode => !!child && child.visible)
    shapes.push(...layoutOutlines(context, hovered, children))
  }
  return shapes
}
