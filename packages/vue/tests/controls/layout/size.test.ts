import { describe, expect, test } from 'bun:test'

import { computed } from 'vue'

import { createEditor } from '@kalka/core/editor'

import { createLayoutActions } from '#vue/controls/layout/helpers'

describe('typing a frame size', () => {
  test('places its layers by their constraints, as resizing it on the canvas does', () => {
    const editor = createEditor()
    try {
      const { graph } = editor
      const frame = graph.createNode('FRAME', editor.state.currentPageId, {
        width: 395,
        height: 132
      })
      const button = graph.createNode('RECTANGLE', frame.id, {
        x: 277,
        y: 40,
        width: 92,
        height: 40,
        horizontalConstraint: 'MAX'
      })
      const rule = graph.createNode('RECTANGLE', frame.id, {
        x: 40,
        y: 100,
        width: 315,
        height: 4,
        horizontalConstraint: 'STRETCH'
      })
      const actions = createLayoutActions({ editor, node: computed(() => frame) })

      // Each keystroke previews from the size before the edit, not the last preview.
      actions.updateAxisSize('width', 30)
      actions.updateAxisSize('width', 300)
      actions.commitAxisSize('width', 300, 395)
      expect([frame.width, button.x, button.width, rule.x, rule.width]).toEqual([
        300, 182, 92, 40, 220
      ])

      editor.undoAction()
      expect([frame.width, button.x, rule.width]).toEqual([395, 277, 315])
    } finally {
      editor.dispose()
    }
  })
})
