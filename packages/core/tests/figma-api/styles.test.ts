import { describe, expect, test } from 'bun:test'

import { FigmaAPI } from '@kalka/core/figma-api'
import { getSharedStyles, SceneGraph } from '@kalka/scene-graph'

const red = { r: 1, g: 0, b: 0 }
const blue = { r: 0, g: 0, b: 1 }

function setup() {
  const graph = new SceneGraph()
  const figma = new FigmaAPI(graph)
  return { graph, figma }
}

/** Scripts are untyped: they read and write styles as plain objects. */
function get(target: object, key: string): unknown {
  return Reflect.get(target, key)
}

describe('figma styles', () => {
  test('creates a paint style, lists it and finds it by id', () => {
    const { graph, figma } = setup()
    const style = figma.createPaintStyle()
    Reflect.set(style, 'name', 'Brand/Primary')
    Reflect.set(style, 'description', 'Buttons and links')
    Reflect.set(style, 'paints', [{ type: 'SOLID', color: red }])

    expect(get(style, 'type')).toBe('PAINT')
    expect(get(style, 'paints')).toMatchObject([{ type: 'SOLID', color: red, opacity: 1 }])
    expect(figma.getLocalPaintStyles().map((listed) => get(listed, 'id'))).toEqual([
      get(style, 'id')
    ])
    const found = figma.getStyleById(String(get(style, 'id')))
    expect(found && get(found, 'description')).toBe('Buttons and links')
    expect(getSharedStyles(graph, 'fill').map((listed) => listed.name)).toEqual(['Brand/Primary'])
  })

  test('linking a style gives a layer its values, and editing it changes the layer', async () => {
    const { figma } = setup()
    const style = figma.createPaintStyle()
    Reflect.set(style, 'paints', [{ type: 'SOLID', color: red }])
    const rect = figma.createRectangle()
    const id = String(get(style, 'id'))

    rect.fillStyleId = id
    expect(rect.fills).toMatchObject([{ color: red }])
    const setStroke = get(rect, 'setStrokeStyleIdAsync')
    if (typeof setStroke !== 'function') throw new Error('No setStrokeStyleIdAsync')
    await setStroke.call(rect, id)
    expect(rect.strokes).toMatchObject([{ color: red }])

    Reflect.set(style, 'paints', [{ type: 'SOLID', color: blue }])
    expect(rect.fills).toMatchObject([{ color: blue }])
    expect(rect.strokes).toMatchObject([{ color: blue }])
    const consumers = get(style, 'consumers')
    expect(Array.isArray(consumers) && consumers[0]?.fields).toEqual([
      'fillStyleId',
      'strokeStyleId'
    ])
  })

  test('text, effect and grid styles hold their values', async () => {
    const { figma } = setup()
    const text = figma.createTextStyle()
    Reflect.set(text, 'fontSize', 32)
    const effect = figma.createEffectStyle()
    Reflect.set(effect, 'effects', [{ type: 'LAYER_BLUR', radius: 4, visible: true }])
    const grid = figma.createGridStyle()
    Reflect.set(grid, 'layoutGrids', [{ pattern: 'GRID', sectionSize: 8, visible: true }])

    const title = figma.createText()
    const setText = get(title, 'setTextStyleIdAsync')
    if (typeof setText !== 'function') throw new Error('No setTextStyleIdAsync')
    await setText.call(title, get(text, 'id'))
    expect(title.fontSize).toBe(32)
    expect(get(effect, 'effects')).toMatchObject([{ type: 'LAYER_BLUR', radius: 4 }])
    expect(get(grid, 'layoutGrids')).toMatchObject([{ pattern: 'GRID', sectionSize: 8 }])
    expect((await figma.getLocalTextStylesAsync()).length).toBe(1)
    expect(figma.getLocalEffectStyles().length).toBe(1)
    expect(figma.getLocalGridStyles().length).toBe(1)
  })

  test('removing a style keeps its values on the layers that used it', () => {
    const { figma } = setup()
    const style = figma.createPaintStyle()
    Reflect.set(style, 'paints', [{ type: 'SOLID', color: red }])
    const rect = figma.createRectangle()
    rect.fillStyleId = String(get(style, 'id'))

    const remove = get(style, 'remove')
    if (typeof remove !== 'function') throw new Error('No remove')
    remove.call(style)
    expect(figma.getLocalPaintStyles()).toEqual([])
    expect(rect.fillStyleId).toBe('')
    expect(rect.fills).toMatchObject([{ color: red }])
  })

  test('moves a style after another, or first', () => {
    const { figma } = setup()
    const names = ['A', 'B', 'C'].map((name) => {
      const style = figma.createPaintStyle()
      Reflect.set(style, 'name', name)
      return style
    })
    const listed = () => figma.getLocalPaintStyles().map((style) => get(style, 'name'))

    figma.moveLocalPaintStyleAfter(names[0], names[2])
    expect(listed()).toEqual(['B', 'C', 'A'])
    figma.moveLocalPaintStyleAfter(names[0], null)
    expect(listed()).toEqual(['A', 'B', 'C'])
  })
})
