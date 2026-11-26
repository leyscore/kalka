import {
  getAxisAlignedBoundsInParent,
  type Fill,
  type SceneNode,
  type Stroke
} from '@kalka/scene-graph'

import { getNodeEditCapability } from '#core/editor/capabilities'
import { captureDocumentChange, restoreDocumentChange } from '#core/editor/history/document-change'
import { ungroupNode } from '#core/editor/structure/group'
import type { EditorContext } from '#core/editor/types'

/** Types Figma's Remove frame turns into their children. */
const REMOVABLE_FRAME_TYPES: ReadonlySet<SceneNode['type']> = new Set(['FRAME', 'SECTION'])

/** Types whose box Resize to fit fits to their layers. */
const FITTABLE_TYPES: ReadonlySet<SceneNode['type']> = new Set([
  'FRAME',
  'COMPONENT',
  'COMPONENT_SET',
  'SECTION'
])

/** A fill as a stroke of the layer's stroke weight, as Figma's Swap fill and stroke makes it. */
export function fillAsStroke(fill: Fill, node: Pick<SceneNode, 'strokeWeight' | 'strokes'>) {
  const template = node.strokes.at(0)
  return {
    ...structuredClone(fill),
    weight: template?.weight ?? (node.strokeWeight > 0 ? node.strokeWeight : 1),
    align: template?.align ?? 'INSIDE'
  } satisfies Stroke
}

/** A stroke's paint as a fill. */
export function strokeAsFill(stroke: Stroke): Fill {
  const {
    weight: _weight,
    align: _align,
    cap: _cap,
    join: _join,
    dashPattern: _dash,
    ...paint
  } = structuredClone(stroke)
  return paint
}

/** Bound variables of fills as those of strokes and back, keyed as `fills/0/color`. */
function swapPaintBindings(bindings: Record<string, string>): Record<string, string> {
  return Object.fromEntries(
    Object.entries(bindings).map(([key, value]) => {
      if (key.startsWith('fills')) return [`strokes${key.slice('fills'.length)}`, value]
      if (key.startsWith('strokes')) return [`fills${key.slice('strokes'.length)}`, value]
      return [key, value]
    })
  )
}

/** What Swap fill and stroke writes on a layer. */
export function swappedPaints(node: SceneNode): Partial<SceneNode> {
  return {
    fills: node.strokes.map(strokeAsFill),
    strokes: node.fills.map((fill) => fillAsStroke(fill, node)),
    fillStyleId: node.strokeStyleId,
    strokeStyleId: node.fillStyleId,
    boundVariables: swapPaintBindings(node.boundVariables)
  }
}

/**
 * The small commands of Figma's Object menu that act on the selection as it is: Remove frame,
 * Resize to fit, Swap fill and stroke, Remove fill, Remove stroke and Hide other layers. Each is
 * one undo step that brings the selection back with it.
 */
