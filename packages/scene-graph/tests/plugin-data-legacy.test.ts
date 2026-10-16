import { expect, test } from 'bun:test'

import { canonicalPluginId, KALKA_PLUGIN_ID } from '@kalka/scene-graph'

test('plugin data written under the names from before the rename reads as Kalka data', () => {
  expect(canonicalPluginId('open-pencil')).toBe(KALKA_PLUGIN_ID)
  expect(canonicalPluginId('open-pencil-dom-css')).toBe('kalka-dom-css')
  expect(canonicalPluginId('com.example.plugin')).toBe('com.example.plugin')
})
