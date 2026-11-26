import { pick } from 'es-toolkit/object'

import {
  styleDetachmentChanges,
  findInstanceAncestor,
  cloneInstanceOverrideState,
  recordInstanceOverride,
  type SceneNode
} from '@kalka/scene-graph'

import { reconcileVariableLayouts } from '#core/layout/variables'

import { applyBoundVisibilityEdit, bindsVisibility } from './components/authoring/visibility-edit'
import { createLayoutModeActions } from './layout-mode'
import { createNodePreviewActions } from './node-preview'
import { createNudgeActions } from './nudge'
import { recordWithGroupFit } from './structure/group-bounds'
import { textAutoResizeChanges } from './text/auto-resize'
import { pathTextEditChanges } from './text/path-edit'
import type { EditorContext } from './types'
import { createVariableBindingActions } from './variable-bindings'
import { loadBoundFontFamilies } from './variable-fonts'

export function opacityFromBuffer(buffer: string): number {
  if (buffer === '0') return 1
  if (!/^\d+$/.test(buffer)) return 1
  const n = Number.parseInt(buffer, 10)
  if (!Number.isFinite(n)) return 1
  const percent = buffer.length === 1 ? n * 10 : n
  return Math.min(100, Math.max(0, percent)) / 100
}

export function createNodeActions(ctx: EditorContext) {
  const layoutModeActions = createLayoutModeActions(ctx)
  const nudgeActions = createNudgeActions(ctx)
  const variableBindingActions = createVariableBindingActions(ctx)

  function runChangedLayout(id: string, changes: Partial<SceneNode>) {
    // A layer's modes reach the layers inside it.
    if (changes.variableModes)
      loadBoundFontFamilies(ctx, reconcileVariableLayouts(ctx.graph, { subtrees: [id] }))
    ctx.runLayoutForNode(id)
  }

  function updateNode(id: string, changes: Partial<SceneNode>) {
    const node = ctx.graph.getNode(id)
    if (!node) return
    // Path-edit last so its reflowed glyphs win over auto-resize's glyph clear
    // (path text is textAutoResize NONE so they don't collide today).
    const nextChanges = styleDetachmentChanges(node, {
      ...changes,
      ...textAutoResizeChanges(node, changes),
      ...pathTextEditChanges(node, changes)
    })
    ctx.graph.updateNode(id, nextChanges)
    recordInstanceOverride(ctx.graph, id, Object.keys(nextChanges))
    runChangedLayout(id, nextChanges)
  }

  function updateNodeWithUndo(id: string, changes: Partial<SceneNode>, label = 'Update') {
    const node = ctx.graph.getNode(id)
    if (!node) return
    // A layer a boolean property shows or hides sets the property too, in the same undo step.
    // It takes the value even where the layer already shows it, so the two agree.
    const visible = changes.visible
    if (visible !== undefined && bindsVisibility(node)) {
      ctx.undo.runBatch(label, () => {
        recordNodeUpdate(node, changes, label)
        applyBoundVisibilityEdit(ctx, id, visible)
      })
      return
    }
    recordWithGroupFit(ctx, id, label, Object.keys(changes), () =>
      recordNodeUpdate(node, changes, label)
    )
  }

  function recordNodeUpdate(node: SceneNode, changes: Partial<SceneNode>, label: string) {
    const { id } = node
    // Same ordering rationale as updateNode: reflowed path-text glyphs win.
    const nextChanges = styleDetachmentChanges(node, {
      ...changes,
      ...textAutoResizeChanges(node, changes),
      ...pathTextEditChanges(node, changes)
    })
    const owner = findInstanceAncestor(ctx.graph, id)
    const previousOverrides = owner
      ? cloneInstanceOverrideState(owner.instanceOverrides)
      : undefined
    // The graph may let CSS written as is give way to the fields (`styleAfterFieldChanges`).
    const previous = pick(node, [
      ...(Object.keys(nextChanges) as (keyof SceneNode)[]),
      'style'
    ]) as Partial<SceneNode>
    ctx.graph.updateNode(id, nextChanges)
    recordInstanceOverride(ctx.graph, id, Object.keys(nextChanges))
    runChangedLayout(id, nextChanges)
    ctx.undo.push({
      label,
      forward: () => {
        ctx.graph.updateNode(id, nextChanges)
        recordInstanceOverride(ctx.graph, id, Object.keys(nextChanges))
        runChangedLayout(id, nextChanges)
      },
      inverse: () => {
        ctx.graph.updateNode(id, previous)
        if (owner && previousOverrides)
          ctx.graph.updateNode(owner.id, {
            instanceOverrides: cloneInstanceOverrideState(previousOverrides)
          })
        runChangedLayout(id, nextChanges)
      }
    })
    ctx.requestRender()
  }

  function setOpacity(opacity: number, coalesceKey?: string) {
    if (!Number.isFinite(opacity)) return
    const clamped = Math.max(0, Math.min(1, opacity))
    const ids = [...ctx.state.selectedIds]
    if (ids.length === 0) return
    const targets = ids.map((id) => ctx.graph.getNode(id)).filter((n): n is SceneNode => n != null)
    const changed = targets.filter((t) => t.opacity !== clamped)
    if (changed.length === 0) return
    ctx.undo.runBatch(
      'Set opacity',
      () => {
        for (const target of changed) {
          updateNodeWithUndo(target.id, { opacity: clamped }, 'Set opacity')
        }
      },
      coalesceKey
    )
  }

  /**
   * Sets the mode a layer and the layers inside it use for one collection, as Figma's "Change
   * variable mode" does; `undefined` goes back to the mode it inherits. One undo step for the whole
   * selection.
   */
  function setNodeVariableMode(ids: string[], collectionId: string, modeId: string | undefined) {
    const collection = ctx.graph.variableCollections.get(collectionId)
    if (!collection) return
    if (modeId !== undefined && !collection.modes.some((mode) => mode.modeId === modeId)) return
    const changed = ids.flatMap((id) => {
      const node = ctx.graph.getNode(id)
      return node && node.variableModes[collectionId] !== modeId ? [node] : []
    })
    if (changed.length === 0) return
    ctx.undo.runBatch('Change variable mode', () => {
      for (const node of changed) {
        const { [collectionId]: _previous, ...rest } = node.variableModes
        const variableModes = modeId === undefined ? rest : { ...rest, [collectionId]: modeId }
        updateNodeWithUndo(node.id, { variableModes }, 'Change variable mode')
      }
    })
  }

  return {
    updateNode,
    ...createNodePreviewActions(ctx, updateNode),
    updateNodeWithUndo,
    setOpacity,
    setNodeVariableMode,
    ...layoutModeActions,
    ...variableBindingActions,
    ...nudgeActions
  }
}
