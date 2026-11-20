import { describe, expect, test } from 'bun:test'

import { createApp, effectScope, shallowReactive, watch } from 'vue'

import { createDefaultEditorState, createEditor } from '@kalka/core/editor'
import { SceneGraph } from '@kalka/scene-graph'

import { createTypographyState } from '#vue/controls/typography/actions'
import { EDITOR_KEY } from '#vue/editor/context'

describe('typography panel state', () => {
  test('typing into the selected text layer does not change what the panel reads', () => {
    const graph = new SceneGraph()
    const page = graph.getPages()[0]
    const state = shallowReactive(createDefaultEditorState(page.id))
    const editor = createEditor({ graph, state })
    const text = graph.createNode('TEXT', page.id, { text: 'Hello', fontFamily: 'Inter' })
    editor.select([text.id])
    const app = createApp({ render: () => null })
    app.provide(EDITOR_KEY, editor)
    const scope = effectScope()
    try {
      const typography = app.runWithContext(() => scope.run(() => createTypographyState(editor)))
      if (!typography) throw new Error('No typography state')
      let nodeChanges = 0
      let familyReads = 0
      scope.run(() => {
        watch(typography.node, () => nodeChanges++, { flush: 'sync' })
        watch(
          () => typography.node.value?.fontFamily,
          () => familyReads++,
          { flush: 'sync' }
        )
      })

      for (const typed of ['Hello!', 'Hello!!', 'Hello!!!']) {
        editor.updateNode(text.id, { text: typed })
        state.sceneVersion++
      }
      expect(nodeChanges).toBe(0)
      expect(familyReads).toBe(0)

      editor.updateNode(text.id, { fontFamily: 'Roboto' })
      state.sceneVersion++
      expect(typography.node.value?.fontFamily).toBe('Roboto')
      expect(familyReads).toBe(1)
    } finally {
      scope.stop()
      editor.dispose()
    }
  })

  test('the missing fonts keep their list while typing, so a warning that shows them holds', () => {
    const graph = new SceneGraph()
    const page = graph.getPages()[0]
    const state = shallowReactive(createDefaultEditorState(page.id))
    const editor = createEditor({ graph, state })
    const family = 'A Font Nobody Has'
    const styleRuns = [{ start: 0, length: 5, style: { fontFamily: family } }]
    const text = graph.createNode('TEXT', page.id, { text: 'Hello', fontFamily: family, styleRuns })
    editor.select([text.id])
    const app = createApp({ render: () => null })
    app.provide(EDITOR_KEY, editor)
    const scope = effectScope()
    try {
      const typography = app.runWithContext(() => scope.run(() => createTypographyState(editor)))
      if (!typography) throw new Error('No typography state')
      const missing = typography.missingFonts.value
      expect(missing).toEqual([family])

      // Typing replaces the style runs with equal ones on every keystroke.
      for (const typed of ['Hello!', 'Hello!!']) {
        const runs = [{ start: 0, length: typed.length, style: { fontFamily: family } }]
        editor.updateNode(text.id, { text: typed, styleRuns: runs })
        expect(typography.missingFonts.value).toBe(missing)
      }

      editor.updateNode(text.id, { fontFamily: 'Another Missing Font', styleRuns: [] })
      expect(typography.missingFonts.value).toEqual(['Another Missing Font'])
    } finally {
      scope.stop()
      editor.dispose()
    }
  })
})
