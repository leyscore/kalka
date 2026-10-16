import { describe, expect, it } from 'bun:test'

import { SceneGraph, type SceneNode } from '@kalka/scene-graph'
import { readLayerStyle, writeLayerStyle } from '@kalka/scene-graph/css-model'

type NodeType = 'FRAME' | 'RECTANGLE' | 'TEXT'

interface Sample {
  name: string
  type?: NodeType
  fields: Partial<SceneNode>
  /** The parent the layer sits in, which decides how its CSS reads. */
  parent?: Partial<SceneNode>
}

const red = { r: 1, g: 0, b: 0, a: 1 }
const solid = (color = red) => ({ type: 'SOLID' as const, color, opacity: 1, visible: true })
const row = { layoutMode: 'HORIZONTAL' as const }

const SAMPLES: Sample[] = [
  { name: 'fixed size', fields: { width: 120, height: 40 } },
  {
    name: 'hug on both axes',
    fields: { ...row, primaryAxisSizing: 'HUG', counterAxisSizing: 'HUG' }
  },
  {
    name: 'hug along a column, fixed across it',
    fields: {
      layoutMode: 'VERTICAL',
      width: 200,
      primaryAxisSizing: 'HUG',
      counterAxisSizing: 'FIXED'
    }
  },
  {
    name: 'fill in a row',
    fields: { layoutGrow: 1, layoutAlignSelf: 'STRETCH', minWidth: null },
    parent: row
  },
  { name: 'free position', fields: { x: 10, y: 20, layoutPositioning: 'AUTO' }, parent: {} },
  {
    name: 'absolute in auto layout',
    fields: { x: 4, y: 8, layoutPositioning: 'ABSOLUTE' },
    parent: row
  },
  {
    name: 'size constraints',
    fields: { minWidth: 50, maxWidth: 300, minHeight: 10, maxHeight: 90 }
  },
  { name: 'solid fill', fields: { fills: [solid()] } },
  {
    name: 'border in the layout',
    fields: {
      strokes: [{ ...solid(), weight: 2, align: 'INSIDE' }],
      strokeWeight: 2,
      strokeAlign: 'INSIDE',
      strokesIncludedInLayout: true
    }
  },
  {
    name: 'dashed outline',
    fields: {
      strokes: [{ ...solid(), weight: 1, align: 'INSIDE' }],
      strokeWeight: 1,
      strokeAlign: 'INSIDE',
      strokesIncludedInLayout: false,
      dashPattern: [3, 2]
    }
  },
  {
    name: 'border weights per side',
    fields: {
      strokes: [{ ...solid(), weight: 4, align: 'INSIDE' }],
      strokeWeight: 4,
      strokesIncludedInLayout: true,
      independentStrokeWeights: true,
      borderTopWeight: 1,
      borderRightWeight: 2,
      borderBottomWeight: 3,
      borderLeftWeight: 4
    }
  },
  {
    name: 'drop shadow and layer blur',
    fields: {
      effects: [
        {
          type: 'DROP_SHADOW',
          color: { r: 0, g: 0, b: 0, a: 0.25 },
          offset: { x: 0, y: 4 },
          radius: 8,
          spread: 0,
          visible: true
        },
        {
          type: 'LAYER_BLUR',
          color: { r: 0, g: 0, b: 0, a: 0 },
          offset: { x: 0, y: 0 },
          radius: 6,
          spread: 0,
          visible: true
        }
      ]
    }
  },
  { name: 'opacity and blend mode', fields: { opacity: 0.5, blendMode: 'MULTIPLY' } },
  { name: 'one corner radius', fields: { cornerRadius: 8 } },
  {
    name: 'independent corners',
    fields: {
      independentCorners: true,
      topLeftRadius: 4,
      topRightRadius: 8,
      bottomRightRadius: 12,
      bottomLeftRadius: 16
    }
  },
  { name: 'clip content', fields: { clipsContent: true } },
  { name: 'rotation', fields: { rotation: 15 } },
  { name: 'right to left', fields: { layoutDirection: 'RTL' } },
  {
    name: 'column layout',
    fields: {
      layoutMode: 'VERTICAL',
      primaryAxisAlign: 'SPACE_BETWEEN',
      counterAxisAlign: 'CENTER',
      itemSpacing: 8,
      paddingTop: 1,
      paddingRight: 2,
      paddingBottom: 3,
      paddingLeft: 4
    }
  },
  {
    name: 'wrapped row',
    fields: {
      ...row,
      layoutWrap: 'WRAP',
      primaryAxisAlign: 'MAX',
      counterAxisAlign: 'MIN',
      itemSpacing: 8,
      counterAxisSpacing: 12,
      paddingTop: 16,
      paddingRight: 16,
      paddingBottom: 16,
      paddingLeft: 16
    }
  },
  {
    name: 'text style',
    type: 'TEXT',
    fields: {
      fills: [solid()],
      fontFamily: 'Inter',
      fontSize: 18,
      fontWeight: 600,
      italic: true,
      lineHeight: 24,
      letterSpacing: 0.5,
      textAlignHorizontal: 'CENTER',
      textDecoration: 'UNDERLINE',
      textCase: 'UPPER',
      opacity: 0.8
    }
  },
  {
    name: 'auto-width text',
    type: 'TEXT',
    fields: { textAutoResize: 'WIDTH_AND_HEIGHT' }
  },
  {
    name: 'fixed-width text',
    type: 'TEXT',
    fields: { width: 240, textAutoResize: 'HEIGHT' }
  },
  {
    name: 'one truncated line',
    type: 'TEXT',
    fields: { width: 240, textAutoResize: 'HEIGHT', maxLines: 1, textTruncation: 'ENDING' }
  },
  {
    name: 'three clamped lines',
    type: 'TEXT',
    fields: { width: 240, textAutoResize: 'HEIGHT', maxLines: 3, textTruncation: 'ENDING' }
  }
]

/** Fields compare at the precision CSS keeps, so 0.2 read from a color is 0.2. */
function rounded(value: unknown): unknown {
  return JSON.parse(
    JSON.stringify(value, (_key, field: unknown) =>
      typeof field === 'number' ? Math.round(field * 1000) / 1000 : field
    )
  ) as unknown
}

function layer(graph: SceneGraph, type: NodeType, parentId: string, fields: Partial<SceneNode>) {
  return graph.createNode(type, parentId, { width: 100, height: 100, ...fields })
}

/** Writes a layer's CSS as the projection does, then reads it into a new layer of its kind. */
function roundTrip({ type = 'FRAME', fields, parent: parentFields }: Sample) {
  const graph = new SceneGraph()
  const page = graph.getPages()[0]
  const parent = parentFields ? layer(graph, 'FRAME', page.id, parentFields) : undefined
  const node = layer(graph, type, parent?.id ?? page.id, fields)
  const style = writeLayerStyle(node, { parent, css: (_field, literal) => literal })

  const read = graph.createNode(type, parent?.id ?? page.id, {})
  readLayerStyle(read, style, { projected: { parent } })
  return { style, read }
}

describe('CSS mapping table', () => {
  for (const sample of SAMPLES) {
    it(`reads back ${sample.name}`, () => {
      const { style, read } = roundTrip(sample)
      for (const [field, value] of Object.entries(sample.fields)) {
        const actual = read[field as keyof SceneNode]
        expect({ field, value: rounded(actual), style }).toEqual({
          field,
          value: rounded(value),
          style
        })
      }
    })
  }
})
