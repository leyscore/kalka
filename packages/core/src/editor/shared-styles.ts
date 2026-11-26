import {
  findInstanceAncestor,
  sharedStyleConsumers,
  sharedStyleFields,
  sharedStyleKindsForType,
  sharedStyleRefKey,
  sharedStyleTypeForKind,
  sharedStyleValues,
  sharedStyleValuesFromLayer,
  supportsSharedStyle,
  type NodeType,
  type SceneNode,
  type SharedStyle,
  type SharedStyleKind,
  type SharedStyleType
} from '@kalka/scene-graph'

import type { createNodeActions } from './nodes'
import type { EditorContext } from './types'

type NodeActions = ReturnType<typeof createNodeActions>

/**
 * The layer a definition is, as `.fig` files keep them: text for a text style, a frame for a
 * grid style, a rectangle for colour and effect styles.
 */
const DEFINITION_NODE_TYPES: Record<SharedStyleType, NodeType> = {
  FILL: 'RECTANGLE',
  TEXT: 'TEXT',
  EFFECT: 'RECTANGLE',
  GRID: 'FRAME'
}

const CREATE_LABELS: Record<SharedStyleType, string> = {
  FILL: 'Create color style',
  TEXT: 'Create text style',
  EFFECT: 'Create effect style',
  GRID: 'Create grid style'
}

const EDIT_LABELS: Record<SharedStyleType, string> = {
  FILL: 'Edit color style',
  TEXT: 'Edit text style',
  EFFECT: 'Edit effect style',
  GRID: 'Edit grid style'
}

/**
 * Shared styles as Figma's local styles: each is a definition layer, hidden from the canvas and
 * the layer list, that layers point at by its style id. Every action is one undo step.
 */