export function createObjectCommandActions(ctx: EditorContext) {
  function selection(): SceneNode[] {
    return [...ctx.state.selectedIds]
      .map((id) => ctx.graph.getNode(id))
      .filter(
        (node): node is SceneNode =>
          node !== undefined && getNodeEditCapability(ctx.graph, node.id).editable
      )
  }

  /** Runs `edit` as one undo step; it returns the selection to show after it, or null for none. */
  function record(label: string, edit: () => Set<string> | null): boolean {
    const pageId = ctx.state.currentPageId
    const before = new Set(ctx.state.selectedIds)
    const finish = captureDocumentChange(ctx.graph, pageId)
    let after: Set<string> | null = null
    try {
      after = edit()
    } finally {
      const change = finish()
      if (after) {
        const selected = after
        ctx.setSelectedIds(new Set(selected))
        ctx.undo.push({
          label,
          forward: () => {
            restoreDocumentChange(ctx, change, 'after')
            ctx.setSelectedIds(new Set(selected))
          },
          inverse: () => {
            restoreDocumentChange(ctx, change, 'before')
            ctx.setSelectedIds(new Set(before))
          }
        })
        ctx.requestRender()
      }
    }
    return after !== null
  }

  function canRemoveFrame(nodes = selection()): boolean {
    return nodes.some(
      (node) => REMOVABLE_FRAME_TYPES.has(node.type) && node.parentId && node.childIds.length > 0
    )
  }

  /** Puts each selected frame's layers where it was and deletes the frame, as Figma's Remove frame. */
  function removeFrameSelected(): boolean {
    const frames = selection().filter(
      (node) => REMOVABLE_FRAME_TYPES.has(node.type) && node.parentId && node.childIds.length > 0
    )
    if (frames.length === 0) return false
    return record('Remove frame', () => {
      const released = new Set<string>()
      for (const frame of frames) {
        for (const id of ungroupNode(ctx.graph, frame.id) ?? []) released.add(id)
        if (frame.parentId) ctx.runLayoutForNode(frame.parentId)
      }
      return released.size > 0 ? released : null
    })
  }

  function canResizeToFit(nodes = selection()): boolean {
    return nodes.some((node) => FITTABLE_TYPES.has(node.type) && node.childIds.length > 0)
  }

  /**
   * Fits each selected frame to its layers, which stay where they are, as Figma's Resize to fit;
   * an auto layout frame hugs them instead.
   */
  function resizeToFitSelected(): boolean {
    const frames = selection().filter(
      (node) => FITTABLE_TYPES.has(node.type) && node.childIds.length > 0 && node.parentId
    )
    if (frames.length === 0) return false
    return record('Resize to fit', () => {
      let changed = false
      for (const frame of frames) {
        if (frame.layoutMode !== 'NONE') {
          ctx.graph.updateNode(frame.id, { primaryAxisSizing: 'HUG', counterAxisSizing: 'HUG' })
          ctx.runLayoutForNode(frame.id)
          changed = true
          continue
        }
        const parentId = frame.parentId
        if (!parentId || frame.rotation !== 0 || frame.flipX || frame.flipY) continue
        const children = ctx.graph.getChildren(frame.id).filter((child) => child.visible)
        if (children.length === 0) continue
        const bounds = getAxisAlignedBoundsInParent(children, parentId, ctx.graph)
        const dx = bounds.x - frame.x
        const dy = bounds.y - frame.y
        if (dx === 0 && dy === 0 && bounds.width === frame.width && bounds.height === frame.height)
          continue
        ctx.graph.updateNode(frame.id, bounds)
        for (const child of ctx.graph.getChildren(frame.id))
          ctx.graph.updateNode(child.id, { x: child.x - dx, y: child.y - dy })
        ctx.runLayoutForNode(frame.id)
        changed = true
      }
      return changed ? new Set(frames.map((frame) => frame.id)) : null
    })
  }

  function paintable(nodes = selection()): SceneNode[] {
    return nodes.filter((node) => node.type !== 'GROUP' && node.type !== 'CANVAS')
  }

  /** Swaps each selected layer's fills and strokes, with their styles and variables (Shift+X). */
  function swapFillAndStrokeSelected(): boolean {
    const nodes = paintable().filter((node) => node.fills.length > 0 || node.strokes.length > 0)
    if (nodes.length === 0) return false
    const ids = new Set(ctx.state.selectedIds)
    return record('Swap fill and stroke', () => {
      for (const node of nodes) ctx.graph.updateNode(node.id, swappedPaints(node))
      return ids
    })
  }

  function removePaints(kind: 'fills' | 'strokes'): boolean {
    const nodes = paintable().filter((node) => node[kind].length > 0)
    if (nodes.length === 0) return false
    const ids = new Set(ctx.state.selectedIds)
    const styleKey = kind === 'fills' ? 'fillStyleId' : 'strokeStyleId'
    return record(kind === 'fills' ? 'Remove fill' : 'Remove stroke', () => {
      for (const node of nodes) {
        const boundVariables = Object.fromEntries(
          Object.entries(node.boundVariables).filter(([key]) => !key.startsWith(kind))
        )
        ctx.graph.updateNode(node.id, { [kind]: [], [styleKey]: null, boundVariables })
      }
      return ids
    })
  }

  /** Hides every layer of the page but the selection and the layers that hold it. */
  function hideOtherLayers(): boolean {
    const selected = new Set(ctx.state.selectedIds)
    if (selected.size === 0) return false
    const holders = new Set<string>()
    for (const id of selected) {
      for (let node = ctx.graph.getNode(id); node?.parentId;) {
        holders.add(node.parentId)
        node = ctx.graph.getNode(node.parentId)
      }
    }
    const hidden: string[] = []
    const visit = (parentId: string) => {
      for (const child of ctx.graph.getChildren(parentId)) {
        if (selected.has(child.id)) continue
        if (holders.has(child.id)) visit(child.id)
        else if (child.visible) hidden.push(child.id)
      }
    }
    visit(ctx.state.currentPageId)
    if (hidden.length === 0) return false
    return record('Hide other layers', () => {
      for (const id of hidden) ctx.graph.updateNode(id, { visible: false })
      return selected
    })
  }

  return {
    canRemoveFrame: () => canRemoveFrame(),
    removeFrameSelected,
    canResizeToFit: () => canResizeToFit(),
    resizeToFitSelected,
    swapFillAndStrokeSelected,
    removeFillSelected: () => removePaints('fills'),
    removeStrokeSelected: () => removePaints('strokes'),
    hideOtherLayers,
    /** Asks the layers panel to fold every layer, as Figma's Collapse layers. */
    collapseLayers: () => ctx.emitEditorEvent('layers:collapse-requested')
  }
}
