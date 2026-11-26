import {
  cloneInstanceOverrideState,
  setInstanceOverride,
  type CharacterStyleOverride,
  type InstanceOverrideState,
  type SceneNode,
  type TextHyperlink,
  type TextListType,
  type UndoEntry
} from '@kalka/scene-graph'
import { copyDerivedGlyphs, copyGeometryPaths } from '@kalka/scene-graph/copy'

import { weightToStyle } from '#core/text/fonts'
import { hasGlyphOutlines } from '#core/text/opentype'

import { applyBoundTextEdit } from './components/authoring/text-edit'
import { pathTextEditChanges } from './text/path-edit'
import {
  createTextEditSession,
  followedTextName,
  resizeTextNodeForEdit,
  snapshotTextNode,
  textSnapshotChanged,
  type TextEditSession
} from './text/session'
import type { EditorContext, ExternalTextEditor } from './types'

/**
 * Path text is edited by re-flowing glyph OUTLINES along its path. When the font
 * is unavailable we can't produce new glyphs, so editing would corrupt the baked
 * lettering — treat it as a baked graphic and refuse to enter edit mode. Non-path
 * text still edits (system-font fallback); path text with the font available
 * edits fully (add/remove characters reflow). "Available" is deliberately broad:
 * today that means loaded locally, but a future remote provider (e.g. Google
 * Fonts) would extend hasGlyphOutlines without changing this gate.
 */
function isPathTextEditable(node: SceneNode): boolean {
  if (!node.textPathData) return true
  return hasGlyphOutlines(node.fontFamily, weightToStyle(node.fontWeight, node.italic))
}

type PathTextEditSnapshot = Pick<
  SceneNode,
  'derivedTextGlyphs' | 'strokeGeometry' | 'textPathData' | 'textPathBox'
>

function snapshotPathText(
  node: SceneNode | undefined,
  includeClearedPathState = false
): PathTextEditSnapshot | null {
  if (!node || (!includeClearedPathState && !node.textPathData)) return null
  return {
    derivedTextGlyphs: copyDerivedGlyphs(node.derivedTextGlyphs),
    strokeGeometry: copyGeometryPaths(node.strokeGeometry),
    textPathData: node.textPathData ? structuredClone(node.textPathData) : null,
    textPathBox: node.textPathBox ? { ...node.textPathBox } : null
  }
}

type InstanceOverridesSnapshot = {
  instanceId: string
  instanceOverrides: InstanceOverrideState
}

function containingInstanceIds(ctx: EditorContext, nodeId: string): string[] {
  const ids: string[] = []
  let current = ctx.graph.getNode(nodeId)
  while (current?.parentId) {
    current = ctx.graph.getNode(current.parentId)
    if (current?.type === 'INSTANCE') ids.push(current.id)
  }
  return ids
}

function snapshotInstanceOverrides(
  ctx: EditorContext,
  instanceIds: string[]
): InstanceOverridesSnapshot[] {
  return instanceIds.flatMap((instanceId) => {
    const instance = ctx.graph.getNode(instanceId)
    return instance?.type === 'INSTANCE'
      ? [{ instanceId, instanceOverrides: cloneInstanceOverrideState(instance.instanceOverrides) }]
      : []
  })
}

function restoreInstanceOverrides(ctx: EditorContext, snapshots: InstanceOverridesSnapshot[]) {
  for (const snapshot of snapshots) {
    ctx.graph.updateNode(snapshot.instanceId, {
      instanceOverrides: cloneInstanceOverrideState(snapshot.instanceOverrides)
    })
  }
}

function applyTextInstanceOverride(
  ctx: EditorContext,
  instanceIds: string[],
  nodeId: string,
  text: string
) {
  for (const instanceId of instanceIds) {
    const instance = ctx.graph.getNode(instanceId)
    if (instance?.type !== 'INSTANCE') continue
    setInstanceOverride(instance.instanceOverrides, instance.id, nodeId, 'text', text)
    ctx.graph.updateNode(instance.id, { instanceOverrides: instance.instanceOverrides })
  }
}

type TextActionOptions = {
  /** Deletes layers as one undo step; an edit that leaves its text layer empty removes it. */
  deleteNodes?: (nodeIds: Iterable<string>) => void
}

/** Tools that leave a text edit open: the one it hands over to, and the hand held with Space. */
const TOOLS_KEEPING_TEXT_EDIT = new Set(['SELECT', 'HAND'])

