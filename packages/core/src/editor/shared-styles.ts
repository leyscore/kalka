import {
  findInstanceAncestor,
  SHARED_TEXT_STYLE_FIELDS,
  sharedStyleConsumers,
  sharedStyleRefKey,
  sharedTextStyleValues,
  type NodeType,
  type SceneNode,
  type SharedStyle,
  type SharedStyleKind
} from '@kalka/scene-graph'

import type { createNodeActions } from './nodes'
import type { EditorContext } from './types'

type NodeActions = ReturnType<typeof createNodeActions>

const SHARED_TEXT_STYLE_KEYS = new Set<string>(SHARED_TEXT_STYLE_FIELDS)

/** The style kind a definition layer holds; stroke styles are fill styles. */
function definitionKind(node: SceneNode): SharedStyleKind | null {
  switch (node.sharedStyleType) {
    case 'FILL':
      return 'fill'
    case 'TEXT':
      return 'text'
    case 'EFFECT':
      return 'effect'
    case 'GRID':
      return 'grid'
    default:
      return null
  }
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
   * Makes a text style from a text layer's current properties, named `name` (a `/` files it in a
   * folder), and applies it to that layer and the other given text layers.
   */
  function createTextStyle(name: string, nodeIds: readonly string[]): SharedStyle | null {
    const trimmed = name.trim()
    const targets = nodeIds
      .map((id) => ctx.graph.getNode(id))
      .filter((node): node is SceneNode => node?.type === 'TEXT')
    const source = targets.at(0)
    if (!trimmed || !source) return null
    return ctx.undo.runBatch('Create text style', () => {
      const style = addStyleNode('TEXT', {
        ...sharedTextStyleValues(source),
        name: trimmed,
        text: 'Ag',
        sharedStyleType: 'TEXT'
      })
      const styleId = style.source.id
      if (!styleId) return null
      for (const target of targets) {
        nodes.updateNodeWithUndo(
          target.id,
          { ...sharedTextStyleValues(style), textStyleId: styleId },
          'Create text style'
        )
      }
      ctx.requestRender()
      return { id: styleId, nodeId: style.id, name: trimmed, type: 'TEXT' }
    })
  }

  /**
   * Changes a text style's properties and every layer that uses it, as one undo step. Layers in
   * instances follow their component, so only definitions are changed.
   */
  function updateTextStyle(styleNodeId: string, changes: Partial<SceneNode>) {
    const style = styleDefinition(styleNodeId)
    const styleId = style?.source.id
    if (style?.sharedStyleType !== 'TEXT' || !styleId) return
    const styleChanges = Object.fromEntries(
      Object.entries(changes).filter(([key]) => SHARED_TEXT_STYLE_KEYS.has(key))
    ) as Partial<SceneNode>
    if (Object.keys(styleChanges).length === 0) return
    ctx.undo.runBatch('Edit text style', () => {
      nodes.updateNodeWithUndo(style.id, styleChanges, 'Edit text style')
      for (const consumer of sharedStyleConsumers(ctx.graph, 'text', styleId)) {
        if (findInstanceAncestor(ctx.graph, consumer.id)) continue
        nodes.updateNodeWithUndo(
          consumer.id,
          { ...sharedTextStyleValues(style), textStyleId: styleId },
          'Edit text style'
        )
      }
      ctx.requestRender()
    })
  }

  function renameSharedStyle(styleNodeId: string, name: string) {
    const style = styleDefinition(styleNodeId)
    const trimmed = name.trim()
    if (!style || !trimmed || style.name === trimmed) return
    nodes.updateNodeWithUndo(style.id, { name: trimmed }, 'Rename style')
  }

  /**
   * Deletes a style. Layers that used it keep the values it gave them and are detached from it,
   * all in one undo step.
   */
  function deleteSharedStyle(styleNodeId: string) {
    const style = styleDefinition(styleNodeId)
    const kind = style ? definitionKind(style) : null
    const styleId = style?.source.id
    if (!style || !kind || !styleId) return
    const parentId = style.parentId
    const index = parentId ? (ctx.graph.getNode(parentId)?.childIds.indexOf(style.id) ?? -1) : -1
    const snapshot = structuredClone(style)
    ctx.undo.runBatch('Delete style', () => {
      // Stroke styles share fill definitions, so both links let go.
      const kinds: SharedStyleKind[] = kind === 'fill' ? ['fill', 'stroke'] : [kind]
      for (const linked of kinds) {
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
    createTextStyle,
    updateTextStyle,
    renameSharedStyle,
    deleteSharedStyle,
    moveSharedStyle
  }
}
