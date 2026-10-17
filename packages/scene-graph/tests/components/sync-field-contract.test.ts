import { expect, test } from 'bun:test'

import { SceneGraph, setInstanceOverride, type SceneNode } from '@kalka/scene-graph'

import { expectDefined } from '../helpers/assert'

for (const protectedField of ['width', 'text'] as const) {
  test(`component synchronization preserves ${protectedField} without freezing other fields`, () => {
    const graph = new SceneGraph()
    const component = graph.createNode('COMPONENT', graph.getPages()[0].id)
    const source = graph.createNode('TEXT', component.id, {
      text: 'Source',
      visible: false,
      width: 80
    })
    const instance = expectDefined(graph.createInstance(component.id, graph.getPages()[0].id))
    const clone = graph.getChildren(instance.id)[0]
    graph.updateNode(clone.id, { text: 'Override', visible: true, width: 160 })
    setInstanceOverride(instance.instanceOverrides, instance.id, clone.id, protectedField, true)
    graph.syncInstances(component.id)
    expect(clone.text).toBe(protectedField === 'text' ? 'Override' : source.text)
    expect(clone.width).toBe(protectedField === 'width' ? 160 : 80)
    expect(clone.visible).toBe(false)
  })
}

test('component synchronization updates and removes opacity bindings while preserving a claimed width binding', () => {
  const graph = new SceneGraph()
  const component = graph.createNode('COMPONENT', graph.getPages()[0].id, {
    opacity: 0.5,
    boundVariables: { opacity: 'opacity-var' }
  })
  const instance = expectDefined(graph.createInstance(component.id, graph.getPages()[0].id))
  expect(instance.opacity).toBe(0.5)
  expect(instance.boundVariables.opacity).toBe('opacity-var')
  graph.updateNode(instance.id, {
    boundVariables: { ...instance.boundVariables, width: 'width-var' }
  })
  setInstanceOverride(
    instance.instanceOverrides,
    instance.id,
    instance.id,
    'boundVariables/width',
    true
  )
  graph.updateNode(component.id, { opacity: 1, boundVariables: {} })
  graph.syncInstances(component.id)
  expect(instance.boundVariables).toEqual({ width: 'width-var' })
  expect(instance.opacity).toBe(1)
})

test('a component edit reaches every field its instances do not override, as in Figma', () => {
  // Repeats a Figma desktop 126 script: move, rotate, and restyle the component's layers.
  const graph = new SceneGraph()
  const page = graph.getPages()[0].id
  const card = graph.createNode('COMPONENT', page, { width: 200, height: 100 })
  const dot = graph.createNode('RECTANGLE', card.id, {
    name: 'Dot',
    x: 170,
    y: 10,
    width: 20,
    height: 20,
    horizontalConstraint: 'MAX'
  })
  const bar = graph.createNode('RECTANGLE', card.id, {
    name: 'Bar',
    x: 20,
    y: 60,
    width: 100,
    height: 10,
    strokeWeight: 1
  })
  const plain = expectDefined(graph.createInstance(card.id, page))
  const wide = expectDefined(graph.createInstance(card.id, page, { width: 300 }))
  setInstanceOverride(wide.instanceOverrides, wide.id, wide.id, 'width', 300)
  const overridden = expectDefined(graph.createInstance(card.id, page))
  const overriddenBar = graph.getChildren(overridden.id)[1]
  graph.updateNode(overriddenBar.id, { strokeWeight: 6 })
  setInstanceOverride(overridden.instanceOverrides, overridden.id, overriddenBar.id, 'strokeWeight', 6)

  graph.updateNode(dot.id, { x: 150, y: 30, rotation: 30 })
  graph.updateNode(bar.id, { x: 40, strokeWeight: 3, strokeAlign: 'OUTSIDE', cornerSmoothing: 0.6 })
  graph.syncInstances(card.id)

  const read = (instance: SceneNode) => {
    const [copyDot, copyBar] = graph.getChildren(instance.id)
    return {
      dot: [copyDot.x, copyDot.y, copyDot.rotation],
      bar: [copyBar.x, copyBar.strokeWeight, copyBar.strokeAlign, copyBar.cornerSmoothing]
    }
  }
  expect(read(plain)).toEqual({ dot: [150, 30, 30], bar: [40, 3, 'OUTSIDE', 0.6] })
  // A wider instance places the right-pinned dot by its constraint.
  expect(read(wide).dot).toEqual([250, 30, 30])
  expect(read(overridden).bar).toEqual([40, 6, 'OUTSIDE', 0.6])
})

