import type { NodeType, SceneNode } from '@kalka/scene-graph'
import { lineEndNetwork } from '@kalka/scene-graph/arrow-caps'

import { prepareSlotEdits } from './components/slots'
import { adoptCoveredLayers } from './shapes/adopt'
import { defaultPropertiesFor, defaultPropertiesOf } from './shapes/default-properties'
import { newLayerDefaults } from './shapes/defaults'
import { createFramePresetActions } from './shapes/frame-presets'
import { createPenActions } from './shapes/pen'
import { createPencilActions } from './shapes/pencil'
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
      ...defaultPropertiesFor(type, ctx.state.defaultLayerProperties),
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
   * Figma's Set default properties: new shapes, or new texts, take the selected layer's look.
   * False when the selection is not a single shape or text.
   */
  function setDefaultPropertiesFromSelection(): boolean {
    const [id, ...rest] = ctx.state.selectedIds
    const node = id && rest.length === 0 ? ctx.graph.getNode(id) : undefined
    const taken = node ? defaultPropertiesOf(node) : null
    if (!taken) return false
    ctx.state.defaultLayerProperties = {
      shape: ctx.state.defaultLayerProperties?.shape ?? null,
      text: ctx.state.defaultLayerProperties?.text ?? null,
      [taken.kind]: taken.properties
    }
    return true
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
    setDefaultPropertiesFromSelection,
    ...penActions,
    ...createPencilActions(ctx, createShape),
    ...framePresetActions,
    adoptCoveredLayers: (containerId: string) => adoptCoveredLayers(ctx, containerId),
    setTool
  }
}
