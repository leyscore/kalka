import { expect, test } from 'bun:test'

import { SceneGraph } from '@kalka/scene-graph'

import { generatedCodeFor } from '@/app/code/generated'

test('Tailwind JSX draws an icon inside a button as SVG, not as a filled box', () => {
  const graph = new SceneGraph()
  const pageId = graph.getPages()[0]?.id ?? graph.rootId
  const button = graph.createNode('FRAME', pageId, {
    name: 'Button',
    width: 120,
    height: 40,
    layoutMode: 'HORIZONTAL'
  })
  graph.createNode('VECTOR', button.id, {
    name: 'path',
    width: 20,
    height: 20,
    fills: [{ type: 'SOLID', color: { r: 0.15, g: 0.39, b: 0.92, a: 1 }, opacity: 1, visible: true }],
    vectorNetwork: {
      vertices: [
        { x: 0, y: 10 },
        { x: 20, y: 10 },
        { x: 10, y: 0 }
      ],
      segments: [
        { start: 0, end: 1, tangentStart: { x: 0, y: 0 }, tangentEnd: { x: 0, y: 0 } },
        { start: 1, end: 2, tangentStart: { x: 0, y: 0 }, tangentEnd: { x: 0, y: 0 } },
        { start: 2, end: 0, tangentStart: { x: 0, y: 0 }, tangentEnd: { x: 0, y: 0 } }
      ],
      regions: [{ windingRule: 'NONZERO', loops: [[0, 1, 2]] }]
    }
  })

  const { code } = generatedCodeFor('tailwind-jsx', graph, [button.id])
  expect(code).toContain('<svg')
  expect(code).toContain('<path')
  expect(code).not.toMatch(/<div[^>]*data-name="path"/)
})
