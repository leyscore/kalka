import { createShaderLayer, SceneGraph, type Fill } from '@open-pencil/scene-graph'
import { computeImageHash } from '@open-pencil/scene-graph/images'

const PNG = Uint8Array.from([
  0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d, 0x49, 0x48, 0x44, 0x52
])

const solid = (r: number, g: number, b: number, opacity = 1): Fill => ({
  type: 'SOLID',
  color: { r, g, b, a: 1 },
  opacity,
  visible: true
})

/** A document touching every part of the format: what CSS draws and what it cannot. */
export function sampleDocument(): SceneGraph {
  const graph = new SceneGraph()
  const home = graph.getPages()[0]
  graph.updateNode(home.id, { name: 'Home' })
  const second = graph.addPage('Pricing & plans')
  const internal = graph.addPage('Internal Only Canvas')
  internal.internalOnly = true

  const colors = graph.createCollection('Colors')
  const light = colors.defaultModeId
  graph.renameMode(colors.id, light, 'Light')
  const dark = graph.createMode(colors.id, 'Dark') ?? ''
  const brand = graph.createVariable('brand/primary', 'COLOR', colors.id, {
    r: 0.2,
    g: 0.4,
    b: 1,
    a: 1
  })
  brand.valuesByMode[dark] = { r: 0.5, g: 0.7, b: 1, a: 1 }
  const accent = graph.createVariable('brand/accent', 'COLOR', colors.id)
  accent.valuesByMode[light] = { aliasId: brand.id }
  accent.valuesByMode[dark] = { aliasId: brand.id }
  const spacing = graph.createCollection('Spacing')
  const gap = graph.createVariable('space/md', 'FLOAT', spacing.id, 12)
  gap.description = 'Default gap'
  gap.scopes = ['GAP']

  const imageHash = computeImageHash(PNG)
  graph.images.set(imageHash, PNG)

  const card = graph.createNode('FRAME', home.id, {
    name: 'Card',
    x: 120,
    y: -40,
    width: 360,
    height: 240,
    layoutMode: 'VERTICAL',
    primaryAxisSizing: 'HUG',
    itemSpacing: 12,
    paddingTop: 24,
    paddingRight: 16,
    paddingBottom: 24,
    paddingLeft: 16,
    cornerRadius: 16,
    clipsContent: true,
    fills: [solid(1, 1, 1)],
    strokes: [{ ...solid(0, 0, 0, 0.1), weight: 1, align: 'INSIDE' }],
    effects: [
      {
        type: 'DROP_SHADOW',
        color: { r: 0, g: 0, b: 0, a: 0.25 },
        offset: { x: 0, y: 4 },
        radius: 12,
        spread: 0,
        visible: true
      }
    ]
  })
  graph.bindVariable(card.id, 'itemSpacing', gap.id)
  graph.createNode('TEXT', card.id, {
    name: 'Title',
    text: 'Hello  world\nsecond line',
    fontSize: 24,
    fontWeight: 600,
    lineHeight: 32,
    letterSpacing: -0.5,
    textAutoResize: 'WIDTH_AND_HEIGHT',
    textAlignHorizontal: 'CENTER',
    styleRuns: [{ start: 7, length: 5, style: { fontWeight: 800, italic: true } }]
  })
  graph.createNode('RECTANGLE', card.id, {
    name: 'Fill child',
    height: 40,
    layoutGrow: 1,
    layoutAlignSelf: 'STRETCH',
    fills: [
      {
        type: 'GRADIENT_LINEAR',
        color: { r: 0, g: 0, b: 0, a: 1 },
        opacity: 1,
        visible: true,
        gradientStops: [
          { color: { r: 1, g: 0, b: 0, a: 1 }, position: 0 },
          { color: { r: 0, g: 0, b: 1, a: 1 }, position: 1 }
        ],
        gradientTransform: { m00: 1, m01: 0, m02: 0, m10: 0, m11: 1, m12: 0 }
      },
      { ...solid(0, 1, 0), visible: false }
    ]
  })
  graph.createNode('RECTANGLE', card.id, {
    name: 'Photo',
    width: 120,
    height: 80,
    fills: [{ type: 'IMAGE', imageHash, imageScaleMode: 'FIT', color: { r: 0, g: 0, b: 0, a: 0 }, opacity: 1, visible: true }]
  })
  graph.createNode('ELLIPSE', card.id, {
    name: 'Hidden dot',
    width: 8,
    height: 8,
    visible: false,
    locked: true,
    layoutPositioning: 'ABSOLUTE',
    x: 4,
    y: 4
  })

  const board = graph.createNode('FRAME', home.id, {
    name: 'Free board',
    x: 600,
    y: 0,
    width: 400,
    height: 300,
    rotation: 0,
    fills: [solid(0.95, 0.95, 0.95)]
  })
  graph.createNode('RECTANGLE', board.id, {
    name: 'Pinned',
    x: 300,
    y: 200,
    width: 80,
    height: 60,
    rotation: 15,
    opacity: 0.5,
    blendMode: 'MULTIPLY',
    horizontalConstraint: 'MAX',
    verticalConstraint: 'STRETCH',
    independentCorners: true,
    topLeftRadius: 4,
    bottomRightRadius: 12,
    fills: [solid(0.2, 0.6, 0.3)]
  })
  graph.createNode('VECTOR', board.id, {
    name: 'Arrow',
    x: 10,
    y: 10,
    width: 40,
    height: 20,
    strokes: [{ ...solid(0, 0, 0), weight: 2, align: 'CENTER' }],
    vectorNetwork: {
      vertices: [
        { x: 0, y: 10 },
        { x: 40, y: 10 }
      ],
      segments: [{ start: 0, end: 1, tangentStart: { x: 0, y: 0 }, tangentEnd: { x: 0, y: 0 } }],
      regions: []
    }
  })
  graph.createNode('FRAME', board.id, {
    name: 'Shader',
    x: 20,
    y: 120,
    width: 160,
    height: 90,
    shader: createShaderLayer()
  })
  const nav = graph.createNode('FRAME', board.id, {
    name: 'Nav',
    x: 200,
    y: 120,
    width: 160,
    height: 40,
    htmlTag: 'nav',
    htmlClasses: ['site-nav', 'md:px-4']
  })
  graph.createNode('TEXT', nav.id, { name: 'Headline', text: 'Studio', htmlTag: 'h1' })

  const component = graph.createNode('COMPONENT', second.id, {
    name: 'Button',
    x: 0,
    y: 0,
    width: 120,
    height: 40,
    layoutMode: 'HORIZONTAL',
    primaryAxisAlign: 'CENTER',
    counterAxisAlign: 'CENTER',
    fills: [solid(0.2, 0.4, 1)]
  })
  graph.bindVariable(component.id, 'fills/0/color', brand.id)
  const label = graph.createNode('TEXT', component.id, { name: 'Label', text: 'Buy' })
  const instance = graph.createNode('INSTANCE', second.id, {
    name: 'Button',
    x: 200,
    y: 0,
    width: 120,
    height: 40,
    componentId: component.id,
    layoutMode: 'HORIZONTAL',
    primaryAxisAlign: 'CENTER',
    counterAxisAlign: 'CENTER',
    fills: [solid(0.2, 0.4, 1)],
    variableModes: { [colors.id]: dark }
  })
  graph.createNode('TEXT', instance.id, { name: 'Label', text: 'Buy now', componentId: label.id })
  graph.createNode('RECTANGLE', internal.id, { name: 'Internal', internalOnly: true })
  graph.setActiveMode(colors.id, dark)
  return graph
}

