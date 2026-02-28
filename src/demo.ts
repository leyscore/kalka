import type { EditorStore } from './stores/editor'

export function createDemoShapes(store: EditorStore) {
  store.createShape('FRAME', 100, 80, 800, 500)
  store.graph.updateNode(store.graph.getChildren(store.state.currentPageId)[0].id, {
    name: 'Desktop',
    fills: [{ type: 'SOLID', color: { r: 1, g: 1, b: 1, a: 1 }, opacity: 1, visible: true }],
    strokes: [
      {
        color: { r: 0.87, g: 0.87, b: 0.87, a: 1 },
        weight: 1,
        opacity: 1,
        visible: true,
        align: 'INSIDE'
      }
    ]
  })

  const shapes = [
    {
      type: 'RECTANGLE' as const,
      name: 'Blue card',
      x: 150, y: 140, w: 240, h: 160,
      color: { r: 0.23, g: 0.51, b: 0.96, a: 1 },
      radius: 12
    },
    {
      type: 'ELLIPSE' as const,
      name: 'Green circle',
      x: 440, y: 160, w: 120, h: 120,
      color: { r: 0.13, g: 0.77, b: 0.42, a: 1 }
    },
    {
      type: 'RECTANGLE' as const,
      name: 'Orange rect',
      x: 620, y: 140, w: 200, h: 100,
      color: { r: 0.96, g: 0.52, b: 0.13, a: 1 },
      radius: 8
    },
    {
      type: 'RECTANGLE' as const,
      name: 'Purple pill',
      x: 150, y: 360, w: 300, h: 56,
      color: { r: 0.55, g: 0.36, b: 0.96, a: 1 },
      radius: 28
    }
  ]

  for (const d of shapes) {
    const id = store.createShape(d.type, d.x, d.y, d.w, d.h)
    store.graph.updateNode(id, {
      name: d.name,
      cornerRadius: d.radius ?? 0,
      fills: [{ type: 'SOLID', color: d.color, opacity: 1, visible: true }]
    })
  }
}
