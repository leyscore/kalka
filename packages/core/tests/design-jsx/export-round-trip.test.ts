import { describe, expect, it, test } from 'bun:test'
import { pick } from 'es-toolkit'

import { renderJSX } from '@open-pencil/core/design-jsx'
import { sceneNodeToJSX } from '@open-pencil/design-jsx'
import { SceneGraph, type Fill, type SceneNode, type Stroke } from '@open-pencil/scene-graph'

import { expectDefined, getNodeOrThrow } from '../helpers/assert'

describe('attribute string round-trip', () => {
  it.each([
    // Unescaped, this name would inject `w={999}` into the exported frame.
    'a" w={999} x="',
    'Fish &amp; chips',
    'Back\\slash',
    'Two\nlines',
    'Tab\there',
    'Plain name'
  ])('keeps the layer name %p', async (name) => {
    const g = new SceneGraph()
    const [source] = await renderJSX(g, '<Frame w={10} h={10} />')
    getNodeOrThrow(g, source.id).name = name
    const [result] = await renderJSX(g, sceneNodeToJSX(source.id, g))
    expect(getNodeOrThrow(g, result.id)).toMatchObject({ name, width: 10 })
  })
})

describe('text content round-trip', () => {
  it.each([
    'Curly {braces} and <tags>',
    'Fish &amp; chips',
    'Line one\nLine two',
    '  padded  ',
    'Back\\slash',
    'Tab\there'
  ])('keeps the text %p', async (text) => {
    const g = new SceneGraph()
    const [source] = await renderJSX(g, '<Text color="#000">Placeholder</Text>')
    getNodeOrThrow(g, source.id).text = text
    const [result] = await renderJSX(g, sceneNodeToJSX(source.id, g))
    expect(getNodeOrThrow(g, result.id).text).toBe(text)
  })
})

const RED = { r: 1, g: 0, b: 0, a: 1 }
const BLUE = { r: 0, g: 0, b: 1, a: 1 }
/** Alphas that survive the two-digit hex of exported colors exactly. */
const SHADE = { r: 0, g: 0, b: 0, a: 0.2 }

function solidFill(color = RED, fields: Partial<Fill> = {}): Fill {
  return { type: 'SOLID', color, opacity: color.a, visible: true, ...fields }
}

function stroke(fields: Partial<Stroke> = {}): Stroke {
  return { color: BLUE, weight: 1, opacity: 1, visible: true, align: 'INSIDE', ...fields }
}

interface RoundTripCase {
  name: string
  /** Builds the exported root under `pageId` and returns the name of the node to compare. */
  build(graph: SceneGraph, pageId: string): { rootId: string; target: string }
  fields: (keyof SceneNode)[]
}

function frame(graph: SceneGraph, parentId: string, fields: Partial<SceneNode> = {}) {
  return graph.createNode('FRAME', parentId, { name: 'Root', width: 300, height: 200, ...fields })
}

function child(
  graph: SceneGraph,
  parentId: string,
  type: SceneNode['type'],
  fields: Partial<SceneNode>
) {
  return graph.createNode(type, parentId, { name: 'Target', width: 40, height: 30, ...fields })
}

/** A leaf under a plain frame, compared on `fields`. */
function leafCase(
  name: string,
  type: SceneNode['type'],
  fields: Partial<SceneNode>,
  compared = Object.keys(fields) as (keyof SceneNode)[]
): RoundTripCase {
  return {
    name,
    build(graph, pageId) {
      const root = frame(graph, pageId)
      child(graph, root.id, type, fields)
      return { rootId: root.id, target: 'Target' }
    },
    fields: compared
  }
}

