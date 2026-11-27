import { describe, expect, test } from 'bun:test'

import { SceneGraph } from '@kalka/scene-graph'
import {
  BOX_PROPERTIES,
  cssWrite,
  layerCSS,
  TEXT_PROPERTIES,
  writeLayerStyle
} from '@kalka/scene-graph/css-model'

import { SAMPLES } from './samples'

const literal = (_field: string, value: string) => value

function traced<T extends object>(target: T, into: Set<string>): T {
  return new Proxy(target, {
    get(object, key, receiver) {
      if (typeof key === 'string') into.add(key)
      return Reflect.get(object, key, receiver)
    }
  })
}

function graphWithPage() {
  const graph = new SceneGraph()
  return { graph, page: graph.getPages()[0] }
}

function place({ type = 'FRAME', fields, parent: parentFields }: (typeof SAMPLES)[number]) {
  const { graph, page } = graphWithPage()
  const parent = parentFields ? graph.createNode('FRAME', page.id, parentFields) : undefined
  return { graph, parent, node: graph.createNode(type, parent?.id ?? page.id, fields) }
}

describe('a layer’s CSS', () => {
  test('a top-level layer is not placed inside its own artboard', () => {
    const { graph, page } = graphWithPage()
    const artboard = graph.createNode('FRAME', page.id, {
      x: 1560,
      y: 40,
      layoutPositioning: 'ABSOLUTE'
    })
    const css = layerCSS(artboard, page)
    expect(css.position).toBeUndefined()
    expect(css.left).toBeUndefined()
    expect(css.top).toBeUndefined()

    const inner = graph.createNode('FRAME', artboard.id, {
      x: 12,
      y: 8,
      layoutPositioning: 'ABSOLUTE'
    })
    expect(layerCSS(inner, artboard)).toMatchObject({ position: 'absolute', left: '12px' })
  })

  test('each family names every field it writes CSS from', () => {
    for (const sample of SAMPLES) {
      const { node, parent } = place(sample)
      const families = node.type === 'TEXT' ? TEXT_PROPERTIES : BOX_PROPERTIES
      for (const family of families) {
        const read = new Set<string>()
        family.write?.({}, traced(node, read), { parent, css: literal })
        const missing = [...read].filter((key) => !family.fields.some((field) => field === key))
        expect({ family: family.name, missing }).toEqual({ family: family.name, missing: [] })
      }
    }
  })

  test('writing a layer’s CSS gives back its fields', () => {
    for (const sample of SAMPLES) {
      const { graph, node, parent } = place(sample)
      const css = writeLayerStyle(node, { parent, css: literal })
      const blank = graph.createNode(node.type, parent?.id ?? graph.getPages()[0].id, {})
      const changes = cssWrite(blank, parent, css)
      expect({ sample: sample.name, style: changes.style }).toEqual({
        sample: sample.name,
        style: {}
      })
      for (const [field, value] of Object.entries(sample.fields))
        expect({ field, value: Reflect.get({ ...blank, ...changes }, field) }).toEqual({
          field,
          value: value as unknown
        })
    }
  })

  test('CSS the fields cannot write back stays as written, and wins', () => {
    const { graph, page } = graphWithPage()
    const card = graph.createNode('FRAME', page.id, { width: 120, height: 40 })
    graph.updateNode(
      card.id,
      cssWrite(card, page, {
        width: '50%',
        height: '40px',
        padding: '1rem',
        opacity: '0.5',
        cursor: 'pointer'
      })
    )
    expect(card.opacity).toBe(0.5)
    expect(card.height).toBe(40)
    // A percentage is no size the fields hold: layout measures it.
    expect(card.width).toBe(120)
    expect(card.style).toEqual({ width: '50%', padding: '1rem', cursor: 'pointer' })
    expect(layerCSS(card, page)).toMatchObject({ width: '50%', opacity: '0.5', cursor: 'pointer' })
  })

  test('a field set afterwards replaces the CSS written for it, and only that', () => {
    const { graph, page } = graphWithPage()
    const card = graph.createNode('FRAME', page.id, {
      style: { width: '50%', cursor: 'pointer', 'border-radius': '1rem' }
    })
    graph.updateNode(card.id, { width: 200 })
    expect(card.style).toEqual({ cursor: 'pointer', 'border-radius': '1rem' })
    expect(layerCSS(card, page).width).toBe('200px')
  })

  test('measured sizes stay when the CSS leaves them to layout', () => {
    const { graph, page } = graphWithPage()
    const row = graph.createNode('FRAME', page.id, {
      layoutMode: 'HORIZONTAL',
      primaryAxisSizing: 'HUG',
      counterAxisSizing: 'HUG',
      width: 236,
      height: 48
    })
    const changes = cssWrite(row, page, { display: 'flex', gap: '12px' })
    expect(changes.itemSpacing).toBe(12)
    expect('width' in changes).toBe(false)
    expect('height' in changes).toBe(false)
  })
})

describe('a shorthand an imported page wrote', () => {
  test('gives way to the fill written in its place', () => {
    const { graph, page } = graphWithPage()
    const button = graph.createNode('FRAME', page.id, {
      style: { background: '#38bdf8', padding: '12px 24px' }
    })
    graph.updateNode(button.id, {
      fills: [{ type: 'SOLID', color: { r: 1, g: 0.5, b: 0, a: 1 }, opacity: 1, visible: true }]
    })
    const node = graph.getNode(button.id)
    if (!node) throw new Error('missing layer')
    expect(node.style.background).toBeUndefined()
    expect(layerCSS(node, undefined)['background-color']).toBeDefined()
  })

  test('a shorthand of another family stays as written', () => {
    const { graph, page } = graphWithPage()
    const button = graph.createNode('FRAME', page.id, { style: { padding: '12px 24px' } })
    graph.updateNode(button.id, {
      fills: [{ type: 'SOLID', color: { r: 1, g: 0.5, b: 0, a: 1 }, opacity: 1, visible: true }]
    })
    expect(graph.getNode(button.id)?.style.padding).toBe('12px 24px')
  })
})

describe('a grid that hugs', () => {
  test('leaves its width to its tracks', () => {
    const { graph, page } = graphWithPage()
    const grid = graph.createNode('FRAME', page.id, {
      layoutMode: 'GRID',
      width: 300,
      height: 200,
      gridTemplateColumns: [{ sizing: 'AUTO', value: 0 }],
      gridTemplateRows: [{ sizing: 'AUTO', value: 0 }],
      primaryAxisSizing: 'HUG',
      counterAxisSizing: 'HUG'
    })
    const css = layerCSS(grid, undefined)
    expect(css.width === undefined || css.width === 'max-content').toBe(true)
    expect(css.height).toBeUndefined()
  })
})
