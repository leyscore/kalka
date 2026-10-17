import { describe, expect, test } from 'bun:test'

import { SceneGraph, tokensFingerprint } from '@kalka/scene-graph'

function graphWithToken(): { graph: SceneGraph; variableId: string } {
  const graph = new SceneGraph()
  const collection = graph.createCollection('Colors')
  const variable = graph.createVariable('brand', 'COLOR', collection.id, {
    r: 1,
    g: 0,
    b: 0,
    a: 1
  })
  return { graph, variableId: variable.id }
}

describe('tokens fingerprint', () => {
  test('is short hex and stays the same while the tokens do', () => {
    const { graph } = graphWithToken()
    const first = tokensFingerprint(graph)
    expect(first).toMatch(/^[0-9a-f]{12}$/)
    expect(tokensFingerprint(graph)).toBe(first)
  })

  test('differs between a document with tokens and one without', () => {
    const { graph } = graphWithToken()
    expect(tokensFingerprint(graph)).not.toBe(tokensFingerprint(new SceneGraph()))
  })

  test('changes when a token is renamed or set to another value', () => {
    const { graph, variableId } = graphWithToken()
    const variable = graph.variables.get(variableId)
    if (!variable) throw new Error('Missing variable')
    const before = tokensFingerprint(graph)

    variable.name = 'accent'
    const renamed = tokensFingerprint(graph)
    expect(renamed).not.toBe(before)

    variable.valuesByMode = Object.fromEntries(
      Object.keys(variable.valuesByMode).map((modeId) => [modeId, { r: 0, g: 0, b: 1, a: 1 }])
    )
    expect(tokensFingerprint(graph)).not.toBe(renamed)
  })

  test('ignores key order and plugin data', () => {
    const { graph, variableId } = graphWithToken()
    const variable = graph.variables.get(variableId)
    if (!variable) throw new Error('Missing variable')
    const before = tokensFingerprint(graph)

    const { name, ...rest } = variable
    graph.variables.set(variableId, {
      ...rest,
      name,
      pluginData: [{ pluginId: 'kalka', key: 'note', value: 'x' }]
    })
    expect(tokensFingerprint(graph)).toBe(before)
  })
})
