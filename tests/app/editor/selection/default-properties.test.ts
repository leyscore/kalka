import { describe, expect, test } from 'bun:test'

import type { DefaultLayerProperties } from '@kalka/core/editor'
import type { Fill, Stroke } from '@kalka/scene-graph'

import {
  defaultPropertiesToCSS,
  storedDefaultProperties
} from '@/app/editor/selection/default-properties'
import { parseAppPreferences } from '@/app/settings/preferences/store'

const BLUE: Fill = { type: 'SOLID', color: { r: 0, g: 0, b: 1, a: 1 }, opacity: 1, visible: true }
const RED: Stroke = {
  type: 'SOLID',
  color: { r: 1, g: 0, b: 0, a: 1 },
  weight: 4,
  opacity: 1,
  visible: true,
  align: 'INSIDE'
}

describe('default properties kept with the preferences', () => {
  test('a shape look comes back from the CSS it is kept as', () => {
    const defaults: DefaultLayerProperties = {
      shape: { fills: [BLUE], strokes: [RED], strokeWeight: 4, opacity: 0.5 },
      text: null
    }
    const css = defaultPropertiesToCSS(defaults)
    expect(css.text).toBeNull()
    const restored = storedDefaultProperties(css)?.shape
    expect(restored?.fills).toEqual([BLUE])
    expect(restored?.opacity).toBe(0.5)
    expect(restored?.strokeWeight).toBe(4)
    expect(restored?.strokes?.[0]?.color).toEqual(RED.color)
  })

  test('a text look keeps its type settings', () => {
    const css = defaultPropertiesToCSS({
      shape: null,
      text: { fontFamily: 'Georgia', fontSize: 32, fontWeight: 700, italic: true }
    })
    expect(storedDefaultProperties(css)?.text).toMatchObject({
      fontFamily: 'Georgia',
      fontSize: 32,
      fontWeight: 700,
      italic: true
    })
  })

  test('nothing is restored when nothing was set, and bad stored values fall back to unset', () => {
    expect(storedDefaultProperties({ shape: null, text: null })).toBeUndefined()
    const parsed = parseAppPreferences({
      editing: { defaultProperties: { shape: { color: 3 }, text: 'bold' } }
    })
    expect(parsed.editing.defaultProperties).toEqual({ shape: null, text: null })
  })
})
