import { isEqual } from 'es-toolkit'
import { useFilter } from 'reka-ui'

import type { Editor, NodePreview } from '@kalka/core/editor'
import {
  isNumericVariableBindingField,
  parseEffectBindingField,
  resolvedEffectBindings,
  type SceneNode,
  type Variable,
  type VariableType
} from '@kalka/scene-graph'

import type {
  BindingValueEdit,
  BindingProvider,
  BindingState,
  BindingTarget
} from '#vue/controls/binding-provider/types'
import { useEditor } from '#vue/editor/context'
import { useSceneComputed } from '#vue/internal/scene-computed/use'

import { resolveEffectiveBindingValue } from './resolution'

export interface KalkaBindingProviderOptions<V> {
  type: VariableType
  resolve(editor: Editor, variableId: string, target?: BindingTarget): V | undefined
  create?(editor: Editor, target: BindingTarget, value: V, name: string): void
  prepareEdit?(
    editor: Editor,
    variableId: string,
    target: BindingTarget
  ): BindingValueEdit<V> | undefined
}

export function createKalkaBindingProvider<V>(
  editor: Editor,
  options: KalkaBindingProviderOptions<V>,
  revision?: BindingProvider<V>['revision']
): BindingProvider<V> {
  const { contains } = useFilter({ sensitivity: 'base' })
  const variables = () => editor.getVariablesByType(options.type)
  const interactiveEdits: Array<() => void> = []

  function finishBatch(commit: boolean) {
    try {
      if (commit) editor.undo.commitBatch()
      else editor.undo.rollbackBatch()
    } finally {
      interactiveEdits.pop()?.()
    }
  }

  function filterVariables(term: string): Variable[] {
    if (!term) return variables()
    return variables().filter((variable) => contains(variable.name, term))
  }

  function getBound(target: BindingTarget): Variable | undefined {
    void revision?.value
    const variableId = editor.getNode(target.nodeId)?.boundVariables[target.path]
    return variableId ? editor.getVariable(variableId) : undefined
  }

  function getState(targets: BindingTarget[]): BindingState {
    if (targets.length === 0) return 'unbound'
    const variableIds = new Set(
      targets.map(
        (target) => editor.getNode(target.nodeId)?.boundVariables[target.path] ?? undefined
      )
    )
    // Identity takes precedence: an explicit mixed edit can detach the selection.
    // edit-variable still requires every bound destination to prepare successfully.
    if (variableIds.size > 1) return 'mixed'
    const unresolved = targets.some((target) => {
      const id = editor.getNode(target.nodeId)?.boundVariables[target.path]
      return (
        id !== undefined &&
        (resolveEffectiveBindingValue(editor, id, target) === undefined ||
          options.resolve(editor, id, target) === undefined)
      )
    })
    if (unresolved) return 'unresolved'
    if (variableIds.has(undefined)) return 'unbound'
    const values = targets.map((target) => {
      const id = editor.getNode(target.nodeId)?.boundVariables[target.path]
      return id ? options.resolve(editor, id, target) : undefined
    })
    if (values.some((value) => value === undefined)) return 'unresolved'
    return values.every((value) => isEqual(value, values[0])) ? 'bound' : 'mixed'
  }

  let hovered: NodePreview | undefined

  /** The node changes that binding `target` to a variable would show, as a preview. */
  function boundChanges(target: BindingTarget, variableId: string): Partial<SceneNode> | undefined {
    const node = editor.getNode(target.nodeId)
    const value = options.resolve(editor, variableId, target)
    if (!node || value === undefined) return undefined
    const changes: Partial<SceneNode> = {
      boundVariables: { ...node.boundVariables, [target.path]: variableId }
    }
    const paint = target.path.match(/^(fills|strokes)\/(\d+)\/color$/)
    if (paint && typeof value === 'object' && value !== null && 'r' in value) {
      const key = paint[1] === 'fills' ? 'fills' : 'strokes'
      const index = Number(paint[2])
      changes[key] = node[key].map((item, i) =>
        i === index ? { ...item, color: structuredClone(value) } : item
      ) as SceneNode['fills'] & SceneNode['strokes']
    } else if (isNumericVariableBindingField(target.path) && typeof value === 'number') {
      Object.assign(changes, { [target.path]: value })
    } else if (parseEffectBindingField(target.path)) {
      const { effects } = resolvedEffectBindings(editor.graph, { ...node, ...changes })
      if (effects) changes.effects = effects
    }
    return changes
  }

  function preview(targets: BindingTarget[], variableId: string | null) {
    if (variableId === null) {
      hovered?.cancel()
      hovered = undefined
      return
    }
    const edits = targets.flatMap((target) => {
      const changes = boundChanges(target, variableId)
      return changes ? [{ id: target.nodeId, changes }] : []
    })
    if (!edits.length) return
    if (!hovered || hovered.closed) hovered = editor.beginNodePreview('Preview variable')
    for (const { id, changes } of edits) hovered.update(id, changes)
  }

  return {
    revision,
    listVariables: variables,
    collectionName: (variable) => editor.getCollection(variable.collectionId)?.name,
    filterVariables,
    getBindingId: (target) => editor.getNode(target.nodeId)?.boundVariables[target.path],
    getBound,
    getState,
    resolve: (variableId, target) => options.resolve(editor, variableId, target),
    bind: (target, variableId) => editor.bindVariable(target.nodeId, target.path, variableId),
    preview,
    unbind: (target) => editor.unbindVariable(target.nodeId, target.path),
    create: options.create
      ? (target, value, name) => options.create?.(editor, target, value, name)
      : undefined,
    prepareEdit: options.prepareEdit
      ? (variableId, target) => options.prepareEdit?.(editor, variableId, target)
      : undefined,
    runBatch: (label, action) => editor.undo.runBatch(label, action),
    beginBatch: (label) => {
      editor.undo.beginBatch(label)
      interactiveEdits.push(editor.beginInteractiveEdit())
    },
    commitBatch: () => finishBatch(true),
    rollbackBatch: () => finishBatch(false)
  }
}

export function useKalkaBindingProvider<V>(
  options: KalkaBindingProviderOptions<V>
): BindingProvider<V> {
  const editor = useEditor()
  const revision = useSceneComputed(() => editor.state.sceneVersion)
  return createKalkaBindingProvider(editor, options, revision)
}