test('a layer in an auto layout flow takes its place from the layout, not the component', () => {
  const graph = new SceneGraph()
  const page = graph.getPages()[0].id
  const row = graph.createNode('COMPONENT', page, { layoutMode: 'HORIZONTAL', width: 100, height: 20 })
  const item = graph.createNode('RECTANGLE', row.id, { x: 0, y: 0, width: 20, height: 20 })
  const instance = expectDefined(graph.createInstance(row.id, page))
  const copy = graph.getChildren(instance.id)[0]
  graph.updateNode(copy.id, { x: 12 })
  graph.updateNode(item.id, { x: 30, cornerSmoothing: 0.6 })
  graph.syncInstances(row.id)
  expect([copy.x, copy.cornerSmoothing]).toEqual([12, 0.6])
})

test('restyled ranges reach instances, except one that overrides its text', () => {
  const graph = new SceneGraph()
  const page = graph.getPages()[0].id
  const label = graph.createNode('COMPONENT', page)
  const text = graph.createNode('TEXT', label.id, { text: 'Hello' })
  const plain = expectDefined(graph.createInstance(label.id, page))
  const instance = expectDefined(graph.createInstance(label.id, page))
  const copy = graph.getChildren(instance.id)[0]
  const runs = [{ start: 0, length: 2, style: { fontWeight: 700 } }]
  graph.updateNode(copy.id, { text: 'Hi there', styleRuns: runs })
  setInstanceOverride(instance.instanceOverrides, instance.id, copy.id, 'text', 'Hi there')
  const italic = [{ start: 0, length: 5, style: { italic: true } }]
  graph.updateNode(text.id, { styleRuns: italic })
  graph.syncInstances(label.id)
  expect(graph.getChildren(plain.id)[0].styleRuns).toEqual(italic)
  expect(copy.styleRuns).toEqual(runs)
})

/** A closed polygon through the points, as a vector network. */
function polygon(points: Array<[number, number]>): NonNullable<SceneNode['vectorNetwork']> {
  return {
    vertices: points.map(([x, y]) => ({ x, y })),
    segments: points.map((_, index) => ({
      start: index,
      end: (index + 1) % points.length,
      tangentStart: { x: 0, y: 0 },
      tangentEnd: { x: 0, y: 0 }
    })),
    regions: [{ windingRule: 'NONZERO', loops: [points.map((_, index) => index)] }]
  }
}

const corners = (network: SceneNode['vectorNetwork']) => network?.vertices.map(({ x, y }) => [x, y])

