import { createsComponentCycle, type SceneNode } from '@kalka/scene-graph'

import { acceptingParent, acceptsChildren, prepareSlotEdits } from '#core/editor/components/slots'
import { fitEnclosingGroupsWithUndo } from '#core/editor/structure/group-bounds'

import { wrapInAutoLayout as wrapInAutoLayoutImpl } from './structure/auto-layout-wrap'
import {
  booleanOperationSelected as booleanOperationSelectedImpl,
  type BooleanOperation
} from './structure/boolean'
import { wrapSelectionInContainer as wrapSelectionInContainerImpl } from './structure/container-wrap'
import {
  flattenSelected as flattenSelectedImpl,
  outlineStrokeSelected as outlineStrokeSelectedImpl
} from './structure/flatten'
import { ungroupSelected as ungroupImpl } from './structure/group'
import { createLayerTypeActions } from './structure/layer-type'
import { createObjectCommandActions } from './structure/object-commands'
import {
  defaultNodeName,
  previewRenamedNodes,
  type RenameSelectionOptions
} from './structure/rename'
import { createStructureReorderActions } from './structure/reorder'
import { createScaleActions } from './structure/scale'
import { createShapeBuilderActions } from './structure/shape-builder'
import { createStructureStateActions } from './structure/state'
import { createVectorPathActions } from './structure/vector-paths'
import type { EditorContext } from './types'

