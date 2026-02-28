import type { EditorStore } from './stores/editor'

export function createDemoShapes(store: EditorStore) {
  // Section wrapping everything
  const sectionId = store.createShape('SECTION', 60, 60, 1060, 700)
  store.graph.updateNode(sectionId, { name: 'Design System' })

  // Desktop frame inside section
  const desktopId = store.createShape('FRAME', 20, 40, 480, 360, sectionId)
  store.graph.updateNode(desktopId, {
    name: 'Desktop',
    fills: [{ type: 'SOLID', color: { r: 1, g: 1, b: 1, a: 1 }, opacity: 1, visible: true }],
    strokes: [{ color: { r: 0.87, g: 0.87, b: 0.87, a: 1 }, weight: 1, opacity: 1, visible: true, align: 'INSIDE' }]
  })

  // Mobile frame inside section
  const mobileId = store.createShape('FRAME', 560, 40, 280, 500, sectionId)
  store.graph.updateNode(mobileId, {
    name: 'Mobile',
    fills: [{ type: 'SOLID', color: { r: 1, g: 1, b: 1, a: 1 }, opacity: 1, visible: true }],
    strokes: [{ color: { r: 0.87, g: 0.87, b: 0.87, a: 1 }, weight: 1, opacity: 1, visible: true, align: 'INSIDE' }]
  })

  // Desktop contents
  const desktopShapes = [
    { type: 'RECTANGLE' as const, name: 'Header', x: 0, y: 0, w: 480, h: 56,
      color: { r: 0.12, g: 0.14, b: 0.17, a: 1 }, radius: 0 },
    { type: 'RECTANGLE' as const, name: 'Hero card', x: 24, y: 80, w: 432, h: 140,
      color: { r: 0.23, g: 0.51, b: 0.96, a: 1 }, radius: 12 },
    { type: 'ELLIPSE' as const, name: 'Avatar', x: 40, y: 100, w: 48, h: 48,
      color: { r: 1, g: 1, b: 1, a: 0.3 } },
    { type: 'RECTANGLE' as const, name: 'Card 1', x: 24, y: 244, w: 204, h: 96,
      color: { r: 0.96, g: 0.96, b: 0.97, a: 1 }, radius: 8 },
    { type: 'RECTANGLE' as const, name: 'Card 2', x: 252, y: 244, w: 204, h: 96,
      color: { r: 0.96, g: 0.96, b: 0.97, a: 1 }, radius: 8 }
  ]

  for (const d of desktopShapes) {
    const id = store.createShape(d.type, d.x, d.y, d.w, d.h, desktopId)
    store.graph.updateNode(id, {
      name: d.name,
      cornerRadius: d.radius ?? 0,
      fills: [{ type: 'SOLID', color: d.color, opacity: 1, visible: true }]
    })
  }

  // Mobile contents
  const mobileShapes = [
    { type: 'RECTANGLE' as const, name: 'Status bar', x: 0, y: 0, w: 280, h: 44,
      color: { r: 0.12, g: 0.14, b: 0.17, a: 1 }, radius: 0 },
    { type: 'RECTANGLE' as const, name: 'Banner', x: 16, y: 60, w: 248, h: 120,
      color: { r: 0.13, g: 0.77, b: 0.42, a: 1 }, radius: 12 },
    { type: 'RECTANGLE' as const, name: 'List item 1', x: 16, y: 200, w: 248, h: 56,
      color: { r: 0.96, g: 0.96, b: 0.97, a: 1 }, radius: 8 },
    { type: 'RECTANGLE' as const, name: 'List item 2', x: 16, y: 268, w: 248, h: 56,
      color: { r: 0.96, g: 0.96, b: 0.97, a: 1 }, radius: 8 },
    { type: 'RECTANGLE' as const, name: 'FAB', x: 212, y: 432, w: 52, h: 52,
      color: { r: 0.96, g: 0.52, b: 0.13, a: 1 }, radius: 26 }
  ]

  for (const d of mobileShapes) {
    const id = store.createShape(d.type, d.x, d.y, d.w, d.h, mobileId)
    store.graph.updateNode(id, {
      name: d.name,
      cornerRadius: d.radius ?? 0,
      fills: [{ type: 'SOLID', color: d.color, opacity: 1, visible: true }]
    })
  }

  // Color swatches inside section
  const swatches = [
    { name: 'Primary', x: 20, y: 480, color: { r: 0.23, g: 0.51, b: 0.96, a: 1 } },
    { name: 'Success', x: 100, y: 480, color: { r: 0.13, g: 0.77, b: 0.42, a: 1 } },
    { name: 'Warning', x: 180, y: 480, color: { r: 0.96, g: 0.52, b: 0.13, a: 1 } },
    { name: 'Danger', x: 260, y: 480, color: { r: 0.91, g: 0.22, b: 0.22, a: 1 } },
    { name: 'Purple', x: 340, y: 480, color: { r: 0.55, g: 0.36, b: 0.96, a: 1 } }
  ]

  for (const s of swatches) {
    const id = store.createShape('ELLIPSE', s.x, s.y, 56, 56, sectionId)
    store.graph.updateNode(id, {
      name: s.name,
      fills: [{ type: 'SOLID', color: s.color, opacity: 1, visible: true }]
    })
  }

  store.select([])
}
