import { describe, expect, test } from 'bun:test'

import { exportHTMLBundle, sceneNodeToDesignDocument } from '#dom-css/export/index'

import { SceneGraph } from '@kalka/scene-graph'

const INK = [
  { type: 'SOLID' as const, color: { r: 0, g: 0, b: 0, a: 1 }, opacity: 1, visible: true }
]

/** A frame without auto layout holding squares at `positions`, each 32 pixels wide. */
async function squares(positions: ReadonlyArray<readonly [number, number]>) {
  const graph = new SceneGraph()
  const frame = graph.createNode('FRAME', graph.getPages()[0].id, {
    name: 'Icons',
    width: 200,
    height: 32
  })
  for (const [x, y] of positions)
    graph.createNode('RECTANGLE', frame.id, { x, y, width: 32, height: 32, fills: INK })
  const document = sceneNodeToDesignDocument(graph, frame.id, { includeSourceIds: false })
  const html = String((await exportHTMLBundle(document, { shareStyles: false })).files[0]?.content)
  return { graph, frame, html }
}

describe('children placed in a row', () => {
  test('export as the flex row they sit in, the frame keeping its free layout', async () => {
    const { graph, frame, html } = await squares([
      [0, 0],
      [40, 0],
      [80, 0]
    ])
    expect(html).toContain('display: flex; gap: 8px')
    expect(html).not.toContain('left:')
    expect(html).not.toContain('position: absolute')
    expect(graph.getNode(frame.id)?.layoutMode).toBe('NONE')
  })

  test('stay where they are when the gaps differ, or a child sits off the line', async () => {
    const uneven = await squares([
      [0, 0],
      [40, 0],
      [90, 0]
    ])
    expect(uneven.html).toContain('position: absolute')
    const offLine = await squares([
      [0, 0],
      [40, 4]
    ])
    expect(offLine.html).toContain('position: absolute')
  })

  test('stay where they are when the row runs past the frame', async () => {
    const { html } = await squares([
      [0, 0],
      [100, 0],
      [200, 0]
    ])
    expect(html).toContain('position: absolute')
  })
})
