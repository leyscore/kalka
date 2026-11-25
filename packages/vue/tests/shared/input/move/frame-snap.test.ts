import { expect, test } from 'bun:test'

import { createMoveHarness } from './harness'

test('a layer dragged near the edge of its frame snaps onto it, as in Figma', () => {
  const { editor, page, node, drag } = createMoveHarness()
  const frame = node('FRAME', page, { width: 400, height: 300 })
  const box = node('RECTANGLE', frame.id, { x: 100, y: 100, width: 300, height: 40 })
  // The box's right edge lands 3 pixels short of the frame's.
  drag([box.id], [200, 120], [197, 120])
  expect(editor.graph.getNode(box.id)?.x).toBe(100)
  drag([box.id], [200, 120], [203, 120])
  expect(editor.graph.getNode(box.id)?.x).toBe(100)
  // Its left edge 3 pixels from the frame's catches on it too.
  drag([box.id], [200, 120], [103, 120])
  expect(editor.graph.getNode(box.id)?.x).toBe(0)
})
