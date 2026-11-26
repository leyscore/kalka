import type { NodeType, SceneNode } from '@kalka/scene-graph'
import { lineEndNetwork } from '@kalka/scene-graph/arrow-caps'

import { prepareSlotEdits } from './components/slots'
import { adoptCoveredLayers } from './shapes/adopt'
import { newLayerDefaults } from './shapes/defaults'
import { createFramePresetActions } from './shapes/frame-presets'
import { createPenActions } from './shapes/pen'
import { defaultNodeName, nextNumberedName } from './structure/rename'
import type { EditorContext } from './types'
export type { PenDragOptions } from './shapes/pen'

/** Layers Figma numbers when drawn, as "Rectangle 1"; others keep their type's name. */
const NUMBERED_WHEN_DRAWN: ReadonlySet<NodeType> = new Set([
  'FRAME',
  'SECTION',
  'RECTANGLE',
  'ELLIPSE',
  'LINE',
  'POLYGON',
  'STAR'
])

export function createShapeActions(ctx: EditorContext) {
  function drawnLayerName(type: NodeType, parentId: string): string {
    const base = defaultNodeName(type)
    return NUMBERED_WHEN_DRAWN.has(type) ? nextNumberedName(ctx.graph, parentId, base) : base
  }

  function createShape(
    type: NodeType,
    x: number,
    y: number,
    w: number,
    h: number,
    parentId?: string,
    name?: string,
    extra: Partial<SceneNode> = {}
  ): string {
    const pid = parentId ?? ctx.state.currentPageId
    // Inside an instance only a slot takes new layers, and the instance claims it first.
    if (!prepareSlotEdits(ctx, [pid])) {
      throw new Error('Cannot add a layer to the locked part of an instance')
    }
    const overrides: Partial<SceneNode> = {
      ...newLayerDefaults(type, ctx.state.theme),
      x,
      y,
      width: w,
      height: h,
      name: name ?? drawnLayerName(type, pid),
      ...extra
    }
    const node = ctx.graph.createNode(type, pid, overrides)
    const id = node.id
    const snapshot = { ...node }
    ctx.undo.push({
      label: `Create ${type.toLowerCase()}`,
      forward: () => {
        ctx.graph.createNode(snapshot.type, pid, snapshot)
      },
      inverse: () => {
        ctx.graph.deleteNode(id)
        const next = new Set(ctx.state.selectedIds)
        next.delete(id)
        ctx.setSelectedIds(next)
      }
    })
    return id
  }

  /**
   * An arrow as Figma's Arrow tool draws it, "Arrow 1": a line whose end alone carries a line
   * arrowhead, kept on the network of its two ends.
   */
  function createArrow(x: number, y: number, w: number, h: number, parentId?: string): string {
    const pid = parentId ?? ctx.state.currentPageId
    return createShape('LINE', x, y, w, h, pid, nextNumberedName(ctx.graph, pid, 'Arrow'), {
      vectorNetwork: lineEndNetwork(w, h, { end: 'ARROW_LINES' })
    })
  }

  const penActions = createPenActions(ctx, createShape)
  const framePresetActions = createFramePresetActions(ctx, createShape)

  function setTool(tool: typeof ctx.state.activeTool) {
    ctx.setActiveTool(tool)
  }

  return {
    createShape,
    createArrow,
    ...penActions,
    ...framePresetActions,
    adoptCoveredLayers: (containerId: string) => adoptCoveredLayers(ctx, containerId),
    setTool
  }
}