test('a path edited in a component reaches its instances, drawn at their size', () => {
  // Repeats a Figma desktop 126 script: an instance cannot override a vector's path
  // ("vector-data"), so every edit of the component's path reaches it, scaled with the layer.
  const graph = new SceneGraph()
  const page = graph.getPages()[0].id
  const card = graph.createNode('COMPONENT', page, { width: 200, height: 120 })
  const shape = graph.createNode('VECTOR', card.id, {
    x: 20,
    y: 20,
    width: 100,
    height: 80,
    vectorNetwork: polygon([
      [0, 0],
      [100, 0],
      [50, 80]
    ]),
    horizontalConstraint: 'SCALE',
    verticalConstraint: 'SCALE'
  })
  const plain = expectDefined(graph.createInstance(card.id, page))
  const doubled = expectDefined(graph.createInstance(card.id, page))
  // Resized as Figma's resize records it, as the instance's own size.
  graph.updateNode(doubled.id, { width: 400, height: 240 })
  for (const field of ['width', 'height'])
    setInstanceOverride(doubled.instanceOverrides, doubled.id, doubled.id, field, true)
  const copyIn = (instance: SceneNode) => graph.getChildren(instance.id)[0]

  graph.updateNode(shape.id, {
    width: 120,
    height: 90,
    vectorNetwork: polygon([
      [0, 0],
      [120, 0],
      [60, 90]
    ])
  })
  graph.syncInstances(card.id)
  expect(corners(copyIn(plain).vectorNetwork)).toEqual([
    [0, 0],
    [120, 0],
    [60, 90]
  ])
  expect([copyIn(doubled).width, copyIn(doubled).height]).toEqual([240, 180])
  expect(corners(copyIn(doubled).vectorNetwork)).toEqual([
    [0, 0],
    [240, 0],
    [120, 180]
  ])
})

test('a copy keeps its own outlines while its path matches, and drops a stale stroke outline', () => {
  // As in Figma files, a copy whose instance overrides its fill or stroke weight has outlines of
  // its own; only a changed path replaces them.
  const graph = new SceneGraph()
  const page = graph.getPages()[0].id
  const card = graph.createNode('COMPONENT', page, { width: 40, height: 40 })
  const outline = (byte: number) => [
    { windingRule: 'NONZERO' as const, commandsBlob: new Uint8Array([byte]) }
  ]
  const shape = graph.createNode('VECTOR', card.id, {
    width: 20,
    height: 20,
    vectorNetwork: polygon([
      [0, 0],
      [20, 0],
      [10, 20]
    ]),
    strokeGeometry: outline(1)
  })
  const instance = expectDefined(graph.createInstance(card.id, page))
  const copy = graph.getChildren(instance.id)[0]
  graph.updateNode(copy.id, {
    strokeWeight: 4,
    fillGeometry: outline(7),
    strokeGeometry: outline(8)
  })
  setInstanceOverride(instance.instanceOverrides, instance.id, copy.id, 'strokeWeight', true)

  graph.syncInstances(card.id)
  expect([...copy.fillGeometry[0].commandsBlob, ...copy.strokeGeometry[0].commandsBlob]).toEqual([
    7, 8
  ])

  graph.updateNode(shape.id, {
    vectorNetwork: polygon([
      [0, 0],
      [20, 0],
      [20, 20]
    ])
  })
  graph.syncInstances(card.id)
  expect(corners(copy.vectorNetwork)).toEqual([
    [0, 0],
    [20, 0],
    [20, 20]
  ])
  expect(copy.fillGeometry).toEqual([])
  expect(copy.strokeGeometry).toEqual([])
})

test('a component line, with no height, still reaches its instances', () => {
  const graph = new SceneGraph()
  const page = graph.getPages()[0].id
  const card = graph.createNode('COMPONENT', page, { width: 100, height: 40 })
  const line = graph.createNode('VECTOR', card.id, {
    y: 20,
    width: 60,
    height: 0,
    vectorNetwork: {
      vertices: [
        { x: 0, y: 0 },
        { x: 60, y: 0 }
      ],
      segments: [{ start: 0, end: 1, tangentStart: { x: 0, y: 0 }, tangentEnd: { x: 0, y: 0 } }],
      regions: []
    }
  })
  const instance = expectDefined(graph.createInstance(card.id, page))
  const copy = graph.getChildren(instance.id)[0]
  graph.updateNode(line.id, {
    width: 80,
    vectorNetwork: {
      vertices: [
        { x: 0, y: 0 },
        { x: 80, y: 0 }
      ],
      segments: [{ start: 0, end: 1, tangentStart: { x: 0, y: 0 }, tangentEnd: { x: 0, y: 0 } }],
      regions: []
    }
  })
  graph.syncInstances(card.id)
  expect(corners(copy.vectorNetwork)).toEqual([
    [0, 0],
    [80, 0]
  ])
})
