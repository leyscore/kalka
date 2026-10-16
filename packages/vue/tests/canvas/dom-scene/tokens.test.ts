import { expect, test } from 'bun:test'

import { SceneGraph } from '@kalka/scene-graph'

import { CanvasTokens } from '#vue/canvas/dom-scene/tokens'

test('the canvas stylesheet follows variable values, and a rename re-projects layers', async () => {
  const graph = new SceneGraph()
  const brand = graph.createCollection('Brand')
  const accent = graph.createVariable('accent', 'COLOR', brand.id, { r: 0, g: 0, b: 1, a: 1 })
  const sheets: string[] = []
  let renamed = 0
  const tokens = new CanvasTokens(
    () => graph,
    (css) => sheets.push(css),
    () => renamed++
  )

  await tokens.sync()
  expect(sheets.at(-1)).toContain('--color-accent: #0000FF')

  await tokens.sync()
  expect(sheets).toHaveLength(1)

  accent.valuesByMode[brand.defaultModeId] = { r: 1, g: 0, b: 0, a: 1 }
  await tokens.sync()
  expect(sheets.at(-1)).toContain('--color-accent: #FF0000')
  expect(renamed).toBe(0)

  accent.name = 'brand/primary'
  await tokens.sync()
  expect(renamed).toBe(1)
  expect(tokens.references.names.get(accent.id)).toBe('color-brand-primary')
})