export function createSharedStyleActions(ctx: EditorContext, nodes: NodeActions) {
  /** Styles go on the document's internal page, as `.fig` files keep them, or the current page. */
  function styleHostId(): string {
    return ctx.graph.getPages(true).find((page) => page.internalOnly)?.id ?? ctx.state.currentPageId
  }

  /** A new style definition, which redo makes again with the same ids so layers stay attached. */
  function addStyleNode(type: NodeType, props: Partial<SceneNode>): SceneNode {
    const node = ctx.graph.createNode(type, styleHostId(), { ...props, internalOnly: true })
    node.source.id = crypto.randomUUID()
    const snapshot = structuredClone(node)
    const parentId = node.parentId
    ctx.undo.push({
      label: 'Add style',
      forward: () => {
        ctx.graph.createNodeWithId(snapshot.id, snapshot.type, parentId, structuredClone(snapshot))
        ctx.requestRender()
      },
      inverse: () => {
        ctx.graph.deleteNode(snapshot.id)
        ctx.requestRender()
      }
    })
    return node
  }

  function styleDefinition(styleNodeId: string): SceneNode | null {
    const node = ctx.graph.getNode(styleNodeId)
    return node && node.sharedStyleType !== null && node.source.id ? node : null
  }

  /**
   * Makes a style of `kind` from the first given layer's current properties, named `name` (a `/`
   * files it in a folder), and applies it to the given layers that can use it. A style made from
   * a stroke is a colour style, as in Figma.
   */
  function createSharedStyle(
    kind: SharedStyleKind,
    name: string,
    nodeIds: readonly string[]
  ): SharedStyle | null {
    const trimmed = name.trim()
    const targets = nodeIds
      .map((id) => ctx.graph.getNode(id))
      .filter((node): node is SceneNode => !!node && supportsSharedStyle(node, kind))
    const source = targets.at(0)
    if (!trimmed || !source) return null
    const type = sharedStyleTypeForKind(kind)
    const label = CREATE_LABELS[type]
    return ctx.undo.runBatch(label, () => {
      const style = addStyleNode(DEFINITION_NODE_TYPES[type], {
        ...sharedStyleValuesFromLayer(kind, source),
        ...(type === 'TEXT' ? { text: 'Ag' } : {}),
        name: trimmed,
        sharedStyleType: type
      })
      const styleId = style.source.id
      if (!styleId) return null
      for (const target of targets) {
        nodes.updateNodeWithUndo(
          target.id,
          { ...sharedStyleValues(kind, target, style), [sharedStyleRefKey(kind)]: styleId },
          label
        )
      }
      ctx.requestRender()
      return { id: styleId, nodeId: style.id, name: trimmed, type }
    })
  }

  /** Makes a text style from text layers; see `createSharedStyle`. */
  function createTextStyle(name: string, nodeIds: readonly string[]): SharedStyle | null {
    return createSharedStyle('text', name, nodeIds)
  }

  /**
   * Changes a style's values (a colour style's paints, an effect style's effects, a grid style's
   * guides, a text style's type settings) and every layer that uses it, as one undo step. Layers
   * in instances follow their component, so only definitions are changed.
   */
  function updateSharedStyle(styleNodeId: string, changes: Partial<SceneNode>) {
    const style = styleDefinition(styleNodeId)
    const styleId = style?.source.id
    const type = style?.sharedStyleType
    if (!style || !styleId || !type) return
    const allowed = new Set<string>(sharedStyleFields(type))
    const styleChanges = Object.fromEntries(
      Object.entries(changes).filter(([key]) => allowed.has(key))
    ) as Partial<SceneNode>
    if (Object.keys(styleChanges).length === 0) return
    const label = EDIT_LABELS[type]
    ctx.undo.runBatch(label, () => {
      nodes.updateNodeWithUndo(style.id, styleChanges, label)
      for (const kind of sharedStyleKindsForType(type)) {
        for (const consumer of sharedStyleConsumers(ctx.graph, kind, styleId)) {
          if (findInstanceAncestor(ctx.graph, consumer.id)) continue
          nodes.updateNodeWithUndo(
            consumer.id,
            { ...sharedStyleValues(kind, consumer, style), [sharedStyleRefKey(kind)]: styleId },
            label
          )
        }
      }
      ctx.requestRender()
    })
  }

  /** Changes a text style; see `updateSharedStyle`. */
  function updateTextStyle(styleNodeId: string, changes: Partial<SceneNode>) {
    if (styleDefinition(styleNodeId)?.sharedStyleType !== 'TEXT') return
    updateSharedStyle(styleNodeId, changes)
  }

  function renameSharedStyle(styleNodeId: string, name: string) {
    const style = styleDefinition(styleNodeId)
    const trimmed = name.trim()
    if (!style || !trimmed || style.name === trimmed) return
    nodes.updateNodeWithUndo(style.id, { name: trimmed }, 'Rename style')
  }

  /** Sets a style's description, which Figma shows with the style and its libraries publish. */
  function describeSharedStyle(styleNodeId: string, description: string) {
    const style = styleDefinition(styleNodeId)
    const next = description.trim()
    if (!style || style.symbolDescription === next) return
    nodes.updateNodeWithUndo(style.id, { symbolDescription: next }, 'Edit style description')
  }

  /**
   * Makes a copy of a style with its name, description, values and variable bindings, listed
   * right after it, as Figma's Duplicate style. Layers stay on the original.
   */
  function duplicateSharedStyle(styleNodeId: string): SharedStyle | null {
    const style = styleDefinition(styleNodeId)
    const type = style?.sharedStyleType
    if (!style || !type) return null
    return ctx.undo.runBatch('Duplicate style', () => {
      const values = Object.fromEntries(
        sharedStyleFields(type).map((field) => [field, structuredClone(style[field])])
      ) as Partial<SceneNode>
      const copy = addStyleNode(style.type, {
        ...values,
        ...(type === 'TEXT' ? { text: style.text } : {}),
        boundVariables: { ...style.boundVariables },
        symbolDescription: style.symbolDescription,
        name: style.name,
        sharedStyleType: type
      })
      const copyId = copy.source.id
      if (!copyId) return null
      moveSharedStyle(copy.id, style.id, 'after')
      ctx.requestRender()
      return { id: copyId, nodeId: copy.id, name: copy.name, type }
    })
  }

  /**
   * Deletes a style. Layers that used it keep the values it gave them and are detached from it,
   * all in one undo step.
   */
  function deleteSharedStyle(styleNodeId: string) {
    const style = styleDefinition(styleNodeId)
    const type = style?.sharedStyleType
    const styleId = style?.source.id
    if (!style || !type || !styleId) return
    const parentId = style.parentId
    const index = parentId ? (ctx.graph.getNode(parentId)?.childIds.indexOf(style.id) ?? -1) : -1
    const snapshot = structuredClone(style)
    ctx.undo.runBatch('Delete style', () => {
      // Stroke styles share fill definitions, so both links let go.
      for (const linked of sharedStyleKindsForType(type)) {
        for (const consumer of sharedStyleConsumers(ctx.graph, linked, styleId))
          nodes.updateNodeWithUndo(
            consumer.id,
            { [sharedStyleRefKey(linked)]: null },
            'Delete style'
          )
      }
      ctx.graph.deleteNode(style.id)
      ctx.undo.push({
        label: 'Delete style',
        forward: () => {
          ctx.graph.deleteNode(snapshot.id)
          ctx.requestRender()
        },
        inverse: () => {
          ctx.graph.createNodeWithId(
            snapshot.id,
            snapshot.type,
            parentId,
            structuredClone(snapshot)
          )
          if (parentId && index >= 0) ctx.graph.reorderChild(snapshot.id, parentId, index)
          ctx.requestRender()
        }
      })
      ctx.requestRender()
    })
  }

  /** Moves a style before or after another in the order styles are listed. */
  function moveSharedStyle(
    styleNodeId: string,
    targetStyleNodeId: string,
    placement: 'before' | 'after'
  ) {
    const style = styleDefinition(styleNodeId)
    const target = styleDefinition(targetStyleNodeId)
    if (!style || !target || style.id === target.id || !style.parentId || !target.parentId) return
    const fromParentId = style.parentId
    const fromIndex = ctx.graph.getNode(fromParentId)?.childIds.indexOf(style.id) ?? -1
    const parent = ctx.graph.getNode(target.parentId)
    if (!parent) return
    const siblings = parent.childIds.filter((id) => id !== style.id)
    const targetIndex = siblings.indexOf(target.id)
    const toIndex = placement === 'before' ? targetIndex : targetIndex + 1
    const toParentId = parent.id
    const apply = () => {
      ctx.graph.reorderChild(style.id, toParentId, toIndex)
      ctx.requestRender()
    }
    apply()
    ctx.undo.push({
      label: 'Move style',
      forward: apply,
      inverse: () => {
        ctx.graph.reorderChild(style.id, fromParentId, Math.max(0, fromIndex))
        ctx.requestRender()
      }
    })
  }

  return {
    addStyleNode,
    createSharedStyle,
    createTextStyle,
    updateSharedStyle,
    updateTextStyle,
    renameSharedStyle,
    describeSharedStyle,
    duplicateSharedStyle,
    deleteSharedStyle,
    moveSharedStyle
  }
}