const CASES: RoundTripCase[] = [
  leafCase('hidden layer', 'RECTANGLE', { visible: false }),
  leafCase('locked layer', 'RECTANGLE', { locked: true }),
  leafCase('constraints', 'RECTANGLE', {
    horizontalConstraint: 'MAX',
    verticalConstraint: 'STRETCH'
  }),
  leafCase('scale and center constraints', 'RECTANGLE', {
    horizontalConstraint: 'SCALE',
    verticalConstraint: 'CENTER'
  }),
  leafCase('size limits', 'FRAME', {
    minWidth: 20,
    maxWidth: 400,
    minHeight: 10,
    maxHeight: 300
  }),
  leafCase('position and rotation', 'RECTANGLE', { x: 12, y: 34, rotation: 15 }),
  leafCase('opacity and blend mode', 'RECTANGLE', { opacity: 0.5, blendMode: 'MULTIPLY' }),
  // Figma leaves the uniform radius at 0 when corners differ.
  leafCase('independent corners and smoothing', 'RECTANGLE', {
    cornerRadius: 0,
    independentCorners: true,
    topLeftRadius: 4,
    topRightRadius: 8,
    bottomRightRadius: 12,
    bottomLeftRadius: 16,
    cornerSmoothing: 0.6
  }),
  leafCase('single solid fill', 'RECTANGLE', { fills: [solidFill()] }),
  leafCase('stacked, hidden, and blended fills', 'RECTANGLE', {
    fills: [
      solidFill(RED, { visible: false }),
      solidFill(BLUE, { opacity: 0.5, blendMode: 'SCREEN' })
    ]
  }),
  leafCase('gradient fill with transform', 'RECTANGLE', {
    fills: [
      {
        type: 'GRADIENT_LINEAR',
        color: { r: 0, g: 0, b: 0, a: 0 },
        opacity: 1,
        visible: true,
        gradientStops: [
          { color: RED, position: 0 },
          { color: BLUE, position: 1 }
        ],
        gradientTransform: { m00: 0, m01: 1, m02: 0, m10: -1, m11: 0, m12: 1 }
      }
    ]
  }),
  leafCase('gradient fading to transparent', 'RECTANGLE', {
    fills: [
      {
        type: 'GRADIENT_RADIAL',
        color: { r: 0, g: 0, b: 0, a: 0 },
        opacity: 1,
        visible: true,
        gradientStops: [
          { color: SHADE, position: 0 },
          { color: { r: 0, g: 0, b: 0, a: 0 }, position: 1 }
        ],
        gradientTransform: { m00: 1, m01: 0, m02: 0, m10: 0, m11: 1, m12: 0 }
      }
    ]
  }),
  leafCase('image fill', 'RECTANGLE', {
    fills: [
      {
        type: 'IMAGE',
        color: { r: 0, g: 0, b: 0, a: 1 },
        opacity: 1,
        visible: true,
        imageHash: 'abc123',
        imageScaleMode: 'FIT'
      }
    ]
  }),
  leafCase('single stroke with every option', 'RECTANGLE', {
    strokes: [
      stroke({ weight: 3, align: 'OUTSIDE', dashPattern: [4, 2], cap: 'ROUND', join: 'BEVEL' })
    ]
  }),
  leafCase('node-level stroke cap and join under a stroke without its own', 'RECTANGLE', {
    strokes: [stroke({ weight: 2 })],
    strokeCap: 'ROUND',
    strokeJoin: 'BEVEL'
  }),
  leafCase('stroke cap that differs from the node cap', 'RECTANGLE', {
    strokes: [stroke({ cap: 'SQUARE' })],
    strokeCap: 'ROUND'
  }),
  leafCase('node-level dash pattern under a stroke without its own', 'RECTANGLE', {
    strokes: [stroke()],
    dashPattern: [6, 3]
  }),
  leafCase('stroke opacity that differs from its colour alpha', 'RECTANGLE', {
    strokes: [stroke({ opacity: 0.5 })]
  }),
  leafCase('fill opacity that differs from its colour alpha', 'RECTANGLE', {
    fills: [solidFill(RED, { opacity: 0.5 })]
  }),
  leafCase('size limits without a fixed width', 'FRAME', {
    layoutMode: 'VERTICAL',
    primaryAxisSizing: 'HUG',
    counterAxisSizing: 'HUG',
    minWidth: 40,
    maxWidth: 400
  }),
  leafCase('several strokes, one hidden', 'RECTANGLE', {
    strokes: [stroke({ weight: 2 }), stroke({ color: RED, align: 'CENTER', visible: false })]
  }),
  leafCase('per-side stroke weights', 'RECTANGLE', {
    strokes: [stroke()],
    independentStrokeWeights: true,
    borderTopWeight: 0,
    borderRightWeight: 1,
    borderBottomWeight: 2,
    borderLeftWeight: 0
  }),
  leafCase('drop shadow and layer blur shorthands', 'RECTANGLE', {
    effects: [
      {
        type: 'DROP_SHADOW',
        color: SHADE,
        offset: { x: 0, y: 4 },
        radius: 8,
        spread: 0,
        visible: true
      },
      {
        type: 'LAYER_BLUR',
        color: { r: 0, g: 0, b: 0, a: 0 },
        offset: { x: 0, y: 0 },
        radius: 4,
        spread: 0,
        visible: true
      }
    ]
  }),
  leafCase('inner shadow, spread, hidden shadow, background blur', 'RECTANGLE', {
    effects: [
      {
        type: 'INNER_SHADOW',
        color: SHADE,
        offset: { x: 1, y: 2 },
        radius: 3,
        spread: 0,
        visible: true
      },
      {
        type: 'DROP_SHADOW',
        color: SHADE,
        offset: { x: 0, y: 8 },
        radius: 16,
        spread: 4,
        visible: false
      },
      {
        type: 'BACKGROUND_BLUR',
        color: { r: 0, g: 0, b: 0, a: 0 },
        offset: { x: 0, y: 0 },
        radius: 12,
        spread: 0,
        visible: true
      }
    ]
  }),
  leafCase('mask', 'RECTANGLE', { isMask: true, maskType: 'LUMINANCE' }),
  leafCase('clipping', 'FRAME', { clipsContent: true }),
  leafCase('star geometry', 'STAR', { pointCount: 7, starInnerRadius: 0.5 }),
  leafCase('text style', 'TEXT', {
    text: 'Hello',
    fontSize: 20,
    fontWeight: 700,
    italic: true,
    textAlignHorizontal: 'CENTER',
    textAlignVertical: 'BOTTOM',
    textAutoResize: 'NONE',
    letterSpacing: 1,
    lineHeight: 28,
    textCase: 'UPPER',
    textDecoration: 'UNDERLINE'
  }),
  leafCase('text that wraps at a fixed width', 'TEXT', {
    text: 'Wrapped',
    textAutoResize: 'HEIGHT'
  }),
  leafCase('text that hugs its content', 'TEXT', {
    text: 'Hug',
    textAutoResize: 'WIDTH_AND_HEIGHT'
  }),
  leafCase('truncated text', 'TEXT', {
    text: 'Clipped',
    textAutoResize: 'TRUNCATE',
    textTruncation: 'ENDING'
  }),
  {
    name: 'absolute child of an auto-layout frame',
    build(graph, pageId) {
      const root = frame(graph, pageId, { layoutMode: 'VERTICAL', itemSpacing: 8 })
      child(graph, root.id, 'RECTANGLE', { name: 'Flow' })
      child(graph, root.id, 'RECTANGLE', {
        layoutPositioning: 'ABSOLUTE',
        x: 10,
        y: 20,
        horizontalConstraint: 'MAX'
      })
      return { rootId: root.id, target: 'Target' }
    },
    fields: ['layoutPositioning', 'x', 'y', 'horizontalConstraint']
  },
  {
    name: 'auto layout',
    build(graph, pageId) {
      const root = frame(graph, pageId, {
        layoutMode: 'HORIZONTAL',
        itemSpacing: 12,
        paddingTop: 4,
        paddingRight: 8,
        paddingBottom: 4,
        paddingLeft: 8,
        primaryAxisAlign: 'SPACE_BETWEEN',
        counterAxisAlign: 'CENTER',
        primaryAxisSizing: 'FIXED',
        counterAxisSizing: 'FIXED'
      })
      child(graph, root.id, 'RECTANGLE', { name: 'A' })
      return { rootId: root.id, target: 'Root' }
    },
    fields: [
      'layoutMode',
      'itemSpacing',
      'paddingTop',
      'paddingRight',
      'paddingBottom',
      'paddingLeft',
      'primaryAxisAlign',
      'counterAxisAlign',
      'width',
      'height'
    ]
  },
  {
    name: 'variable bindings',
    build(graph, pageId) {
      const collection = graph.createCollection('Tokens')
      const brand = graph.createVariable('Brand', 'COLOR', collection.id, RED)
      const space = graph.createVariable('Space', 'FLOAT', collection.id, 16)
      const root = frame(graph, pageId, {
        layoutMode: 'VERTICAL',
        itemSpacing: 16,
        fills: [solidFill()]
      })
      graph.bindVariable(root.id, 'fills/0/color', brand.id)
      graph.bindVariable(root.id, 'itemSpacing', space.id)
      return { rootId: root.id, target: 'Root' }
    },
    fields: ['boundVariables']
  }
]