export function createTextActions(ctx: EditorContext, options: TextActionOptions = {}) {
  let activeSession: TextEditSession | null = null
  /**
   * The undo step that created the layer being edited, when the edit starts on a layer that has
   * no text yet: its first text joins that step, so one Undo removes the new text layer.
   */
  let creationStep: UndoEntry | undefined

  function joinCreationStep() {
    const created = creationStep
    creationStep = undefined
    if (created && ctx.undo.peekUndo(1) === created) ctx.undo.mergeWithPrevious(created.label)
  }

  /**
   * Renames a layer still named after its text to its new text, as Figma does; the names before
   * and after for the edit's undo step, or null when the name stays.
   */
  function renameAfterText(nodeId: string, beforeText: string, afterText: string) {
    const node = ctx.graph.getNode(nodeId)
    const name = followedTextName(node, beforeText, afterText)
    if (!node || name === null) return null
    const names = { before: { name: node.name }, after: { name } }
    ctx.graph.updateNode(nodeId, names.after)
    return names
  }

  function updateTextEditNode(nodeId: string, changes: Partial<SceneNode>) {
    const node = ctx.graph.getNode(nodeId)
    if (!node) return
    ctx.graph.updateNode(nodeId, { ...changes, ...pathTextEditChanges(node, changes) })
  }

  function startTextEditing(nodeId: string) {
    const te = ctx.getTextEditor()
    const external = ctx.getExternalTextEditor()
    if (ctx.state.editingTextId) commitTextEdit()
    const node = ctx.graph.getNode(nodeId)
    if (!node) return
    // Font-gated: unavailable-font path text stays a non-editable baked graphic.
    if (!isPathTextEditable(node)) return
    activeSession = createTextEditSession(node)
    creationStep = node.text === '' ? ctx.undo.peekUndo() : undefined
    ctx.state.editingTextId = nodeId
    if (external) {
      external.start(nodeId)
    } else if (te) {
      te.setRenderer(ctx.getRenderer())
      te.start(node)
    }
    ctx.requestRender()
  }

  /** Ends an edit made by an external editor, which kept the graph in step while typing. */
  function commitExternalTextEdit(external: ExternalTextEditor) {
    const session = activeSession
    external.stop()
    activeSession = null
    ctx.state.editingTextId = null
    const node = session ? ctx.graph.getNode(session.nodeId) : undefined
    if (!session || !node) {
      ctx.requestRender()
      return
    }
    // The graph already holds the edit; this records it as one undo step and keeps instances
    // and bound properties in step, as a canvas edit does.
    const after = snapshotTextNode(node, node.text)
    const before = session.before
    if (!textSnapshotChanged(before, after)) {
      ctx.requestRender()
      return
    }
    const containingInstances = containingInstanceIds(ctx, node.id)
    const instanceOverridesBefore = snapshotInstanceOverrides(ctx, containingInstances)
    const names = renameAfterText(node.id, before.text, after.text)
    if (before.text !== after.text)
      applyTextInstanceOverride(ctx, containingInstances, node.id, after.text)
    const instanceOverridesAfter = snapshotInstanceOverrides(ctx, containingInstances)
    ctx.undo.runBatch('Edit text', () => {
      ctx.undo.push({
        label: 'Edit text',
        forward: () => {
          ctx.graph.updateNode(node.id, {
            text: after.text,
            styleRuns: after.styleRuns,
            listLines: after.listLines ?? [],
            ...names?.after
          })
          restoreInstanceOverrides(ctx, instanceOverridesAfter)
          ctx.runLayoutForNode(node.id)
        },
        inverse: () => {
          ctx.graph.updateNode(node.id, {
            text: before.text,
            styleRuns: before.styleRuns,
            listLines: before.listLines ?? [],
            ...names?.before
          })
          restoreInstanceOverrides(ctx, instanceOverridesBefore)
          ctx.runLayoutForNode(node.id)
        }
      })
      if (before.text !== after.text) applyBoundTextEdit(ctx, node.id, after.text)
    })
    joinCreationStep()
    ctx.requestRender()
  }

  /**
   * As in Figma, a text layer left empty when its edit ends is removed: one made by this edit
   * goes as if never made, and one emptied by it goes in the same undo step as the edit.
   */
  function removeIfEmpty(nodeId: string, topBefore: UndoEntry | undefined) {
    const created = creationStep
    creationStep = undefined
    const node = ctx.graph.getNode(nodeId)
    if (node?.type !== 'TEXT' || node.text !== '' || node.textPathData) return
    if (created && ctx.undo.withdraw(created)) return
    if (!options.deleteNodes) return
    const edited = ctx.undo.peekUndo() !== topBefore
    const beforeDelete = ctx.undo.peekUndo()
    options.deleteNodes([nodeId])
    if (edited && ctx.undo.peekUndo() !== beforeDelete) ctx.undo.mergeWithPrevious('Delete')
  }

  function commitTextEdit() {
    const nodeId = ctx.state.editingTextId
    const topBefore = ctx.undo.peekUndo()
    commitEdit()
    if (nodeId) removeIfEmpty(nodeId, topBefore)
    ctx.requestRender()
  }

  // Another tool ends the edit, as in Figma.
  ctx.onEditorEvent('tool:changed', (tool) => {
    if (ctx.state.editingTextId && !TOOLS_KEEPING_TEXT_EDIT.has(tool)) commitTextEdit()
  })

  function commitEdit() {
    const external = ctx.getExternalTextEditor()
    if (external && ctx.state.editingTextId) {
      commitExternalTextEdit(external)
      return
    }
    const te = ctx.getTextEditor()
    if (!te?.isActive) {
      ctx.state.editingTextId = null
      activeSession = null
      return
    }
    const textState = te.state
    if (!textState) {
      te.stop()
      ctx.state.editingTextId = null
      activeSession = null
      ctx.requestRender()
      return
    }
    const result = { nodeId: textState.nodeId, text: textState.text }
    const before = activeSession?.before ?? { text: '', styleRuns: [], size: {} }
    const beforePathText = activeSession?.beforePathText ?? null
    const node = ctx.graph.getNode(result.nodeId)
    const after = snapshotTextNode(node, result.text)
    after.text = result.text
    const sizeChanges =
      before.text !== after.text ? resizeTextNodeForEdit(node, textState.paragraph) : {}
    if (Object.keys(sizeChanges).length > 0) after.size = sizeChanges
    const changed = textSnapshotChanged(before, after)
    const containingInstances = containingInstanceIds(ctx, result.nodeId)
    const instanceOverridesBefore = snapshotInstanceOverrides(ctx, containingInstances)

    te.stop()

    if (!changed) {
      ctx.state.editingTextId = null
      activeSession = null
      ctx.requestRender()
      return
    }

    updateTextEditNode(result.nodeId, {
      text: after.text,
      styleRuns: after.styleRuns,
      ...sizeChanges
    })
    const afterPathText = snapshotPathText(
      ctx.graph.getNode(result.nodeId),
      beforePathText !== null
    )
    const names = renameAfterText(result.nodeId, before.text, after.text)
    if (before.text !== after.text) {
      applyTextInstanceOverride(ctx, containingInstances, result.nodeId, after.text)
    }
    const instanceOverridesAfter = snapshotInstanceOverrides(ctx, containingInstances)
    ctx.state.editingTextId = null
    activeSession = null

    // Text a property drives becomes the property's value too, in the same undo step.
    ctx.undo.runBatch('Edit text', () => {
      ctx.undo.push({
        label: 'Edit text',
        forward: () => {
          ctx.graph.updateNode(result.nodeId, {
            text: after.text,
            styleRuns: after.styleRuns,
            ...after.size,
            ...afterPathText,
            ...names?.after
          })
          restoreInstanceOverrides(ctx, instanceOverridesAfter)
        },
        inverse: () => {
          ctx.graph.updateNode(result.nodeId, {
            text: before.text,
            styleRuns: before.styleRuns,
            ...before.size,
            ...beforePathText,
            ...names?.before
          })
          restoreInstanceOverrides(ctx, instanceOverridesBefore)
        }
      })
      if (before.text !== after.text) applyBoundTextEdit(ctx, result.nodeId, after.text)
    })
    joinCreationStep()
  }

  /**
   * Styles the characters selected in the text being edited, rather than the layer; false when
   * `nodeId` is not being edited or no characters are selected.
   */
  function styleTextSelection(nodeId: string, style: CharacterStyleOverride): boolean {
    if (ctx.state.editingTextId !== nodeId) return false
    return ctx.getExternalTextEditor()?.styleSelection?.(style) ?? false
  }

  /**
   * Sets the list of the paragraphs the selection touches in the text being edited, as Figma's
   * list buttons do while typing; false when `nodeId` is not being edited.
   */
  function listTextSelection(nodeId: string, type: TextListType): boolean {
    if (ctx.state.editingTextId !== nodeId) return false
    return ctx.getExternalTextEditor()?.listSelection?.(type) ?? false
  }

  /**
   * The link the selection of the text being edited is in, the whole link selected when only the
   * caret is in it; null outside a link or when `nodeId` is not being edited.
   */
  function selectTextLink(nodeId: string): TextHyperlink | null {
    if (ctx.state.editingTextId !== nodeId) return null
    return ctx.getExternalTextEditor()?.selectLink?.() ?? null
  }

  /** Gives the text being edited the keyboard again, after a dialog took it. */
  function focusTextEdit(): void {
    if (ctx.state.editingTextId) ctx.getExternalTextEditor()?.focus?.()
  }

  return {
    startTextEditing,
    updateTextEditNode,
    commitTextEdit,
    styleTextSelection,
    listTextSelection,
    selectTextLink,
    focusTextEdit
  }
}
