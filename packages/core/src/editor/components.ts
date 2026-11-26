import type { SceneNode } from '@kalka/scene-graph'

import { createComponentAuthoringActions } from './components/authoring'
import { createBehaviourActions } from './components/behaviours'
import { becomesComponent, componentWrapProps } from './components/create'
import { createComponentFocusActions } from './components/focus'
import { createInstanceCommandActions } from './components/instance-commands'
import { createComponentInstanceActions } from './components/instances'
import { createComponentPropertyActions } from './components/properties'
import { createSlotActions } from './components/slots'
import { createSlotAuthoringActions } from './components/slots/authoring'
import { applyVariantProperties, variantSetProps } from './components/variant-set'
import { createVariantActions } from './components/variants'
import type { EditorContext } from './types'

export function createComponentActions(ctx: EditorContext) {
  function createComponentFromSelection(
    selectedNodes: SceneNode[],
    wrapSelectionInContainer: (
      type: 'GROUP' | 'FRAME' | 'COMPONENT' | 'COMPONENT_SET',
      nodes: SceneNode[],
      extra?: Partial<SceneNode>
    ) => string | null
  ) {
    if (selectedNodes.length === 0) return

    const prevSelection = new Set(ctx.state.selectedIds)

    if (selectedNodes.length === 1) {
      const node = selectedNodes[0]
      const prevType = node.type

      if (node.type === 'COMPONENT') return

      if (becomesComponent(node)) {
        ctx.graph.updateNode(node.id, { type: 'COMPONENT' })
        ctx.setSelectedIds(new Set([node.id]))
        ctx.undo.push({
          label: 'Create component',
          forward: () => {
            ctx.graph.updateNode(node.id, { type: 'COMPONENT' })
            ctx.setSelectedIds(new Set([node.id]))
          },
          inverse: () => {
            ctx.graph.updateNode(node.id, { type: prevType })
            ctx.setSelectedIds(prevSelection)
          }
        })
        return
      }
    }

    wrapSelectionInContainer('COMPONENT', selectedNodes, componentWrapProps(selectedNodes))
  }

  /**
   * Figma's Create multiple components: each selected layer becomes a component of its own, in
   * place, as one undo step, and the new components are selected.
   */
  function createMultipleComponents(
    selectedNodes: SceneNode[],
    wrapSelectionInContainer: (
      type: 'GROUP' | 'FRAME' | 'COMPONENT' | 'COMPONENT_SET',
      nodes: SceneNode[],
      extra?: Partial<SceneNode>
    ) => string | null
  ): string[] {
    const targets = selectedNodes.filter(
      (node) => node.type !== 'COMPONENT' && node.type !== 'COMPONENT_SET'
    )
    if (targets.length === 0) return []
    return ctx.undo.runBatch('Create multiple components', () => {
      const created: string[] = []
      for (const node of targets) {
        createComponentFromSelection([node], wrapSelectionInContainer)
        created.push(...ctx.state.selectedIds)
      }
      ctx.setSelectedIds(new Set(created))
      return created
    })
  }

  function createComponentSetFromComponents(
    selectedNodes: SceneNode[],
    wrapSelectionInContainer: (
      type: 'GROUP' | 'FRAME' | 'COMPONENT' | 'COMPONENT_SET',
      nodes: SceneNode[],
      extra?: Partial<SceneNode>
    ) => string | null
  ) {
    if (selectedNodes.length < 2) return
    if (!selectedNodes.every((n) => n.type === 'COMPONENT')) return
    const parentId = selectedNodes[0].parentId ?? ctx.state.currentPageId
    const containerId = wrapSelectionInContainer(
      'COMPONENT_SET',
      selectedNodes,
      variantSetProps(ctx.graph, selectedNodes, parentId, 'canvas')
    )
    if (!containerId) return
    applyVariantProperties(ctx.graph, selectedNodes, containerId)
  }

  const focusActions = createComponentFocusActions(ctx)
  const instanceActions = createComponentInstanceActions(ctx)
  const variantActions = createVariantActions(ctx)
  const componentPropertyActions = createComponentPropertyActions(
    ctx,
    variantActions.switchInstanceVariant
  )

  return {
    createComponentFromSelection,
    createMultipleComponents,
    createComponentSetFromComponents,
    ...instanceActions,
    ...createInstanceCommandActions(ctx),
    ...focusActions,
    ...variantActions,
    ...componentPropertyActions,
    ...createSlotActions(ctx),
    ...createComponentAuthoringActions(ctx),
    ...createSlotAuthoringActions(ctx),
    ...createBehaviourActions(ctx, variantActions)
  }
}
