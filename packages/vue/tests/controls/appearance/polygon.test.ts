import { describe, expect, test } from 'bun:test'

import { compact } from 'es-toolkit/array'
import { computed } from 'vue'

import { createEditor } from '@kalka/core/editor'
import type { SceneNode } from '@kalka/scene-graph'

import {
  clampPointCount,
  createPolygonActions,
  createPolygonState
} from '#vue/controls/appearance/polygon'
import { MIXED, type MixedValue } from '#vue/controls/node-props/use'

function setup(...types: Array<'POLYGON' | 'STAR' | 'RECTANGLE'>) {
  const editor = createEditor()
  const ids = types.map(
    (type) =>
      editor.graph.createNode(type, editor.state.currentPageId, {
        width: 100,
        height: 100,
        pointCount: type === 'POLYGON' ? 3 : 5
      }).id
  )
  const nodes = computed(() => compact(ids.map((id) => editor.graph.getNode(id))))
  const merged = <K extends keyof SceneNode>(key: K): MixedValue<SceneNode[K]> => {
    const values = nodes.value.map((node) => node[key])
    return values.every((value) => value === values[0]) ? values[0] : MIXED
  }
  return {
    editor,
    ids,
    state: createPolygonState({ nodes, merged }),
    actions: createPolygonActions(editor, nodes)
  }
}

describe('polygon and star count', () => {
  test('shows Count for polygons and stars, and Ratio for stars only', () => {
    expect(setup('POLYGON').state.hasPointCount.value).toBe(true)
    expect(setup('POLYGON').state.hasStarRatio.value).toBe(false)
    expect(setup('STAR').state.hasStarRatio.value).toBe(true)
    expect(setup('STAR', 'RECTANGLE').state.hasPointCount.value).toBe(false)
    expect(setup('POLYGON', 'STAR').state.pointCountValue.value).toBe(MIXED)
  })

  test('a scrub previews the count and its release is one undo step', () => {
    const { editor, ids, actions } = setup('POLYGON')
    const [id] = ids
    editor.updateNode(id, { pointCount: 3 })
    actions.updatePointCount(5)
    actions.updatePointCount(6)
    expect(editor.graph.getNode(id)?.pointCount).toBe(6)
    actions.commitPointCount(6)
    editor.undo.undo()
    expect(editor.graph.getNode(id)?.pointCount).toBe(3)
    editor.undo.redo()
    expect(editor.graph.getNode(id)?.pointCount).toBe(6)
  })

  test('drops an imported outline so the shape is drawn from the new count', () => {
    const { editor, ids, actions } = setup('STAR')
    const [id] = ids
    const outline = [{ windingRule: 'NONZERO' as const, commandsBlob: new Uint8Array([1]) }]
    editor.graph.updateNode(id, { fillGeometry: outline })
    actions.commitStarRatio(60)
    expect(editor.graph.getNode(id)).toMatchObject({ starInnerRadius: 0.6, fillGeometry: [] })
    editor.undo.undo()
    expect(editor.graph.getNode(id)?.fillGeometry).toHaveLength(1)
  })

  test('keeps Figma’s bounds of 3 to 60 points', () => {
    expect(clampPointCount(1)).toBe(3)
    expect(clampPointCount(7.6)).toBe(8)
    expect(clampPointCount(500)).toBe(60)
  })
})