function findByName(graph: SceneGraph, rootId: string, name: string): SceneNode {
  const root = expectDefined(graph.getNode(rootId), 'rendered root')
  if (root.name === name) return root
  for (const childId of root.childIds) {
    const found = graph.getNode(childId)?.name === name ? graph.getNode(childId) : undefined
    if (found) return found
  }
  throw new Error(`No node named ${name} under ${root.name}`)
}

test('size limits are limits, not a width', async () => {
  const graph = new SceneGraph()
  const [defaultWidth] = await renderJSX(graph, '<Frame h={10} />')
  const [limited] = await renderJSX(graph, '<Frame h={10} maxW={400} />')
  const width = (id: string | undefined) => graph.getNode(expectDefined(id, 'frame'))?.width
  expect(graph.getNode(expectDefined(limited, 'frame').id)?.maxWidth).toBe(400)
  expect(width(limited?.id)).toBe(width(defaultWidth?.id))
})

describe('design JSX export round trip', () => {
  test.each(CASES.map((testCase) => [testCase.name, testCase] as const))(
    '%s',
    async (_, testCase) => {
      const graph = new SceneGraph()
      const source = expectDefined(graph.getPages()[0], 'source page')
      const target = graph.addPage('Rendered')
      const { rootId, target: targetName } = testCase.build(graph, source.id)

      const jsx = sceneNodeToJSX(rootId, graph)
      const [rendered] = await renderJSX(graph, jsx, { parentId: target.id })
      const renderedRoot = expectDefined(rendered, 'render result').id

      const original = findByName(graph, rootId, targetName)
      const copy = findByName(graph, renderedRoot, targetName)
      expect(pick(copy, testCase.fields)).toEqual(pick(original, testCase.fields))
      // Everything the export wrote comes back, so exporting the copy changes nothing.
      expect(sceneNodeToJSX(renderedRoot, graph)).toBe(jsx)
    }
  )
})
