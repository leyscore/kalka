import { describe, expect, test } from 'bun:test'

import { createAPI } from '../helpers'

describe('combineAsVariants', () => {
  test('wraps components into a COMPONENT_SET', () => {
    const api = createAPI()
    const a = api.createComponent()
    a.name = 'Button/Primary'
    a.resize(100, 40)
    const b = api.createComponent()
    b.name = 'Button/Secondary'
    b.resize(100, 40)

    const set = api.combineAsVariants([a, b])

    expect(set.type).toBe('COMPONENT_SET')
    expect(set.name).toBe('Button')
    expect(set.children.length).toBe(2)
    expect(set.children.map((c) => c.name).sort()).toEqual(['Primary', 'Secondary'])
  })

  test('derives variant property definitions from name segments', () => {
    const api = createAPI()
    const a = api.createComponent()
    a.name = 'State/Default'
    a.resize(100, 40)
    const b = api.createComponent()
    b.name = 'State/Hover'
    b.resize(100, 40)

    const set = api.combineAsVariants([a, b])
    const raw = api.graph.getNode(set.id)

    expect(raw?.componentPropertyDefinitions?.length).toBe(1)
    expect(raw?.componentPropertyDefinitions?.[0].name).toBe('Variant')
    expect(raw?.componentPropertyDefinitions?.[0].variantOptions?.sort()).toEqual([
      'Default',
      'Hover'
    ])
  })

  test('rejects fewer than 2 nodes', () => {
    const api = createAPI()
    const a = api.createComponent()
    expect(() => api.combineAsVariants([a])).toThrow()
  })

  test('rejects non-component nodes', () => {
    const api = createAPI()
    const a = api.createComponent()
    const b = api.createFrame()
    expect(() => api.combineAsVariants([a, b])).toThrow()
  })
})