export function createStructureActions(ctx: EditorContext) {
  const reorderActions = createStructureReorderActions(ctx)
  const stateActions = createStructureStateActions(ctx)
  const layerTypeActions = createLayerTypeActions(ctx)

  function isTopLevel(parentId: string | null): boolean {
    return !parentId || parentId === ctx.graph.rootId || parentId === ctx.state.currentPageId
  }

  /**
   * Moves layers under a new parent; refuses the locked part of an instance, and a layer that
   * would make a component contain itself, as Figma does.
   */
  function reparentNodes(nodeIds: string[], newParentId: string): boolean {
    const parent = ctx.graph.getNode(newParentId)
    // Sections only go into pages and other sections.
    const movable = nodeIds.filter(
      (id) =>
        (ctx.graph.getNode(id)?.type !== 'SECTION' ||
          !parent ||
          parent.type === 'CANVAS' ||
          parent.type === 'SECTION') &&
        !createsComponentCycle(ctx.graph, id, newParentId)
    )
    if (movable.length === 0) return true
    const parents = new Set([newParentId])
    for (const id of movable) {
      const current = ctx.graph.getNode(id)?.parentId
      if (current && current !== newParentId) parents.add(current)
    }
    if (!prepareSlotEdits(ctx, parents)) return false
    for (const id of movable) ctx.graph.reparentNode(id, newParentId)
    return true
  }

  function wrapSelectionInContainer(
    containerType: 'GROUP' | 'FRAME' | 'COMPONENT' | 'COMPONENT_SET',
    selectedNodes: SceneNode[],
    extraProps?: Partial<SceneNode>
  ) {
    return wrapSelectionInContainerImpl(ctx, containerType, selectedNodes, extraProps)
  }

  function wrapInAutoLayout(selectedNodes: SceneNode[]) {
    return wrapInAutoLayoutImpl(ctx, selectedNodes)
  }

  function groupSelected(selectedNodes: SceneNode[]) {
    return wrapSelectionInContainer('GROUP', selectedNodes)
  }

  /** Figma frames a selection without a fill or clipping, unlike a drawn frame. */
  function frameSelection(selectedNodes: SceneNode[]) {
    return wrapSelectionInContainer('FRAME', selectedNodes)
  }

  function booleanOperationSelected(selectedNodes: SceneNode[], operation: BooleanOperation) {
    return booleanOperationSelectedImpl(ctx, selectedNodes, operation)
  }

  function ungroupSelected(selectedNode: SceneNode | undefined) {
    ungroupImpl(ctx, selectedNode)
  }

  function flattenSelected(selectedNodes: SceneNode[]) {
    return flattenSelectedImpl(ctx, selectedNodes)
  }

  function outlineTextSelected(selectedNodes: SceneNode[]) {
    if (selectedNodes.length === 0 || selectedNodes.some((node) => node.type !== 'TEXT'))
      return null
    return flattenSelectedImpl(ctx, selectedNodes, { label: 'Outline text' })
  }

  function outlineStrokeSelected(selectedNodes: SceneNode[]) {
    return outlineStrokeSelectedImpl(ctx, selectedNodes)
  }

  function moveToPage(pageId: string) {
    const targetPage = ctx.graph.getNode(pageId)
    if (targetPage?.type !== 'CANVAS') return
    const prevSelection = new Set(ctx.state.selectedIds)
    // Lowest in their parent's stack first, so undo puts each back while those below are there.
    const moved = [...ctx.state.selectedIds]
      .flatMap((id) => {
        const node = ctx.graph.getNode(id)
        const parent = node?.parentId ? ctx.graph.getNode(node.parentId) : undefined
        if (!node || !parent || parent.id === pageId) return []
        return [
          { id, parentId: parent.id, index: parent.childIds.indexOf(id), x: node.x, y: node.y }
        ]
      })
      .toSorted((a, b) => a.index - b.index)
    if (moved.length === 0) return
    const move = () => {
      for (const { id } of moved) ctx.graph.reparentNode(id, pageId)
      ctx.setSelectedIds(new Set())
    }
    move()
    ctx.undo.push({
      label: 'Move to page',
      forward: move,
      inverse: () => {
        for (const { id, parentId, index, x, y } of moved) {
          ctx.graph.reparentNode(id, parentId)
          ctx.graph.updateNode(id, { x, y })
          ctx.graph.insertChildAt(id, parentId, index)
        }
        ctx.setSelectedIds(prevSelection)
      }
    })
  }

  function selectedNodes(): SceneNode[] {
    return [...ctx.state.selectedIds]
      .map((id) => ctx.graph.getNode(id))
      .filter((node): node is SceneNode => node != null)
  }

  function previewRenameSelected(options: RenameSelectionOptions) {
    return previewRenamedNodes(selectedNodes(), options)
  }

  function renameSelected(options: RenameSelectionOptions) {
    const nodes = selectedNodes()
    if (nodes.length === 0) return
    const before = new Map(nodes.map((node) => [node.id, node.name]))
    const preview = previewRenamedNodes(nodes, options)
    if (preview.error) return
    const applyNames = (names: ReadonlyMap<string, string>) => {
      for (const [id, nextName] of names) ctx.graph.updateNode(id, { name: nextName })
    }

    applyNames(preview.names)
    ctx.undo.push({
      label: 'Rename selection',
      forward: () => applyNames(preview.names),
      inverse: () => applyNames(before)
    })
  }

  function renameNode(id: string, name: string) {
    const node = ctx.graph.getNode(id)
    if (!node) return
    const previous = node.name
    const next = name.trim() || defaultNodeName(node.type)
    if (next === previous) return
    ctx.graph.updateNode(id, { name: next })
    ctx.undo.push({
      label: 'Rename',
      forward: () => ctx.graph.updateNode(id, { name: next }),
      inverse: () => ctx.graph.updateNode(id, { name: previous })
    })
  }

  return {
    isTopLevel,
    acceptsChildren: (parentId: string) => acceptsChildren(ctx, parentId),
    acceptingParent: (parentId: string) => acceptingParent(ctx, parentId),
    fitEnclosingGroups: (parentIds: Iterable<string>) => fitEnclosingGroupsWithUndo(ctx, parentIds),
    ...reorderActions,
    reparentNodes,
    wrapSelectionInContainer,
    wrapInAutoLayout,
    groupSelected,
    frameSelection,
    ...layerTypeActions,
    booleanOperationSelected,
    ungroupSelected,
    flattenSelected,
    outlineTextSelected,
    outlineStrokeSelected,
    ...stateActions,
    ...createObjectCommandActions(ctx),
    ...createVectorPathActions(ctx),
    ...createScaleActions(ctx),
    ...createShapeBuilderActions(ctx),
    moveToPage,
    previewRenameSelected,
    renameSelected,
    renameNode
  }
}
