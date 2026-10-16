import { expect, test } from 'bun:test'

import { SceneGraph } from '@kalka/scene-graph'

import { CanvasTokens } from '#vue/canvas/dom-scene/tokens'

async function settled() {
  await new Promise((resolve) => {
    setTimeout(resolve, 0)
  })
}

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

  tokens.sync()
  await settled()
  expect(sheets.at(-1)).toContain('--color-accent: #0000FF')

  tokens.sync()
  await settled()
  expect(sheets).toHaveLength(1)

  accent.valuesByMode[brand.defaultModeId] = { r: 1, g: 0, b: 0, a: 1 }
  tokens.sync()
  await settled()
  expect(sheets.at(-1)).toContain('--color-accent: #FF0000')
  expect(renamed).toBe(0)

  accent.name = 'brand/primary'
  tokens.sync()
  await settled()
  expect(renamed).toBe(1)
  expect(tokens.references.names.get(accent.id)).toBe('color-brand-primary')
})
