import { describe, expect, test } from 'bun:test'

import { createEditor } from '@kalka/core/editor'
import { hasInstanceOverride, type SceneNode } from '@kalka/scene-graph'
import { createResizeSnapshot } from '@kalka/scene-graph/resize'

import { applyResize, commitResizePreview } from '#vue/shared/input/resize'
import type { DragResize } from '#vue/shared/input/types'

function drag(node: SceneNode): DragResize {
  return {
    type: 'resize',
    handle: 'se',
    startX: node.x + node.width,
    startY: node.y + node.height,
    origRect: { x: node.x, y: node.y, width: node.width, height: node.height },
    nodeId: node.id,
    origVectorNetwork: null,
    origFillGeometry: [],
    origStrokeGeometry: [],
    origDerivedTextGlyphs: null,
    origStrokes: [],
    origTextPathData: null,
    origTextPathBox: null,
    origStyle: {},
    origChildren: null
  }
}

describe('resizing an instance', () => {
  test('places its layers by their constraints without making their sizes overrides', () => {
    // Repeats a Figma desktop 126 script: an instance resized to twice its component's size
    // claims only its own size, so a later component edit still sizes its layers.
    const editor = createEditor()
    try {
      const { graph } = editor
      const page = editor.state.currentPageId
      const card = graph.createNode('COMPONENT', page, {
        width: 140,
        height: 140,
        strokes: [
          {
            type: 'SOLID',
            color: { r: 0, g: 0, b: 0, a: 1 },
            opacity: 1,
            visible: true,
            weight: 1,
            align: 'INSIDE'
          }
        ]
      })
      const box = graph.createNode('RECTANGLE', card.id, {
        x: 20,
        y: 20,
        width: 100,
        height: 100,
        horizontalConstraint: 'SCALE',
        verticalConstraint: 'SCALE'
      })
      const instance = graph.createInstance(card.id, page, { x: 300 })
      if (!instance) throw new Error('Expected an instance')
      const [copy] = graph.getChildren(instance.id)
      const resize: DragResize = {
        ...drag(instance),
        origChildren: new Map([[copy.id, createResizeSnapshot(copy)]])
      }
      applyResize(resize, instance.x + 280, instance.y + 280, false, editor, true)
      commitResizePreview(resize, editor)
      expect([instance.width, instance.height, copy.width, copy.height]).toEqual([
        280, 280, 200, 200
      ])
      expect(hasInstanceOverride(graph, instance.id, 'width')).toBe(true)
      expect(hasInstanceOverride(graph, copy.id, 'width')).toBe(false)
      // A corner drag leaves the instance in place, and resizes no strokes of its own.
      expect(
        (['x', 'y', 'strokes'] as const).map((field) =>
          hasInstanceOverride(graph, instance.id, field)
        )
      ).toEqual([false, false, false])

      graph.updateNode(box.id, { width: 115 })
      graph.syncInstances(card.id)
      expect(copy.width).toBe(230)
    } finally {
      editor.dispose()
    }
  })
})
