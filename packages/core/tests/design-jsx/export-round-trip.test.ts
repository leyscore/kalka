import { describe, expect, it } from 'bun:test'

import { renderJSX } from '@open-pencil/core/design-jsx'
import { sceneNodeToJSX } from '@open-pencil/design-jsx'
import { SceneGraph } from '@open-pencil/scene-graph'

import { getNodeOrThrow } from '../helpers/assert'

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
