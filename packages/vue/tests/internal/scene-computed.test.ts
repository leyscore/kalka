import { describe, expect, test } from 'bun:test'

import { createApp, shallowReactive } from 'vue'

import { createDefaultEditorState, createEditor } from '@kalka/core/editor'
import { SceneGraph } from '@kalka/scene-graph'

import { EDITOR_KEY } from '#vue/editor/context'
import { useStableSceneComputed } from '#vue/internal/scene-computed/use'

describe('stable scene state', () => {
  test('keeps its value while the scene changes elsewhere, and follows a real change', () => {
    const graph = new SceneGraph()
    const page = graph.getPages()[0]
    const state = shallowReactive(createDefaultEditorState(page.id))
    const editor = createEditor({ graph, state })
    const layer = graph.createNode('RECTANGLE', page.id, { name: 'Card' })
    const other = graph.createNode('RECTANGLE', page.id, { name: 'Other' })
    const app = createApp({ render: () => null })
    app.provide(EDITOR_KEY, editor)
    try {
      const names = app.runWithContext(() =>
        useStableSceneComputed(() => [graph.getNode(layer.id)?.name])
      )
      const first = names.value
      editor.updateNode(other.id, { name: 'Renamed' })
      state.sceneVersion++
      expect(names.value).toBe(first)

      editor.updateNode(layer.id, { name: 'Hero' })
      state.sceneVersion++
      expect(names.value).toEqual(['Hero'])
    } finally {
      editor.dispose()
    }
  })
})
